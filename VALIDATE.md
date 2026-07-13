# Validate @hanfani/core before publishing

This is a **fresh, owned reimplementation** of core — not a wrapper. Its public
API and behaviour were reconstructed from the upstream `.d.ts` contract and
verified. Still validate end-to-end on your machine before publishing.

> Already checked here: `tsc --noEmit` passes clean under TypeScript 6.0.3
> against the real `@ag-ui/client` and `zod`, and the runtime assertions in the
> smoke suite pass on the compiled output. Steps 1–3 reproduce that; step 4 is
> the real integration gate.

Paths assume the standalone repo at `~/Documents/startups/personal/hanfani-core`
and the app at `~/Documents/startups/personal/hanfani-inbox`.

## 1. Install + build

```bash
cd ~/Documents/startups/personal/hanfani-core
pnpm install                          # installs TypeScript 7.0.2 (native tsgo compiler)
pnpm build     # tsc → dist/*.js + dist/*.d.ts
```

> Build note: core is compiled with `tsc` (TypeScript 7's native compiler), not
> tsup. TS 7 removed the programmatic compiler API until 7.1, which breaks
> `tsup --dts` and similar tools — so declarations are emitted by `tsc` directly.
> Verified here: typecheck and emit both pass, and the runtime smoke assertions
> pass against the emitted `dist`.

## 2. Typecheck + unit tests

```bash
pnpm typecheck
pnpm test      # vitest smoke suite (defineAgent invariant, workflow validation, delivery, lifecycle, handoff round-trip)
```

## 3. Inspect the publishable artifact

```bash
pnpm pack                        # → hanfani-core-0.1.1.tgz
tar -tzf hanfani-core-0.1.1.tgz   # expect package/dist/* + package/src/* + package.json + README + LICENSE; NO test/
```

## 4. The real gate — drop it into the app in place of the alias

```bash
cd ~/Documents/startups/personal/hanfani-inbox
npm install "@hanfani/core@file:../hanfani-core/hanfani-core-0.1.1.tgz"
npm run typecheck
npm test
npm run demo          # click a full pipeline + an approval flow
```

Because this is a real reimplementation (not a re-export), this step is what
proves API + behaviour parity with the `@atizar/core` the app used before. If
anything diverges, it surfaces here.

To revert while iterating, restore the alias and reinstall:

```json
"@hanfani/core": "npm:@atizar/core@^0.1.1"
```
```bash
npm install
```

## 5. Publish (only after step 4 is green)

```bash
# one-time: create a free npmjs.com account + an org named "hanfani"
npm login
cd ~/Documents/startups/personal/hanfani-core
pnpm publish --access public
npm view @hanfani/core version    # → 0.1.1
```

## 6. Switch the app to the published package

```json
"@hanfani/core": "^0.1.1"
```
```bash
cd ~/Documents/startups/personal/hanfani-inbox
npm install && npm run typecheck && npm test && npm run demo
```

---

### Notes

- **Version 0.1.1** is deliberate: it satisfies the app's existing `^0.1.1`
  range, so swapping the alias needs no range change.
- **GitHub:** this repo hosts the single `@hanfani/core` package at its root and
  pushes to `github.com/fruitizz/hanfani-core`. Releases are cut with plain
  `v<version>` tags — see `.github/workflows/release.yml`.
- **Not yet ported:** the upstream package also shipped an `add-workflow` coding
  skill under `skills/`. That's tooling, not part of the JS API — port it later
  if you want feature parity.
