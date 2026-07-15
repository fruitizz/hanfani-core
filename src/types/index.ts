import type { BaseEvent, Message, RunAgentInput, ToolCall } from '@ag-ui/client'
import type { z } from 'zod'
import type { AgentDefinition } from '../agent/defineAgent.js'

// Re-export the two @ag-ui/client types that appear in this package's public API,
// so consumers can import them from @hanfani/core directly.
export type { Message, ToolCall }

/** Lifecycle phase of a work item. */
export type Phase = 'queued' | 'active' | 'awaiting_human' | 'terminal'

/** Terminal (and running) outcome of a work item. */
export type Outcome =
  | 'running'
  | 'done'
  | 'stopped'
  | 'rejected'
  | 'error'
  | 'superseded'
  | 'reset'
  | 'dismissed'

/** Whether an agent accepts external input or only runs as a downstream worker. */
export type AgentRole = 'input' | 'worker'

/** Result of a health probe. */
export type HealthCheck =
  | { ok: true; detail?: string }
  | { ok: false; error: string; hint: string }

/** How an integration authenticates. */
export type AuthSpec =
  | { kind: 'none' }
  | { kind: 'apiKey' }
  | { kind: 'oauth2'; provider: string; scopes: string[] }
  | { kind: string; [key: string]: unknown }

/** A credential resolved for a given integration + connection. */
export type ResolvedCredential =
  | { kind: 'apiKey'; apiKey: string }
  | { kind: 'oauth2'; accessToken: string; refreshToken?: string; expiresAt?: number; raw?: unknown }
  | { kind: string; [key: string]: unknown }

export type CredentialResolver = (ctx: {
  integration: string
  connectionId: string
  auth: AuthSpec
}) => Promise<ResolvedCredential | null>

/** What a prompt strategy decides to do when a gate resolves. */
export type ResumeOutcome =
  | { kind: 'prompt'; text: string }
  | { kind: 'message'; text: string }
  | null

export interface ResumeHandle {
  runId: string
  input: RunAgentInput
}

export interface GateResolution {
  gateId: string
  decision: 'approved' | 'rejected'
  form?: Record<string, unknown>
  comment?: string
  executedResult?: Record<string, unknown>
}

export interface PromptStrategy {
  buildFirst(input: RunAgentInput): string
  buildResume?(args: Record<string, unknown>, executedResult?: Record<string, unknown>): ResumeOutcome
}

export interface Provider {
  run(input: RunAgentInput): AsyncIterable<BaseEvent>
  resume?(handle: ResumeHandle, resolution: GateResolution): AsyncIterable<BaseEvent>
}

export interface ProviderConfig {
  approvalNames: readonly string[]
  surfaceTools: readonly string[]
  allowedTools: readonly string[]
  prompts: PromptStrategy
  instructions: string
  agentId: string
}

export type ProviderFactory = (config: ProviderConfig) => Provider

export interface ProviderRegistry {
  resolve(name: string): ProviderFactory
}

export interface Lifecycle {
  phase: Phase
  outcome: Outcome
  isLive: boolean
  isVisible: boolean
  covers: boolean
}

/** Where a produced payload should be delivered. */
export type Destination =
  | { kind: 'agent'; agentId: string }
  | { kind: 'contract'; workflow: string; input: string }

export type DeliveryResult =
  | { ok: true; instanceId: string; targetWorkflow?: string }
  | { ok: false; error: string }

/** The consequential side effect bound to an approved tool. Runs on the server only. */
export type EffectFn = (
  form: Record<string, unknown>,
  ctx: { workItemId: string; gateId: string },
) => Promise<Record<string, unknown>>

export type WorkflowAgent = {
  agent: AgentDefinition
  role: AgentRole
}

export type WorkflowConnection = {
  integration: string
  connection?: string
  provider: string
}

export type WorkflowInput = {
  name: string
  schema: z.ZodTypeAny
  agentId: string
}

export type WorkflowDescriptor = {
  id: string
  label: string
  iconName: string
  agents: WorkflowAgent[]
  entryAgentId: string
  inputs: WorkflowInput[]
  prompt?: string
  connections?: WorkflowConnection[]
  rerun?: 'refresh' | 'history'
  resetOnStart?: boolean
}

export type ReadResult<T> = T | { error: string }

export type BatchActionResult =
  | { done: string[]; failed: { messageId: string; error: string }[] }
  | { error: string }
