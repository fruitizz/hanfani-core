# @hanfani/core

Headless engine and types for the Hanfani agent framework.

Pure logic — no I/O, no server, no React. This is the layer that defines what a
workflow and an agent *are* and enforces the framework's one safety invariant:

> An agent proposes, a human approves, the server acts.

`defineAgent` refuses any `effect` that isn't also an `approval`, so a side
effect can never be wired to fire without a human gate. `providerConformanceChecks`
proves any provider honours that at runtime.

## Exports

- **Definitions:** `defineAgent`, `defineWorkflow`, `definePrompt`,
  `defineProviders`, `AgentDefinitionSchema`.
- **Messages:** `isAssistant`, `isToolMessage`, `toolCallsOf`,
  `hasPendingApproval`, `pairToolResults`, `lastApprovalArgs`,
  `resolvedApprovalCount`, `approvalResolved`.
- **Handoffs:** `encodeHandoff`, `decodeHandoff`, `handoffNote`,
  `HandoffPayloadSchema`, `TicketHandoffPayloadSchema`.
- **Gates & events:** `gateOpened`, `readGateOpened`, `GATE_OPENED`,
  `GateOpenedValueSchema`, `lifecycleNote`, `LIFECYCLE_NOTE_TEXT`,
  `foldEventsToMessages`.
- **Lifecycle & delivery:** `lifecycle`, `hasLiveDescendant`, `resolveDelivery`,
  `instanceId`, `composeInstructions`.
- **Providers & integration:** `providerConformanceChecks`, `aggregateHealth`,
  `isOk`, `isOAuth2`.
- Plus the full type surface (`WorkflowDescriptor`, `Outcome`, `Phase`,
  `Provider`, `EffectFn`, `AuthSpec`, `ResolvedCredential`, …).

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
