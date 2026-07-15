// @hanfani/core — headless engine and types for the Hanfani agent framework.
//
// The one invariant this package encodes: an agent proposes, a human approves,
// the server acts. `defineAgent` refuses any effect that isn't gated behind an
// approval; the conformance suite proves providers honour that at runtime.

export type { Message, ToolCall } from '@ag-ui/client'

export {
  AgentDefinitionSchema,
  defineAgent,
  type AgentDefinition,
  type AgentDefinitionInput,
} from './agent/index.js'

export { defineWorkflow, instanceId, resolveDelivery } from './workflow/index.js'

export {
  definePrompt,
  defineProviders,
  composeInstructions,
  providerConformanceChecks,
  type PromptSpec,
  type ConformanceCheck,
  type ConformanceScenario,
} from './provider/index.js'

export {
  approvalResolved,
  hasPendingApproval,
  isAssistant,
  isToolMessage,
  lastApprovalArgs,
  pairToolResults,
  resolvedApprovalCount,
  toolCallsOf,
  foldEventsToMessages,
  type AssistantMessage,
  type ToolMessage,
} from './messages/index.js'

export {
  decodeHandoff,
  encodeHandoff,
  HandoffPayloadSchema,
  TicketHandoffPayloadSchema,
  handoffNote,
  type HandoffPayload,
  type TicketHandoffPayload,
  type HandoffNoteValue,
} from './handoff/index.js'

export {
  GATE_OPENED,
  gateOpened,
  GateOpenedValueSchema,
  readGateOpened,
  type GateOpenedValue,
} from './gate/index.js'

export {
  LIFECYCLE_NOTE_TEXT,
  lifecycleNote,
  hasLiveDescendant,
  lifecycle,
  type LifecycleNoteValue,
} from './lifecycle/index.js'

export { aggregateHealth, isOk, isOAuth2 } from './integration/index.js'

export type {
  AgentRole,
  AuthSpec,
  BatchActionResult,
  CredentialResolver,
  DeliveryResult,
  Destination,
  EffectFn,
  GateResolution,
  HealthCheck,
  Lifecycle,
  Outcome,
  Phase,
  PromptStrategy,
  Provider,
  ProviderConfig,
  ProviderFactory,
  ProviderRegistry,
  ReadResult,
  ResolvedCredential,
  ResumeHandle,
  ResumeOutcome,
  WorkflowAgent,
  WorkflowConnection,
  WorkflowDescriptor,
  WorkflowInput,
} from './types/index.js'
