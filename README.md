# @hanfani/core

Headless engine and types for the Hanfani agent framework.

Pure logic — no I/O, no server, no UI. It defines what a workflow and an agent
*are* and enforces one rule:

> **The agent proposes, a human approves, the server acts.**

`defineAgent` refuses any side effect that isn't behind a human-approval gate,
and `providerConformanceChecks` proves any model provider honors that at runtime.

## Install

```bash
pnpm add @hanfani/core
```

## Quick look

```ts
import { defineAgent } from '@hanfani/core'

const reply = defineAgent({
  id: 'reply',
  name: 'Reply',
  provider: 'claude',
  instructions: 'Draft a reply for the human to approve.',
  tools: ['saveDraft'],
  approvals: ['saveDraft'], // saveDraft only fires after a human approves
  renders: { saveDraft: 'DraftCard' },
})
```

## Dependencies

Depends on [`@ag-ui/client`](https://github.com/ag-ui-protocol/ag-ui)
(event/message types) and [`zod`](https://github.com/colinhacks/zod) (schemas),
both declared as regular dependencies.

## Docs

Full API reference and guides are coming soon in the Hanfani framework docs.

## License

[MIT](./LICENSE) License © [Fruitizz](https://github.com/fruitizz)
