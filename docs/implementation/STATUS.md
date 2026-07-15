# v6 implementation status

Updated: 2026-07-15

## Released

- Production: <https://decod.ing> and <https://www.decod.ing>
- Source: <https://github.com/whoo3474/decoding-v6>
- Fallback: <https://decoding-v6.wjstks3474.workers.dev>
- Staging: <https://decoding-v6-staging.wjstks3474.workers.dev>
- Cloudflare production version: `65608571-01c1-4746-989e-7de0dd3b554f`
- Cloudflare staging version: `ae7932de-ff68-4d00-974d-ca87adde05ff`
- Rollback and restore drill: passed on staging

See [DEPLOYMENT.md](./DEPLOYMENT.md) for route, version, HTTP, browser, privacy-canary, and rollback evidence.

## Code-complete scope

- 8 detector families, recursive chain, confidence/margin selection, cycle and resource limits
- 20 positive + 10 edge + 20 negative public fixtures per detector; official specification registry and per-format public quality gate
- 47/47 DevUtils-audited tools, route/search/help/runtime parity, valid fixture for every operation, parser/preview malicious fixtures
- 484-page static web build: English plus 7 translation-beta locales across 47 tools, 8 detectors, home, privacy, methodology, and about
- typed `en/ko/ja/zh-cn/es/pt-br/de/fr` workbench catalogs, locale suggestions without redirects, self-canonical pages, and native-review `noindex` gates
- responsive light/dark UI, automated serious-impact axe gate, PWA offline cache
- explicit redacted-only IndexedDB workspace with TTL, export preview, per-record deletion, and clear-all
- stdin/file-only CLI, local Tauri app, and minimum-permission MV3 extension
- zero product analytics, account, payment, server decode, advertising, or payload network primitives

The user explicitly requested implementation of the complete 47-tool, desktop, and extension surfaces before the PRD's demand gates. Those surfaces are implemented for evaluation, but their public native-store release and success metrics remain gated below.

## Verified

- `pnpm verify`: format, lint, strict types, unit/fixture/CLI tests, benchmark, content/link/network/parity/extension checks, all builds, bundle budget
- GitHub Actions hosted CI: [`verify` and `test:e2e` passed](https://github.com/whoo3474/decoding-v6/actions/runs/29361506397)
- Playwright: desktop/mobile UI, local worker operations, PWA offline reload, same-origin request audit, privacy canary, IndexedDB raw-secret absence, and axe
- public fixture quality: at least 95% precision and 90% recall for each detector family
- 1 MiB engine benchmark: first candidate p75 2.9 ms, complete p75 29.8 ms
- initial application JavaScript: 18.8 KiB gzip; heavy operation categories remain lazy
- Tauri: Rust `cargo check`, native release bundle, updater signing, checksums, code-sign verification, capability allowlist, and two-minute no-socket runtime observation
- Cloudflare: staging, production, custom-domain cutover, external Chromium smoke/privacy gate, and rollback/restore drill
- Cloudflare immutable i18n preview: `f9ad317e-1204-42b9-82ad-d9afd1ff8c74` at `https://codex-i18n-decoding-v6.wjstks3474.workers.dev`
- PR preview workflow and repository variables are configured; the dedicated minimal Cloudflare API token remains an owner-authenticated dashboard action
- sponsor adapter defaults to none and validates same-origin raster assets, HTTPS targets, dates, categories, and forbidden payload/session query keys

## Desktop artifacts

The local Apple Silicon beta build is ad-hoc signed with hardened runtime for engineering validation. It is not Apple-notarized and therefore is not exposed on the public download page.

| Artifact                      |    Size | SHA-256                                                            |
| ----------------------------- | ------: | ------------------------------------------------------------------ |
| `decod.ing_6.0.0_aarch64.dmg` | 5.1 MiB | `204dac9b45eb24b87d7fe4b19a0384821ca6e9c7d286d1f12aba360fc6729e34` |
| `decod.ing.app.tar.gz`        | 5.2 MiB | `aa2bf1ae170c253d6d5cb838144947fc48ac57898c793e75b7d2b93751044790` |
| updater signature             |   408 B | `28bdcdc5061a1039cbd74b2749479921a34d673f8dde2a0fea7c06c899953a36` |

The private updater key is outside the repository. The public key is in Tauri configuration. Native UI automation through the local accessibility bridge was unavailable, so native validation used the shared web UI E2E suite plus process, signature, bundle, capability, and socket checks.

## External evidence gates — pending, not claimed

- genuinely independent blind fixtures: public deterministic fixtures pass, but blind data cannot be authored and scored by the same implementation run
- developer/SRE/security beta with 10 real participants and the 8/10 ten-second completion gate
- traffic, task completion, Search Console, retention, locale, desktop install/repeat/crash-free, and advertising baselines over the PRD observation windows
- Show HN, subreddit, and extension-store launch activities
- Apple Developer ID signing/notarization and macOS universal release require owner credentials; Windows/Linux packages require a connected release workflow
- full manual WCAG 2.2 AA audit and real-user assistive-technology verification
- PR preview workflow needs a dedicated `CLOUDFLARE_API_TOKEN`; the local expiring OAuth session was deliberately not copied into GitHub Secrets
- all 7 non-English locales are labeled translation beta and excluded from indexing until native technical/privacy review

These gates remain unchecked in [CHECKLIST.md](../prd/CHECKLIST.md). No ad slot or ad request exists until Phase 4 evidence is real.
