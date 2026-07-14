# v6 greenfield implementation

## Intent

PRD-01~10과 CHECKLIST의 구현 가능한 범위를 독립 저장소에서 구현·검증·배포한다.

## In scope

- local-only detector/chain engine
- DevUtils 공개 47-tool operation catalog
- Astro/Preact web, PWA, CLI, Tauri desktop
- privacy, performance, accessibility, content, packaging gates
- Cloudflare static deployment

## Out of scope

- 실제 8주 트래픽·재방문·광고 수익처럼 시간이 필요한 결과를 임의로 완료 처리
- 사용자 계정·결제·서버 디코딩·생성형 AI
- 기존 v3~v5 source import

## Acceptance checks

- `pnpm verify`
- Playwright privacy/a11y/E2E
- 47-tool registry parity
- local desktop package build
- deployed production smoke

## Privacy and performance impact

모든 입력은 local runtime에서만 처리한다. tool runtime은 선택 시 local lazy chunk로 로드한다.

## Evidence

- `pnpm verify` 통과: format/lint/type/unit/benchmark/content/link/network/parity/extension/build/bundle
- `pnpm test:e2e` 17/17 통과: product/PWA/privacy/a11y/responsive
- engine public fixture per-format precision ≥95%, recall ≥90%
- 1MiB first-candidate p75 4.3ms, complete p75 31.5ms
- initial JS 18.8KiB gzip, 64 static pages, 47 operation routes
- Tauri ARM64 DMG 5.1MiB, updater signature/checksum, hardened ad-hoc signature, no runtime sockets
- production: <https://decod.ing>, Cloudflare version `fd0ce2f9-6604-45b2-b1cc-59f01c9a7df1`
- staging: <https://decoding-v6-staging.wjstks3474.workers.dev>, rollback/restore drill passed
- deployed Chromium smoke: detection, 47 tools, local operation, canary egress/storage 0, external origin 0

Independent blind data, real-user beta/traffic/retention/ad observations, Apple notarization, cross-platform release artifacts, and public Git hosting remain external gates and are not represented as complete.
