# PRD-07: 하네스·문서·개발 루프

> 상위 문서: [마스터 플랜](./README.md) · 실행 SSOT: [CHECKLIST.md](./CHECKLIST.md)

## 1. 목표

새 세션과 새 기여자가 5분 안에 제품 계약, 현재 Phase, 다음 한 작업, 금지선을 이해하고 검증 가능한 작은 단위로 구현하게 한다.

기능 수를 늘리는 것이 아니라 **입력 fixture → detector → UI → 페이지 → 검증**의 완성된 세로 단위를 반복한다.

## 2. 문서 체계

```text
docs/
├─ prd/                 # 제품·기술 SSOT + CHECKLIST
├─ decisions/           # append-only ADR
├─ security/            # threat model, incident, dependency review
├─ research/            # 사용자 인터뷰·경쟁·검색 근거
├─ releases/            # 릴리스별 변경·지표·회고
└─ work/                # active / completed 작업 기록
```

- PRD 변경은 해당 CHECKLIST와 하드 룰까지 같은 커밋에서 갱신
- 전략·스택·데이터 경계 변경은 ADR 없이 합치지 않음
- 완료된 ADR을 수정하지 않고 새 ADR이 대체 관계를 기록
- 이전 프로젝트 문서는 새 저장소로 복사하지 않고 링크 가능한 archive에 둠

## 3. 표준 작업 단위

### Detector slice

```text
공식 스펙 확인
→ public + edge + negative fixture
→ blind fixture 요청
→ detector 구현
→ cross-negative·calibration
→ lint rule
→ DecoderWorkbench 표시
→ tool 콘텐츠·페이지
→ privacy·performance·a11y 검증
→ 한 커밋
```

페이지나 UI만 먼저 만들어 미구현 기능을 광고하지 않는다.

### Operation slice

```text
47-tool ledger에서 항목 선택
→ pure/parser/preview security profile 결정
→ input/output·edge·malicious fixture
→ operation runtime 구현
→ 전용 inspector·keyboard flow
→ tool manifest·help content
→ local lazy chunk·offline 검증
→ no-execution·privacy·bundle gate
→ 한 커밋
```

formatter·converter·generator도 이름만 많은 범용 textarea로 처리하지 않는다. 공통 contract를 쓰되 direction, option, validation, preview가 작업에 맞아야 한다. Pack 4의 parser·preview·codegen은 일반 operation보다 강한 security fixture를 요구한다.

### 일반 작업

```text
PRD/CHECKLIST 확인
→ 영향 경계와 실패 조건 기록
→ 가장 작은 수직 구현
→ pnpm verify
→ 브라우저 실동작 검증
→ diff 기반 문서 갱신
→ conventional commit
```

## 4. 작업 기록

진행 작업은 `docs/work/active/YYYY-MM-DD-slug.md`에 다음만 기록한다.

- Intent
- In scope / Out of scope
- Acceptance checks
- Privacy·performance impact
- Evidence
- Result / follow-up

완료 시 `completed/`로 이동한다. 같은 접근이 세 번 실패하면 즉시 중단하고 `docs/work/failure-patterns.md`에 원인과 다음 접근을 기록한다.

## 5. 명령 계약

루트 `package.json`은 다음 안정된 인터페이스를 제공한다.

```text
pnpm dev              # web + engine watch
pnpm build            # all publishable artifacts
pnpm verify           # 아래 fast gates 전체
pnpm test             # unit/fixture
pnpm test:e2e         # Playwright
pnpm test:privacy     # egress/storage/CSP
pnpm test:a11y        # axe + keyboard flows
pnpm test:perf        # bundle + benchmark
pnpm content:validate # tool/spec/i18n/links
pnpm desktop:verify   # Phase 3 활성 후 Tauri capability·fixture·package
pnpm deploy:staging
pnpm deploy
```

`verify`가 로컬과 CI에서 같은 스크립트를 호출한다. `desktop:verify`는 데스크톱 작업이 시작되기 전에는 no-op이 아니라 존재하지 않으며, 시작 ADR과 함께 root 계약에 추가한다. 수동으로만 존재하는 핵심 검증은 허용하지 않는다.

## 6. CI와 브랜치 규율

- `main`은 항상 배포 가능
- PR마다 preview URL
- required checks: type/lint, fixtures, privacy, E2E smoke, a11y, bundle
- detector PR은 coverage delta와 top confusion pair를 comment
- operation PR은 47-tool ledger·registry parity·chunk·security profile delta를 comment
- dependency PR은 network·bundle·license delta 포함
- production 배포는 태그와 changelog가 있는 수동 승인 단계
- rollback은 이전 정적 asset version 재배포로 5분 이내 가능
- desktop 활성 후 OS별 package job은 web CI와 분리하고, macOS → Windows → Linux 순차 release gate를 강제
- desktop release는 signing/notarization·updater signature·checksum·capability diff가 필수

## 7. 코드 리뷰 체크

### 제품

- 사용자가 더 빨리 올바른 결과에 도달하는가
- ambiguous 상태를 오답으로 숨기지 않는가
- 계정·업셀·AI가 새로 스며들지 않았는가

### 프라이버시

- raw input이 URL·log·storage·event·ad로 이동하지 않는가
- 새 network destination이 있는가
- CSP·egress allowlist가 함께 갱신됐는가

### 성능

- initial path에 새 dependency가 들어갔는가
- 큰 포맷이 lazy chunk인가
- main thread·memory budget을 지키는가

### 유지보수

- 한 owner가 명확한가
- detector와 UI가 duplicated format logic을 갖지 않는가
- 테스트가 구현 세부가 아니라 계약을 검증하는가

## 8. 주기 루프

### 매주

- 상위 unsupported·ambiguous 포맷 aggregate 검토
- Search Console 페이지별 노출·완료 검토
- Core Web Vitals·JS budget 확인
- dependency/security update triage

### 매 릴리스

- blind 품질 변화
- network destination diff
- tool/page inventory diff
- bundle diff
- changelog·sitemap·OSS package 동기화

### 광고 활성 후 매월

- 순광고수익·page RPM
- 활성·리텐션·CWV 가드레일
- 광고 정책·도메인·script hash 재심사
- 수익보다 운영·신뢰 비용이 크면 제거

### 데스크톱 활성 후 매 릴리스

- web/CLI/desktop fixture 결과 동등성
- capability·network destination·clipboard access diff
- cold start·shortcut latency·idle RSS
- signing/notarization·updater tamper·rollback

## 9. 자동화 파일

- `scripts/check-prd-links.ts`
- `scripts/check-tool-detector-parity.ts`
- `scripts/check-network-allowlist.ts`
- `scripts/check-content-freshness.ts`
- `scripts/report-bundle-delta.ts`
- `scripts/report-detector-confusions.ts`

동일 규칙을 문서·shell·CI에 복제하지 않고 하나의 script와 config를 공유한다.

## 10. 완료 조건

- 새 기여자가 README와 CHECKLIST만 읽고 첫 fixture PR을 만들 수 있음
- `pnpm verify` 한 명령이 로컬 핵심 게이트를 재현
- PR preview와 production rollback 실증
- detector·tool page·spec registry의 1:1 정합성 자동 검증
- 전략·보안 경계 변경이 ADR 없이 merge되지 않도록 템플릿·리뷰 규칙 가동
