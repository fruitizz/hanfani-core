# hanfani-framework

The `@hanfani/*` agent-framework packages, as a pnpm-workspace monorepo. One
GitHub repo; each package publishes independently to npm.

## Packages

| Package | Status | Depends on |
|---|---|---|
| `@hanfani/core` | ✅ fresh, owned source | `@ag-ui/client`, `zod` |
| `@hanfani/integrations` | planned | core (+ googleapis) |
| `@hanfani/providers` | planned | core (+ mastra) |
| `@hanfani/react` | planned | core (+ react) |
| `@hanfani/server` | planned | core (+ drizzle, hono) |

Build order is **core first**; the other four each depend on core.

## Develop

```bash
pnpm install
pnpm build        # build every package
pnpm typecheck
pnpm test
```

## Publish a package (after validating — see packages/core/VALIDATE.md)

```bash
# one-time: create a free npmjs.com account + an org named "hanfani"
npm login
pnpm --filter @hanfani/core publish --access public
```

## Consume from the app

Replace the app's alias `"@hanfani/core": "npm:@atizar/core@^0.1.1"` with the
real published package `"@hanfani/core": "^0.1.1"`.
# hanfani-framework
