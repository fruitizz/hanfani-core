import { EventType } from '@ag-ui/client'
import type { BaseEvent, RunAgentInput } from '@ag-ui/client'
import { readGateOpened, type GateOpenedValue } from './gate.js'
import type { GateResolution, Provider, ResumeHandle } from './types.js'

export interface ConformanceScenario {
  approvalNames: readonly string[]
  surfaceTools: readonly string[]
  turn1Input: RunAgentInput
  approved: { handle: ResumeHandle; resolution: GateResolution }
  rejected: { handle: ResumeHandle; resolution: GateResolution }
}

export interface ConformanceCheck {
  name: string
  run(makeProvider: () => Provider, scenario: ConformanceScenario): Promise<void>
}

async function collect(events: AsyncIterable<BaseEvent>): Promise<BaseEvent[]> {
  const out: BaseEvent[] = []
  for await (const e of events) out.push(e)
  return out
}

function gatesIn(events: readonly BaseEvent[]): GateOpenedValue[] {
  const out: GateOpenedValue[] = []
  for (const e of events) {
    const gate = readGateOpened(e)
    if (gate) out.push(gate)
  }
  return out
}

function assert(cond: unknown, message: string): asserts cond {
  if (!cond) throw new Error(`conformance: ${message}`)
}

type WithToolCall = BaseEvent & { toolCallId?: string; toolCallName?: string }

/**
 * A provider-agnostic conformance suite: any Provider implementation can be run
 * against these checks to prove it honours the framework's gate/effect contract.
 */
export const providerConformanceChecks: ConformanceCheck[] = [
  {
    name: 'turn 1 opens exactly one approval gate matching an approval tool',
    async run(makeProvider, scenario) {
      const events = await collect(makeProvider().run(scenario.turn1Input))
      const gates = gatesIn(events)
      assert(gates.length === 1, `expected 1 GATE_OPENED, got ${gates.length}`)
      const gate = gates[0]!
      assert(
        scenario.approvalNames.includes(gate.toolName),
        `gate toolName "${gate.toolName}" is not an approval`,
      )
      const startIds = events
        .filter((e) => e.type === EventType.TOOL_CALL_START)
        .map((e) => (e as WithToolCall).toolCallId)
      assert(startIds.includes(gate.toolCallId), 'gate toolCallId has no matching TOOL_CALL_START')
    },
  },
  {
    name: 'resume(approved) completes and re-opens no gate',
    async run(makeProvider, scenario) {
      const provider = makeProvider()
      assert(typeof provider.resume === 'function', 'provider does not implement resume()')
      const events = await collect(provider.resume!(scenario.approved.handle, scenario.approved.resolution))
      assert(gatesIn(events).length === 0, 'resume(approved) re-opened a gate')
      assert(events.length > 0, 'resume(approved) produced no events')
    },
  },
  {
    name: 'resume(rejected) terminates and re-opens no gate',
    async run(makeProvider, scenario) {
      const provider = makeProvider()
      assert(typeof provider.resume === 'function', 'provider does not implement resume()')
      const events = await collect(provider.resume!(scenario.rejected.handle, scenario.rejected.resolution))
      assert(gatesIn(events).length === 0, 'resume(rejected) re-opened a gate')
      assert(events.length > 0, 'resume(rejected) produced no events')
      assert(
        events.filter((e) => e.type === EventType.TOOL_CALL_START).length === 0,
        'resume(rejected) emitted a tool call (possible effect)',
      )
    },
  },
  {
    name: 'only surfaced tools appear as tool calls on turn 1',
    async run(makeProvider, scenario) {
      const events = await collect(makeProvider().run(scenario.turn1Input))
      const toolNames = events
        .filter((e) => e.type === EventType.TOOL_CALL_START)
        .map((e) => (e as WithToolCall).toolCallName)
      for (const name of toolNames) {
        assert(
          name !== undefined && scenario.surfaceTools.includes(name),
          `surfaced an undeclared tool: "${name}"`,
        )
      }
    },
  },
  {
    name: 'every TOOL_CALL_START on turn 1 has a matching TOOL_CALL_END with the same toolCallId',
    async run(makeProvider, scenario) {
      const events = await collect(makeProvider().run(scenario.turn1Input))
      const startIds = events
        .filter((e) => e.type === EventType.TOOL_CALL_START)
        .map((e) => (e as WithToolCall).toolCallId)
      const endIds = new Set(
        events
          .filter((e) => e.type === EventType.TOOL_CALL_END)
          .map((e) => (e as WithToolCall).toolCallId),
      )
      for (const id of startIds) {
        assert(endIds.has(id), `TOOL_CALL_START id "${id}" has no matching TOOL_CALL_END`)
      }
    },
  },
]
