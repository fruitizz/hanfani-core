# @hanfani/core

Headless engine and types for the Hanfani agent framework.

Pure logic — no I/O, no server, no React. This is the layer that defines what a
workflow and an agent *are* and enforces the framework's one safety invariant:

> An agent proposes, a human approves, the server acts.

`defineAgent` refuses any `effect` that isn't also an `approval`, so a side
effect can never be wired to fire without a human gate. `providerConformanceChecks`
proves any provider honours that at runtime.

## Exports

### Definitions

| Export | Description |
| --- | --- |
| `defineAgent` | Validate and construct an agent definition; enforces that every `effect` is a gated `approval`. |
| `defineWorkflow` | Validate a workflow descriptor (unique agent ids, role:input entry agent, in-workflow handoffs, unique inputs) and return it. |
| `definePrompt` | Build a prompt strategy from `onStart` / `onInput` / `onResume` handlers. |
| `defineProviders` | Build a provider registry that resolves provider factories by name. |
| `AgentDefinitionSchema` | The Zod schema backing `defineAgent`. |

### Messages

| Export | Description |
| --- | --- |
| `isAssistant` | Type guard for assistant messages. |
| `isToolMessage` | Type guard for tool-result messages. |
| `toolCallsOf` | Extract the tool calls from a message. |
| `hasPendingApproval` | True when an approval tool was called but has no tool result yet. |
| `pairToolResults` | Map each tool result to the `toolCallId` it answers. |
| `lastApprovalArgs` | Parsed arguments of the most recent approval tool call, or `null`. |
| `resolvedApprovalCount` | How many approval calls have a matching tool result. |
| `approvalResolved` | True when at least one approval call has resolved. |

### Handoffs

| Export | Description |
| --- | --- |
| `encodeHandoff` | Encode a payload as a user message downstream agents can decode. |
| `decodeHandoff` | Decode and validate the latest handoff payload from run input. |
| `handoffNote` | Emit a handoff note event. |
| `HandoffPayloadSchema` | Zod schema for a generic thread/email handoff payload. |
| `TicketHandoffPayloadSchema` | Zod schema for a ticket/issue handoff payload. |

### Gates & events

| Export | Description |
| --- | --- |
| `gateOpened` | Emit the custom event that opens a human-approval gate. |
| `readGateOpened` | Read a `GATE_OPENED` value off an event, or `null`. |
| `GATE_OPENED` | The gate-opened custom event name constant. |
| `GateOpenedValueSchema` | Zod schema for a gate-opened value. |
| `lifecycleNote` | Emit a lifecycle note event. |
| `LIFECYCLE_NOTE_TEXT` | Human-readable label for each terminal outcome. |
| `foldEventsToMessages` | Fold an ag-ui event stream into a flat list of messages. |

### Lifecycle & delivery

| Export | Description |
| --- | --- |
| `lifecycle` | Derive display lifecycle (`isLive` / `isVisible` / `covers`) from phase + outcome. |
| `hasLiveDescendant` | Set of ids that have a live descendant in a parent/child tree. |
| `resolveDelivery` | Resolve where a payload should be delivered (agent or contract). |
| `instanceId` | Stable `workflow__agent` instance id. |
| `composeInstructions` | Prepend the workflow prompt to an agent's instructions. |

### Providers & integration

| Export | Description |
| --- | --- |
| `providerConformanceChecks` | Provider-agnostic suite proving a provider honours the gate/effect contract. |
| `aggregateHealth` | Return the first failing health check, or an ok result. |
| `isOk` | Narrow a `HealthCheck` to its ok variant. |
| `isOAuth2` | Narrow an `AuthSpec` to its oauth2 variant. |

Plus the full type surface: `WorkflowDescriptor`, `Outcome`, `Phase`, `Provider`,
`EffectFn`, `AuthSpec`, `ResolvedCredential`, and more.

## Build & test

Built with the native TypeScript 7 compiler (`tsc` / tsgo) — no bundler, no
compiler-API tooling, so nothing here breaks on the TS 7 upgrade.

```bash
pnpm build       # tsc -p tsconfig.build.json → dist/*.js + dist/*.d.ts
pnpm typecheck   # tsc -p tsconfig.json --noEmit
pnpm test        # vitest smoke suite
```

## Peer runtime

Depends on `@ag-ui/client` (event/message types) and `zod` (schemas). Both are
declared as regular dependencies.
