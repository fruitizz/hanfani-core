# @hanfani/core

[![build status][build-src]][build-href]
[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

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

An auto-generated API reference is available at
[jsdocs.io](https://www.jsdocs.io/package/@hanfani/core). Full guides are coming
soon in the Hanfani framework docs.

## License

[MIT](./LICENSE) License © [Fruitizz](https://github.com/fruitizz)

<!-- Badges -->

[build-src]: https://img.shields.io/github/actions/workflow/status/fruitizz/hanfani-core/ci.yml?branch=main&style=flat&colorA=080f12&colorB=1fa669&label=build
[build-href]: https://github.com/fruitizz/hanfani-core/actions/workflows/ci.yml
[npm-version-src]: https://img.shields.io/npm/v/@hanfani/core?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/@hanfani/core
[npm-downloads-src]: https://img.shields.io/npm/dm/@hanfani/core?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/@hanfani/core
[bundle-src]: https://img.shields.io/bundlephobia/minzip/@hanfani/core?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=@hanfani/core
[license-src]: https://img.shields.io/github/license/fruitizz/hanfani-core.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/fruitizz/hanfani-core/blob/main/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/@hanfani/core
