# 실행 체크리스트 — v6 그린필드 프로젝트

> **사용법**: 위에서 아래로 실행한다. 새 작업은 해당 PRD와 이 문서에 먼저 추가한다.
> **게이트**: 이전 Phase의 필수 항목과 측정 기간을 충족하기 전 다음 Phase 기능을 시작하지 않는다.
> **완료 표기**: `[x] YYYY-MM-DD — evidence link/commit` 형식.

---

## Phase 0 — 새 저장소 부트스트랩 (주 1)

완료 정의: 빈 저장소에서 정적 홈 배포 + engine skeleton + privacy/performance gate가 CI에서 동작.

### 결정·저장소

- [x] 2026-07-15 — 독립 Git repository 생성, v3~v5 source import 0건 ([status](../implementation/STATUS.md))
- [x] 2026-07-15 — PRD-01~10, ADR-003, 독립 brand asset 구성
- [x] 2026-07-15 — pnpm workspace와 `apps/{web,edge,cli,desktop,extension}`, `packages/*`, `tests/*` 구성
- [x] 2026-07-15 — root `dev`, `build`, `verify`, `test:*`, `content:validate`, `deploy:*` scripts 구성
- [x] 2026-07-15 — TypeScript strict·ESLint·Prettier·commit/PR template 구성
- [x] 2026-07-15 — MIT license와 dependency·network destination 기록 ([dependency record](../engineering/dependencies.md))

### 웹·배포

- [x] 2026-07-15 — Astro SSG + Preact, SSR/session/server action 0개
- [x] 2026-07-15 — CSS tokens·system fonts·responsive light/dark shell
- [x] 2026-07-15 — binding 없는 Cloudflare Workers Static Assets staging 배포 ([deployment](../implementation/DEPLOYMENT.md))
- [x] 2026-07-15 — cache/header/CSP/Permissions-Policy 배포 응답 검증 ([deployment](../implementation/DEPLOYMENT.md))
- [ ] PR preview는 Git remote/host 연결 후 가능; 이전 staging version rollback·restore는 2026-07-15 실증 완료

### 엔진·하네스

- [x] 2026-07-15 — `DecodeInput`, `Detection`, `Detector`, `DecodedValue`, `LintWarning` 계약 구현
- [x] 2026-07-15 — detector registry·confidence sort·ambiguous·chain limits 구현
- [x] 2026-07-15 — fixture schema와 cross-negative runner 구현
- [x] 2026-07-15 — Node unit + browser worker E2E matrix 구현
- [x] 2026-07-15 — Playwright synthetic canary egress/storage 검사 통과
- [x] 2026-07-15 — bundle budget·1MiB benchmark·axe smoke CI 통과 ([status](../implementation/STATUS.md))
- [x] 2026-07-15 — detector ↔ tool page ↔ spec registry parity script 통과

**Gate P0**

- [x] 2026-07-15 — `pnpm install && pnpm verify && pnpm build` 성공
- [x] 2026-07-15 — staging 정적 홈과 product 404 정상
- [x] 2026-07-15 — Worker main·DB·auth·payment·AI dependency 0개
- [x] 2026-07-15 — privacy canary와 초기 bundle budget gate 통과

---

## Phase 1 — MVP 8개 포맷과 웹 런칭 후보 (주 2~4)

완료 정의: 실제 사용 가능한 8개 포맷군, 체인 UI, 도구 페이지 8개, 비공개 베타 통과.

### Detector slice — 각각 fixture → 구현 → UI → 페이지 순서

- [x] 2026-07-15 — JWT/JWS compact + time claim/algorithm lint
- [x] 2026-07-15 — Base64/Base64URL
- [x] 2026-07-15 — JSON/JSON string escapes
- [x] 2026-07-15 — Hex
- [x] 2026-07-15 — URL encoding/query string
- [x] 2026-07-15 — Epoch s/ms/µs/ns
- [x] 2026-07-15 — UUID v1/4/7 + ULID
- [x] 2026-07-15 — gzip/zlib/deflate + expansion guard

각 slice 필수:

- [x] 2026-07-15 — detector별 public positive 20 + edge 10 + negative 20
- [ ] detector별 genuinely independent blind 20은 별도 reviewer/data run 필요
- [x] 2026-07-15 — detector별 official spec registry entry
- [x] 2026-07-15 — public fixture 포맷별 precision ≥95%, recall ≥90%
- [x] 2026-07-15 — detector page와 안전한 예시 3개
- [x] 2026-07-15 — 성능·privacy delta 통과 ([status](../implementation/STATUS.md))

### Engine

- [x] 2026-07-15 — confidence evidence와 calibration
- [x] 2026-07-15 — auto-expand: confidence 0.85 + margin 0.15
- [x] 2026-07-15 — ambiguous 후보 선택
- [x] 2026-07-15 — chain depth 8/node 64/cycle digest
- [x] 2026-07-15 — 10MiB input, 32MiB expanded, 100:1 compression, 2s CPU limits
- [x] 2026-07-15 — deterministic lint와 rule/spec link
- [x] 2026-07-15 — copy·redacted export·Wrong format flow

### UI

- [x] 2026-07-15 — `DecoderWorkbench` 단일 island + dedicated Web Worker
- [x] 2026-07-15 — empty/processing/confident/ambiguous/unsupported/limit/error 상태
- [x] 2026-07-15 — tree + inspector + candidate list
- [x] 2026-07-15 — paste·file drop·keyboard shortcuts
- [x] 2026-07-15 — system theme·responsive·reduced motion
- [ ] 자동 axe serious-impact gate는 통과; full manual WCAG 2.2 AA/AT 검증은 외부 audit 필요
- [x] 2026-07-15 — “Your input stays in this browser” 상세 설명
- [x] 2026-07-15 — 광고·login·price·upgrade DOM 0개

### 콘텐츠·계측

- [x] 2026-07-15 — `/`, 8 detector pages, `/methodology`, `/privacy`, `/about`, `/changelog`
- [x] 2026-07-15 — canonical·sitemap·robots·JSON-LD·static OG
- [x] 2026-07-15 — 8-locale typed message catalog·UI literal lint·key parity gate
- [x] 2026-07-15 — aggregate event schema 전 privacy review 결과: launch telemetry 미구현
- [ ] pageview/product event 없는 KPI beta 측정은 real participant 운영 시 실행

### 베타

- [ ] 개발자/SRE/보안 사용자 10명, synthetic/non-sensitive task
- [ ] 10초 내 첫 완료 8/10
- [x] 2026-07-15 — 잘못된 후보·막힌 상태를 synthetic fixture issue form으로 환류
- [x] 2026-07-15 — [공개 런칭 체크리스트](../launch/LAUNCH_CHECKLIST.md) 준비
- [x] 2026-07-15 — [threat model](../security/THREAT_MODEL.md) 준비
- [x] 2026-07-15 — 실제 production을 사용한 [non-sensitive demo GIF](../launch/decoding-demo.gif) 캡처

**Gate P1**

- [ ] 전 detector genuine blind 품질 게이트는 independent data run 필요
- [x] 2026-07-15 — 1MiB 첫 후보 p75 4.3ms, 전체 결과 p75 31.5ms
- [x] 2026-07-15 — 초기 JS 18.8KiB gzip, local browser performance budget 통과
- [x] 2026-07-15 — privacy canary 광고 OFF·분석 OFF에서 local/deployed 모두 통과
- [ ] 베타 8/10 작업 완료는 real participant run 필요

---

## Phase 2 — 공개 런칭·반복 사용 (주 5~8)

완료 정의: 공개 유입이 실제 작업 완료로 전환되고, Utility Pack 1과 웹 외 반복 경로 하나 이상이 증명됨.

### 공개

- [x] 2026-07-15 — `decod.ing/*`와 `www.decod.ing/*`를 새 정적 앱으로 전환 ([deployment](../implementation/DEPLOYMENT.md))
- [ ] Show HN 게시·회고
- [x] 2026-07-15 — [GitHub engine 공개](https://github.com/whoo3474/decoding-v6), MIT·SECURITY·CONTRIBUTING·Private Vulnerability Reporting 구성
- [ ] r/webdev → r/devops → r/netsec 순차, 동일 글 복제 금지
- [ ] Search Console 색인·query·page completion 주간 검토

### 수요 기반 detector/content

- [ ] unsupported·ambiguous aggregate 상위 포맷 리포트
- [ ] 근거가 있는 Phase 2 detector를 4개 단위로 추가
- [ ] HTML/Unicode, PEM/X.509, IP, Cron 중 실제 우선순위 선택
- [ ] 미사용 tool page 6주 후 통합·삭제
- [ ] detector 없는 SEO page 0개

### 공유 utility catalog — Pack 1

- [x] 2026-07-15 — `operations` plugin registry·category·alias·security profile contract
- [x] 2026-07-15 — Pack 1 공식 16-tool ledger 구현
- [x] 2026-07-15 — operation별 valid input fixture와 parser/preview edge·malicious fixtures
- [x] 2026-07-15 — `/tools`, command palette, recent/favorite slug, tool별 route/help
- [x] 2026-07-15 — registry metadata-only initial bundle, category runtime local lazy chunk
- [x] 2026-07-15 — 선택하지 않은 parser 초기 decoder bundle 제외
- [x] 2026-07-15 — web/PWA/CLI engine·operation parity gate

### PWA·workspace·CLI

- [x] 2026-07-15 — 핵심 app/engine offline cache, 강제 update 없음
- [x] 2026-07-15 — standalone mode 외부 광고 요청 0건
- [x] 2026-07-15 — local workspace opt-in·redacted-only·TTL·delete/export/clear
- [x] 2026-07-15 — stdin pipe, `--file`, JSON/NDJSON CLI
- [x] 2026-07-15 — CLI positional blob 금지·network code 0개
- [x] 2026-07-15 — web/CLI fixture 결과 동등성

### 계측

- [ ] telemetry 필요성이 승인되지 않아 `/e` Worker와 Analytics Engine을 의도적으로 추가하지 않음
- [ ] analytics 구현 시 allowlist schema·2KiB limit·forbidden key rejection 필요
- [ ] analytics 구현 시 opt-out와 30일 회전 cohort 필요
- [x] 2026-07-15 — 광고 데이터·제품 event 모두 0개로 결합 경로 없음

**Gate P2**

- [ ] 공개 첫 주 방문 1K·완료 작업 500
- [ ] 8주 내 비런칭 유입 50%
- [ ] 방문 → 완료 50% 이상
- [ ] 후보 전환 5% 이하 또는 confusion fix 계획
- [ ] 4주 재방문 20% 또는 PWA/CLI 반복 경로 증명
- [x] 2026-07-15 — Pack 1 registry·route/search·inspector·fixture parity와 초기 bundle 예산 통과

---

## Phase 3 — 국제화·확장 (M3+)

완료 정의: 영어 제품의 유입·품질을 유지하며 증명된 로케일과 native 작업 동선만 확장.

- [ ] 로케일 점수표: 8주 유입·검색 노출·요청·native reviewer
- [x] 2026-07-15 — `en/ko/ja/zh-cn/es/pt-br/de/fr` 전체 공통 UI·47 tool·8 detector·privacy/methodology 기술 베타 라우트
- [ ] 첫 로케일 native reviewer가 상위 8 tool + 공통 UI/privacy/methodology를 승인해 `noindex` 해제
- [x] 2026-07-15 — self-canonical·English x-default·미검수 locale sitemap 제외·typed route build 검증
- [ ] locale별 screenshot·screen-reader/native terminology review
- [x] 2026-07-15 — 브라우저 언어 로케일 제안·session dismiss, 자동 redirect 없음

### 공유 utility catalog — Pack 2~4

- [x] 2026-07-15 — Pack 2 11개 + Pack 3 10개 + Pack 4 10개 구현
- [x] 2026-07-15 — 47-tool expansion ledger·registry·route/search·help·inspector·fixture parity
- [x] 2026-07-15 — Pack 4 PHP/template/cURL/HTML Preview no-execution·sandbox·no-network gate
- [x] 2026-07-15 — pure/parser utility web/PWA/desktop shared runtime
- [ ] SEO page별 실제 검색 수요는 Search Console observation 후 판정

### 데스크톱 — PRD-10 수요 게이트 후

- [ ] native 수요 조건은 미측정; 사용자 명시 지시로 구현만 선행하고 public notarized release는 유지 보류
- [x] 2026-07-15 — `apps/desktop` Tauri 2와 `workbench-ui`·`engine`·`operations` 공유 경계
- [ ] arm64·x86_64 universal engineering DMG는 생성·검증; Developer ID signed/notarized public beta는 Apple credentials 필요
- [x] 2026-07-15 — quick panel·global shortcut·명시적 1회 clipboard read·tray/menu·file open·multiple windows
- [x] 2026-07-15 — 공유 engine·workbench·47 Utility Pack native shell 제공
- [x] 2026-07-15 — capability allowlist에서 shell·무제한 filesystem·HTTP·continuous clipboard 금지
- [ ] updater signature·checksum·기본 OFF는 검증; 실제 release endpoint update/rollback은 notarized beta 필요
- [x] 2026-07-15 — desktop 광고·계정·결제·product telemetry·웹 광고 adapter 0개
- [ ] macOS beta 100 installs, 4주 반복 30%, crash-free session 99.5% gate
- [ ] macOS 안정화 후 Windows, 두 플랫폼 gate 후 Linux 순차 확장
- [x] 2026-07-15 — macOS DMG 5.1MiB, startup registry-only, offline local lazy chunks ([status](../implementation/STATUS.md))

### 브라우저 확장 — 별도 수요 게이트 후

- [ ] extension 수요 gate는 미측정; 사용자 명시 지시로 구현만 선행
- [x] 2026-07-15 — MV3 최소 권한 context-menu extension 구현
- [x] 2026-07-15 — extension payload egress·host permission audit 통과
- [ ] QR/CBOR/MessagePack 등은 별도 수요·성능 gate

**Gate P3**

- [ ] 첫 로케일에서 측정 가능한 검색→완료 작업 발생
- [ ] 영어 활성은 observation 필요; local 성능 회귀 gate는 통과
- [x] 2026-07-15 — Pack 1~4 registry·lazy-loading·security parity 통과
- [ ] macOS beta 품질·반복 사용 gate는 notarized public beta 후 측정
- [ ] extension의 웹 대비 반복 사용 증거는 store beta 후 측정

---

## Phase 4 — 광고·스폰서 실험 (트래픽 게이트 후)

완료 정의: 한 자리 비추적 수익이 제품 신뢰·활성·성능을 해치지 않고 운영비를 상회.

### 진입 전 4주 기준선

- [ ] 평균 주간 페이지뷰 ≥10K
- [ ] 비런칭 유입 ≥50%, 완료 전환 ≥50%
- [ ] LCP ≤1.8s, INP ≤200ms, CLS ≤0.05
- [ ] privacy/CSP 전 조합 green

### 정적 스폰서 우선

- [x] 2026-07-15 — `SponsorSlot` 기본 `none`, 비활성 시 DOM·request 0개
- [x] 2026-07-15 — `sponsors.json` schema·기간·HTTPS·asset 검사
- [x] 2026-07-15 — same-origin raster asset, active SVG/HTML/JS 금지
- [x] 2026-07-15 — below-the-fold 1자리·Sponsored 라벨·`rel=sponsored` 코드 게이트; active campaign 0개
- [ ] 10% → 50% → 100% 품질 실험

### 네트워크 광고는 필요할 때만

- [ ] EthicalAds/Carbon 현재 privacy·host·script 정책 재심사
- [ ] sandbox/allowlist/CSP/timeout/kill switch
- [ ] 광고 추가 JS ≤30KiB gzip, LCP 회귀 ≤200ms
- [ ] PWA standalone/workspace/CLI/desktop/extension 광고 0개

### 월간 판정

- [ ] 순광고수익·page RPM·fill·정산서
- [ ] 활성 -3pp, 리텐션 -5%, CWV 가드레일
- [ ] 정책·network destination 변화
- [ ] 수익이 운영·신뢰 비용보다 낮으면 제거

**Gate P4**

- [x] 2026-07-15 — 계정·구독·결제·유료 API 코드 0개
- [x] 2026-07-15 — synthetic canary payload egress 0건
- [ ] 한 자리 광고 수익이 직접 운영비 상회
- [ ] 제품 품질 가드레일 4주 유지

---

## 상시 운영

- 매 PR: `pnpm verify`, network/bundle/detector/page delta
- 매주: unsupported/confusion·검색·CWV·dependency review
- 매 릴리스: blind 품질·privacy·content parity·rollback 확인
- 보안 경계·스택·수익 모델 변경: 새 ADR
- 같은 접근 3회 실패: failure pattern 기록 후 접근 전환
