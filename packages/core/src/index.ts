// @hanfani/core — headless engine and types for the Hanfani agent framework.
//
// The one invariant this package encodes: an agent proposes, a human approves,
// the server acts. `defineAgent` refuses any effect that isn't gated behind an
// approval; the conformance suite proves providers honour that at runtime.

// Re-export the two @ag-ui/client types that appear in the public API.
export type { Message, ToolCall } from '@ag-ui/client'

export {
  AgentDefinitionSchema,
  defineAgent,
  type AgentDefinition,
  type AgentDefinitionInput,
} from './defineAgent.js'

export { defineWorkflow, instanceId } from './defineWorkflow.js'

export { definePrompt, type PromptSpec } from './definePrompt.js'

export { defineProviders } from './providers.js'

export { composeInstructions } from './prompt.js'

export {
  approvalResolved,
  hasPendingApproval,
  isAssistant,
  isToolMessage,
  lastApprovalArgs,
  pairToolResults,
  resolvedApprovalCount,
  toolCallsOf,
  type AssistantMessage,
  type ToolMessage,
} from './messages.js'

export {
  decodeHandoff,
  encodeHandoff,
  HandoffPayloadSchema,
  TicketHandoffPayloadSchema,
  type HandoffPayload,
  type TicketHandoffPayload,
} from './handoff.js'

export { handoffNote, type HandoffNoteValue } from './handoffNote.js'

export {
  GATE_OPENED,
  gateOpened,
  GateOpenedValueSchema,
  readGateOpened,
  type GateOpenedValue,
} from './gate.js'

export { LIFECYCLE_NOTE_TEXT, lifecycleNote, type LifecycleNoteValue } from './lifecycleNote.js'

export { hasLiveDescendant, lifecycle } from './lifecycle.js'

export { foldEventsToMessages } from './fold.js'

export { resolveDelivery } from './delivery.js'

export {
  providerConformanceChecks,
  type ConformanceCheck,
  type ConformanceScenario,
} from './conformance.js'

export { aggregateHealth, isOk } from './integration.js'

export { isOAuth2 } from './integrationAuth.js'

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
} from './types.js'
