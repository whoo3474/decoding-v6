# PRD-06: 아키텍처 — 그린필드 정적 앱·환경 독립 엔진

> 상위 문서: [마스터 플랜](./README.md) · 보안: [PRD-09](./09-security-privacy.md)

## 1. 목표

기존 대형 코드베이스를 정리하며 신제품을 만드는 대신 빈 저장소에서 필요한 것만 작성한다. 기본 배포물은 정적 HTML/CSS/JS이며, 디코딩은 Web Worker에서 로컬 실행한다.

## 2. 그린필드 원칙

- 새 repository/worktree에서 시작하고 v3~v5 소스는 복사·이동·import하지 않음
- 이전 코드 재사용은 별도 감사 문서와 fixture 동등성 검증 후 재작성
- 첫 커밋은 docs, toolchain, empty app, privacy/performance gate
- 데이터베이스·세션·인증·결제·AI binding 없음
- 프레임워크 기능보다 정적 결과와 브라우저 표준 API 우선

## 3. 목표 폴더 구조

```text
decoding/
├─ apps/
│  ├─ web/                       # Astro SSG + 단일 Preact decoder island
│  │  ├─ src/
│  │  │  ├─ pages/              # /, /[tool], /workspace, docs pages
│  │  │  ├─ components/         # 정적 Astro 컴포넌트
│  │  │  ├─ islands/            # DecoderWorkbench 중심 interactive UI
│  │  │  ├─ workers/            # browser Web Worker entry
│  │  │  ├─ content/            # tool 설명·FAQ·spec reference
│  │  │  ├─ i18n/               # en catalog, 이후 locale
│  │  │  ├─ styles/             # tokens, global, component styles
│  │  │  └─ lib/                # 브라우저 adapter·local workspace
│  │  └─ public/                # icons, manifest, static sponsor assets
│  ├─ edge/                      # 선택적 aggregate event collector만
│  │  └─ src/index.ts           # /e, /health; payload 처리 금지
│  ├─ cli/                       # Phase 2 stdin/file CLI
│  ├─ desktop/                   # Phase 3 Tauri 2 + shared workbench UI
│  └─ extension/                 # Phase 3 수요 게이트 후
├─ packages/
│  ├─ engine/                    # detect, chain, limits, types
│  ├─ detectors/                 # 1 detector family = 1 directory
│  ├─ lint-rules/                # deterministic security rules
│  ├─ spec-registry/             # 포맷 metadata·공식 참조·버전
│  ├─ fixtures-public/           # 공개 positive/edge/negative
│  ├─ telemetry-schema/          # 허용 event의 런타임 validator
│  ├─ workbench-ui/              # web/desktop 공유 Preact UI
│  ├─ operations/                # registry + formatter/converter/inspector/generator/encoder
│  └─ test-kit/                  # fixture runner·cross-negative 도구
├─ tests/
│  ├─ blind/                     # 접근 제한 holdout runner/config
│  ├─ e2e/                       # Playwright
│  ├─ privacy/                   # egress·storage·CSP
│  ├─ performance/               # bundle·bench·CWV
│  └─ accessibility/             # axe + keyboard flows
├─ scripts/                      # generate pages, validate content, release
├─ docs/                         # PRD·ADR·threat model·release notes
├─ pnpm-workspace.yaml
├─ package.json
├─ tsconfig.base.json
├─ eslint.config.js
└─ wrangler.toml
```

`legacy/` 폴더를 새 저장소에 만들지 않는다. 이전 저장소가 이력 보관소다.

## 4. 스택

| 영역 | 결정 | 이유 |
|---|---|---|
| 패키지 관리 | pnpm workspaces | lockfile·중복 최소화, 별도 orchestrator 불필요 |
| 언어 | TypeScript strict | detector contract와 환경 경계 검증 |
| 웹 | Astro SSG | 콘텐츠 페이지는 기본 JS 0, 도구만 island로 활성화 |
| 인터랙션 | Preact 단일 island | React 호환 모델을 작은 런타임으로 사용 |
| 스타일 | CSS variables + Tailwind compile-time utilities | 런타임 없음, 토큰 일원화 |
| 엔진 실행 | Dedicated Web Worker | main thread 차단 방지 |
| 무거운 포맷 | 표준 Web API 우선, 필요한 decoder만 lazy WASM | 초기 bundle 보호 |
| 테스트 | Vitest + Playwright + axe-core | 환경·E2E·접근성 |
| 배포 | Cloudflare Workers Static Assets | 정적 자산 엣지 캐시, 서버 최소화 |
| 이벤트 | 선택적 tiny Worker + Analytics Engine | DB·사용자 ID 없는 aggregate count |
| 데스크톱 | Tauri 2 + Vite/Preact | OS webview, 최소 capability, 공유 engine/UI |

서버 렌더링, Astro session, KV session binding을 사용하지 않는다. 모든 제품 페이지를 build-time prerender한다.

## 5. 패키지 경계

### `@decoding/engine`

- DOM, Node, Cloudflare, 광고, analytics import 금지
- `Uint8Array`, string, plain object만 경계로 사용
- detector 등록·스코어·chain·limit 담당
- 사용자 표시 문구 없음

### `@decoding/detectors`

- detector family별 독립 entrypoint
- 서로 직접 import하지 않고 shared primitive는 engine으로 승격
- 공개 fixture 없는 detector export 금지

### `apps/web`

- engine을 Web Worker adapter를 통해서만 실행
- raw input을 component tree 전역 state, URL, localStorage에 저장하지 않음
- 페이지 콘텐츠는 spec-registry에서 생성

### `apps/edge`

- `/e`는 allowlist event schema 외 요청 거절
- request body 2KiB 상한
- `text`, `input`, `output`, `hash`, `exactLength` key 존재 시 거절
- D1/KV/R2 없음
- 광고 callback·conversion tracker 역할 금지

### `apps/desktop`

- [PRD-10](./10-desktop.md)의 수요 게이트 전 생성·구현하지 않음
- `workbench-ui`, `engine`, `operations`를 재사용하고 detector logic을 Rust command에 복제하지 않음
- Tauri command는 window·shortcut·clipboard·file dialog·signed updater의 최소 OS adapter만 담당
- 웹 광고·analytics package import 금지, update check OFF 상태 network 0건
- OS별 capability allowlist와 package/signature 검증을 release gate로 유지

### `@decoding/operations`

- DevUtils 공개 47-tool catalog를 Pack 1~4로 수용하는 환경 독립 plugin registry
- registry metadata·검색 index는 작게 유지하고 runtime·inspector는 tool별 dynamic import
- parser와 formatter dependency를 category entrypoint로 분리해 한 도구가 startup bundle을 키우지 않게 함
- runtime download 없이 web build/desktop installer에 필요한 chunk를 포함해 offline 보장
- operation은 network·DOM·filesystem·clipboard를 import하지 않고 adapter request만 반환
- preview security profile은 별도 sandbox package와 E2E 없이는 export 금지
- tool manifest·help content·fixture·inspector의 parity를 build-time 검증

## 6. 배포 구조

### 광고·제품 이벤트가 없는 초기 단계

```toml
name = "decoding"
compatibility_date = "2026-07-15"

[assets]
directory = "apps/web/dist"
not_found_handling = "404-page"
```

순수 정적 단계는 `main`과 binding이 없다.

### aggregate event collector가 승인된 뒤

- 정적 자산은 Worker 호출 없이 제공
- `/e`와 `/health`만 `apps/edge` Worker로 routing
- binding은 Analytics Engine 하나만
- staging과 production은 별도 이름, 동일 코드·다른 dataset

광고 수익을 위해 서버나 데이터베이스를 추가하지 않는다.

## 7. 성능 예산

### 전송

| 자산 | gzip 예산 |
|---|---:|
| 정적 페이지 공통 JS | 15KiB 이하 |
| Preact + DecoderWorkbench shell | 55KiB 이하 |
| MVP engine worker | 100KiB 이하 |
| 초기 CSS | 25KiB 이하 |
| lazy compression/WASM chunk | 200KiB 이하, 초기 전송 제외 |
| 광고 추가 JS | 30KiB 이하, 광고 단계만 |

홈의 첫 사용에 필요한 총 초기 JS는 170KiB gzip 이하로 제한한다. 외부 폰트·아이콘 폰트가 없다.

### 사용자 성능

- LCP p75 ≤1.8s
- INP p75 ≤200ms
- CLS p75 ≤0.05
- TTFB p75 ≤300ms
- 1MiB 텍스트 첫 후보 p75 ≤100ms, 전체 결과 p75 ≤300ms
- 10MiB 지원 입력 p95 ≤2s 또는 진행·취소 가능
- 광고 추가 후 LCP 회귀 ≤200ms

### 기준 환경

- 데스크톱: 최근 3년 내 4-core 노트북, Chrome stable
- 모바일: mid-tier Android, 4x CPU throttle, Fast 4G
- CI microbenchmark와 실제 RUM의 목적을 분리해 보고

## 8. 빌드·의존성 규율

- lockfile 고정, Renovate는 주 1회 묶음 PR
- production dependency 추가는 bundle·license·network behavior 기록 필수
- browser polyfill과 `nodejs_compat` 기본 금지
- side-effect 없는 패키지와 explicit exports
- tool 콘텐츠·sitemap·hreflang은 build-time 생성 후 freshness test
- build가 TypeScript/ESLint 오류를 무시하는 설정 금지
- source map은 공개 가능 여부를 검토하고 raw fixture 포함 금지

## 9. CI 게이트

1. format·typecheck·lint
2. unit + node/browser worker environment tests
3. public fixture + cross-negative + blind aggregate
4. privacy egress·storage·CSP tests
5. Playwright keyboard·paste·file·ambiguous flows
6. axe accessibility
7. bundle budget + engine benchmark
8. static content/spec link validation
9. dependency license·known vulnerability scan

모든 PR은 변경된 detector·페이지·bundle·network allowlist 영향을 요약한다.

## 10. 완료 조건

- 빈 저장소에서 `pnpm install && pnpm verify && pnpm build` 성공
- web/worker/CLI가 같은 engine fixture 결과를 생성하고, desktop 활성 후 동일 fixture gate에 포함
- 정적 단계에 Worker main·DB·session·auth·payment dependency 0개
- 성능 예산과 privacy gate가 CI에서 실패를 차단
- staging URL에서 hard refresh·offline·404·CSP 검증 통과
