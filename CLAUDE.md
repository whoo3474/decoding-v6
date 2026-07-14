# decod.ing — Claude Code Instructions

## 제품 정의와 SSOT

> **Paste anything. See what it is — instantly, locally, safely.**

decod.ing v6는 정체불명의 문자열·파일을 자동 판별하고 재귀 디코딩 체인과 결정적 경고를 보여주는 무료 로컬 개발자 도구다.

- 제품·기술 SSOT: `docs/prd/README.md`와 `docs/prd/01~10`
- 실행 순서 SSOT: `docs/prd/CHECKLIST.md`
- 결정 이력: `docs/10-decisions/`; 현재 사업·기술 결정은 ADR-003
- 이전 v3~v5 문서와 코드는 이력 조회 전용이며 새 프로젝트로 import하지 않는다
- 작업 전 현재 Phase의 PRD, CHECKLIST, 관련 ADR을 먼저 읽는다

## 하드 룰 — 위반 시 릴리스 차단

1. **payload local-only**: raw input과 decoded result를 URL, log, event, analytics, 광고, 오류 보고, update 요청으로 보내지 않는다.
2. **zero account**: 로그인·계정·이메일 수집·구독·결제·유료 API·서버 동기화를 추가하지 않는다.
3. **deterministic only**: 생성형 AI와 서버 디코딩이 없다. 설명과 경고는 결정적 rule, 계산 근거, 공식 spec으로 만든다.
4. **greenfield**: v3~v5 소스를 복사·이동·import하지 않는다. 필요한 동작은 공식 스펙과 새 fixture를 기준으로 다시 작성한다.
5. **detector quality**: public positive/edge/negative와 blind fixture, cross-negative, precision/recall gate 없이 detector를 merge하지 않는다.
6. **ambiguity honesty**: 낮은 신뢰도나 유사 후보를 임의의 정답으로 자동 확정하지 않는다.
7. **English first, i18n-ready**: 제품 문자열은 message catalog에 두고, 로케일은 실제 수요와 native review gate 후 추가한다. 내부 문서는 한국어다.
8. **performance budget**: 초기 JS, Web Worker latency, memory, Core Web Vitals 예산 회귀를 CI가 차단한다.
9. **ads last**: Phase 4 gate 전 광고 DOM·script·request가 없어야 한다. 이후에도 웹 below-the-fold 한 자리만 허용하며 PWA standalone·workspace·CLI·desktop·extension에는 광고가 없다.
10. **desktop least privilege**: 수요 gate 전 `apps/desktop` 구현을 시작하지 않는다. 시작 후 clipboard는 explicit shortcut/action에서만 읽고 broad filesystem·shell·HTTP capability를 금지한다.
11. **wide catalog, bounded loading**: DevUtils 공개 47개 도구를 Pack 1~4 backlog로 유지하되 각 tool을 독립 operation manifest·fixture·inspector·local lazy chunk로 구현한다. 도구 수를 이유로 startup bundle이나 권한을 넓히지 않는다.

## 목표 구조

```text
apps/web         Astro SSG + Preact workbench + Web Worker
apps/edge        승인 후 aggregate event collector만
apps/cli         Phase 2 stdin/file local CLI
apps/desktop     Phase 3 수요 gate 후 Tauri 2
apps/extension   Phase 3 별도 수요 gate 후 MV3
packages/engine, detectors, lint-rules, spec-registry
packages/workbench-ui, operations, fixtures-public, telemetry-schema, test-kit
tests/blind, e2e, privacy, performance, accessibility
```

새 repository/worktree에는 `legacy/`, auth/payment/AI package, database binding을 만들지 않는다.

## 표준 개발 루프

```text
PRD/CHECKLIST 확인
→ 공식 spec과 실패 조건 기록
→ public/edge/negative fixture + blind fixture 준비
→ 가장 작은 detector/operation 수직 slice 구현
→ engine → UI → tool page 연결
→ pnpm verify + 브라우저 실동작
→ privacy/performance/a11y/content delta 확인
→ CHECKLIST·work record 갱신
→ conventional commit
```

- 한 detector family를 기본 커밋 단위로 사용한다.
- 페이지나 마케팅 문구가 구현보다 먼저 기능을 약속하지 않는다.
- 같은 접근이 세 번 실패하면 `docs/work/failure-patterns.md`에 기록하고 접근을 바꾼다.
- 전략·스택·데이터 경계·수익 모델 변경은 새 ADR이 필요하다.
- 현재 저장소의 사용자 소유 dirty change를 정리하거나 덮어쓰지 않는다.

## 명령 계약

새 프로젝트 root는 다음을 안정된 인터페이스로 제공한다.

```text
pnpm dev
pnpm build
pnpm verify
pnpm test
pnpm test:e2e
pnpm test:privacy
pnpm test:a11y
pnpm test:perf
pnpm content:validate
pnpm deploy:staging
pnpm deploy
```

데스크톱 작업이 수요 gate 후 시작될 때 `pnpm desktop:verify`를 추가한다. 실제 script와 config는 항상 파일에서 확인하며 Task Master나 구세대 harness를 새 프로젝트 계약으로 사용하지 않는다.

## 주요 포인터

- 마스터 계획: `docs/prd/README.md`
- 실행 게이트: `docs/prd/CHECKLIST.md`
- 엔진: `docs/prd/01-product-core.md`
- 광고: `docs/prd/04-monetization.md`
- UI/UX: `docs/prd/05-uiux.md`
- 구조·성능: `docs/prd/06-architecture.md`
- 하네스: `docs/prd/07-harness-loop.md`
- 보안: `docs/prd/09-security-privacy.md`
- 데스크톱: `docs/prd/10-desktop.md`
- DevUtils 감사: `docs/research/2026-07-15-devutils-feature-audit.md`
