import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import {
  composeInstructions,
  defineAgent,
  defineProviders,
  defineWorkflow,
  hasLiveDescendant,
  instanceId,
  lifecycle,
  resolveDelivery,
  type WorkflowDescriptor,
} from '../src/index.js'

describe('defineAgent', () => {
  const base = {
    id: 'a',
    name: 'A',
    provider: 'claude',
    instructions: 'do things',
    tools: ['saveDraft'],
    approvals: ['saveDraft'],
    renders: { saveDraft: 'DraftCard' },
  }

  it('applies defaults and parses a valid agent', () => {
    const agent = defineAgent(base)
    expect(agent.maxInstances).toBe(1)
    expect(agent.effects).toEqual([])
    expect(agent.readonly).toEqual([])
    expect(agent.dispatches).toEqual([])
  })

  // NB: these throw a ZodError whose `message` is JSON with escaped quotes, so
  // matchers use `.*` across the quoted name rather than literal quotes.
  it('rejects an approval that is not a declared tool', () => {
    expect(() => defineAgent({ ...base, approvals: ['ghost'], renders: {} })).toThrow(
      /approval .* is not declared in tools/,
    )
  })

  it('rejects a render key that is not a declared tool', () => {
    expect(() => defineAgent({ ...base, renders: { ghost: 'X' } })).toThrow(
      /render key .* is not declared in tools/,
    )
  })

  it('rejects an effect that is not an approval (the core safety invariant)', () => {
    expect(() =>
      defineAgent({ ...base, tools: ['saveDraft', 'send'], effects: ['send'] }),
    ).toThrow(/effect .* is not an approval/)
  })
})

describe('instanceId + composeInstructions', () => {
  it('joins workflow and agent ids', () => {
    expect(instanceId('email-inbox', 'reply')).toBe('email-inbox__reply')
  })

  it('prepends a workflow prompt when present, else returns instructions as-is', () => {
    expect(composeInstructions('  BE SAFE ', 'reply politely')).toBe('BE SAFE\n\nreply politely')
    expect(composeInstructions(undefined, 'reply politely')).toBe('reply politely')
    expect(composeInstructions('   ', 'reply politely')).toBe('reply politely')
  })
})

describe('lifecycle', () => {
  it('queued items are never visible', () => {
    expect(lifecycle('queued', 'running', true, false).isVisible).toBe(false)
  })

  it('live phases are visible and covering', () => {
    const l = lifecycle('active', 'running', false, false)
    expect(l.isLive).toBe(true)
    expect(l.isVisible).toBe(true)
    expect(l.covers).toBe(true)
  })

  it('silent terminal outcomes are hidden', () => {
    expect(lifecycle('terminal', 'superseded', true, true).isVisible).toBe(false)
  })

  it('a terminal done item with a card is visible', () => {
    expect(lifecycle('terminal', 'done', true, false).isVisible).toBe(true)
  })
})

describe('hasLiveDescendant', () => {
  it('flags ancestors of a live node', () => {
    const rows = [
      { id: 'root', parentId: null, phase: 'terminal' as const },
      { id: 'mid', parentId: 'root', phase: 'terminal' as const },
      { id: 'leaf', parentId: 'mid', phase: 'active' as const },
    ]
    const live = hasLiveDescendant(rows)
    expect(live.has('root')).toBe(true)
    expect(live.has('mid')).toBe(true)
    expect(live.has('leaf')).toBe(false)
  })
})

describe('defineWorkflow', () => {
  const agent = (id: string, role: 'input' | 'worker', handoffs: string[] = []) => ({
    role,
    agent: defineAgent({
      id,
      name: id,
      provider: 'claude',
      instructions: 'x',
      tools: [],
      approvals: [],
      renders: {},
      handoffs,
    }),
  })

  const wf = (over: Partial<WorkflowDescriptor> = {}): WorkflowDescriptor => ({
    id: 'wf',
    label: 'WF',
    iconName: 'bot',
    agents: [agent('in', 'input', ['work']), agent('work', 'worker')],
    entryAgentId: 'in',
    inputs: [{ name: 'start', schema: z.object({ q: z.string() }), agentId: 'in' }],
    ...over,
  })

  it('accepts a consistent workflow', () => {
    expect(defineWorkflow(wf()).id).toBe('wf')
  })

  it('rejects an entry agent that is not role:input', () => {
    expect(() => defineWorkflow(wf({ entryAgentId: 'work' }))).toThrow(/is not a role:input agent/)
  })

  it('rejects a handoff to an unknown agent', () => {
    expect(() =>
      defineWorkflow(wf({ agents: [agent('in', 'input', ['ghost'])], inputs: [] })),
    ).toThrow(/hands off to "ghost"/)
  })
})

describe('resolveDelivery', () => {
  const workflows: WorkflowDescriptor[] = [
    {
      id: 'target',
      label: 'T',
      iconName: 'bot',
      agents: [],
      entryAgentId: 'in',
      inputs: [{ name: 'lead', schema: z.object({ email: z.string() }), agentId: 'in' }],
    },
  ]

  it('resolves an agent destination directly', () => {
    expect(resolveDelivery(workflows, 'origin', { kind: 'agent', agentId: 'reply' }, null)).toEqual({
      ok: true,
      instanceId: 'origin__reply',
    })
  })

  it('validates a contract payload against the target input schema', () => {
    const ok = resolveDelivery(
      workflows,
      'origin',
      { kind: 'contract', workflow: 'target', input: 'lead' },
      { email: 'a@b.com' },
    )
    expect(ok).toEqual({ ok: true, instanceId: 'target__in', targetWorkflow: 'target' })

    const bad = resolveDelivery(
      workflows,
      'origin',
      { kind: 'contract', workflow: 'target', input: 'lead' },
      { email: 123 },
    )
    expect(bad.ok).toBe(false)
  })

  it('errors on unknown workflow / input', () => {
    expect(
      resolveDelivery(workflows, 'o', { kind: 'contract', workflow: 'nope', input: 'x' }, {}),
    ).toEqual({ ok: false, error: 'unknown workflow "nope"' })
  })
})

describe('defineProviders', () => {
  it('resolves known providers and throws on unknown', () => {
    const registry = defineProviders({
      claude: () => ({ run: async function* () {} }),
    })
    expect(typeof registry.resolve('claude')).toBe('function')
    expect(() => registry.resolve('ghost')).toThrow(/Unknown provider: ghost/)
  })
})
