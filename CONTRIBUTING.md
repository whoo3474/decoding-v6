# Contributing

Start with `docs/prd/README.md` and `docs/prd/CHECKLIST.md`. A detector contribution begins with synthetic positive, edge, and negative fixtures plus a specification reference. An operation contribution includes a runtime fixture and malicious-input behavior where parsing or preview is involved.

```bash
pnpm install
pnpm verify
pnpm test:e2e
```

Keep `packages/engine` environment-independent. Do not add DOM, Node-only, Cloudflare, analytics, advertising, account, payment, or network dependencies to it. Never commit a real token, certificate private key, signing private key, or customer payload.
