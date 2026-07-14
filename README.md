# decod.ing v6

> Paste anything. See what it is — instantly, locally, safely.

decod.ing is a zero-account universal decoder and private developer workbench. It detects eight format families, follows recursive decode chains, exposes evidence and deterministic warnings, and provides 47 local format/convert/inspect/generate/encode tools.

Production: <https://decod.ing> · Staging: <https://decoding-v6-staging.wjstks3474.workers.dev>

## Product contract

- No login, account, subscription, checkout, paid feature, server-side decoding, or generative AI
- No raw-input history; the optional IndexedDB workspace stores only explicitly saved redacted structure
- No product telemetry or advertising code in the launch build
- Ads remain a disabled, code-free Phase 4 gate until real traffic, privacy, and performance thresholds pass
- Browser, PWA, CLI, desktop, and extension share the same local engine or operation runtimes

## Implemented surfaces

```text
apps/web             Astro SSG, Preact workers, 64 static pages, PWA, local workspace
apps/cli             stdin/file auto-decoder and all 47 operation IDs
apps/desktop         Tauri 2 workbench, global shortcut, explicit clipboard, tray, windows
apps/extension       MV3 selection decoder with minimum permissions and no host access
apps/edge            reviewed empty boundary; no deployed Worker logic or bindings
packages/engine      eight-detector chain engine with limits and warnings
packages/operations  47 lazy local operation runtimes, Pack 1+2+3+4 = 16+11+10+10
packages/fixtures-public / spec-registry / test-kit / workbench-ui
```

## Run and verify

```bash
pnpm install
pnpm dev
pnpm verify
pnpm test:e2e

printf 'eyJsb2NhbCI6dHJ1ZX0=' | pnpm cli -- --json
pnpm desktop:build
pnpm --filter @decoding/extension build
pnpm verify:deploy -- https://decod.ing
```

The current implementation evidence and external launch gates are tracked in [`docs/implementation/STATUS.md`](./docs/implementation/STATUS.md). Product decisions and ordered requirements remain in [`docs/prd/`](./docs/prd/README.md).
