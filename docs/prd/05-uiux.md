# PRD-05: UI/UX — 3초 안에 정체와 다음 행동

> 상위 문서: [마스터 플랜](./README.md) · 광고 배치: [PRD-04](./04-monetization.md)

## 1. 목표

사용자는 포맷을 고르거나 계정을 만들거나 설명을 읽은 뒤 시작하지 않는다. 페이지가 열리면 바로 붙여넣고, 3초 안에 정체·신뢰도·위험·다음 행동을 이해한다.

## 2. 정보 구조

### 전역 탐색

- 로고: 홈으로 이동
- `Tools`: 포맷 검색 command palette
- `Workspace`: 로컬 저장 기능을 켠 사용자에게만 강조
- `Docs`: privacy, methodology, changelog
- 우측: 로컬 실행 배지, theme, settings
- 로그인·가격·업그레이드 버튼 없음

### 라우트

- `/` — 범용 decoder
- `/tools` — category·검색·recent/favorite 기반 전체 catalog
- `/{tool}` — 고정 포맷 decoder 또는 formatter/converter/inspector/generator
- `/workspace` — 로컬 리댁션 결과·메모
- `/methodology` — confidence·fixture·privacy 설명
- `/privacy`, `/changelog`, `/about`
- `/{locale}/{tool}` — 국제화 게이트 후

### 많은 도구를 다루는 catalog UX

47개 이상으로 확장해도 홈에 거대한 아이콘 격자를 놓지 않는다.

- `⌘/Ctrl+K`에서 tool 이름·alias·행동(`format json`, `decode cert`, `make uuid`)을 함께 검색
- category: Detect & Decode / Format / Convert / Inspect / Generate / Encode
- `Recent`와 `Favorites`는 tool slug만 로컬 저장하고 원문·검색어는 저장하지 않음
- sidebar는 category와 자주 쓰는 도구만 보이고 전체 목록은 `/tools`와 command palette에서 탐색
- 입력을 붙이면 smart detection 결과와 사용할 수 있는 utility action을 함께 제안
- 구현되지 않은 도구를 disabled tile이나 “coming soon” SEO page로 노출하지 않음
- tool manifest 하나에서 route, label, alias, icon, category, help, lazy chunk를 생성

### 전용 utility 화면

```text
┌─ Tool: JSON Format ─────────────────────────────────────┐
│ [Input]                         [Output]                 │
│ raw text                        formatted tree/text      │
│                                                          │
│ [Format] [Minify] [Validate]   [Copy] [Use as input]    │
└──────────────────────────────────────────────────────────┘
```

- formatter/converter는 넓은 화면에서 input/output 1:1, 좁은 화면에서 세로 배치
- inspector는 구조 tree + 선택 detail, generator는 설정 + 즉시 preview
- `Use as input`은 direction을 명확히 뒤집고 기존 입력을 덮기 전 undo 1단계를 제공
- continuous mode는 pure operation만 허용; preview·고비용 parser는 명시적 Run 버튼
- tool을 선택할 때 해당 local lazy chunk만 불러오고 hover/focus intent 이후에만 prefetch

## 3. 핵심 화면

### A. 빈 상태

```text
┌──────────────────────────────────────────────────────────┐
│ decod.ing                   ● Your input stays here      │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Paste text or drop a file                               │
│  JWT, Base64, Hex, timestamps, compressed data…          │
│                                                          │
│  [ Try JWT ] [ Base64 → gzip → JSON ] [ Timestamp ]      │
│                                                          │
│  ⌘V paste   Drop file   Max 10 MiB                       │
└──────────────────────────────────────────────────────────┘
```

- 입력 surface가 첫 viewport의 주인공
- 자동 clipboard read 금지; 사용자의 paste 이벤트만 처리
- 예시는 synthetic이며 실제 secret처럼 보이지 않게 `example.invalid` 사용
- 배지 문구는 “0 bytes of your input sent” 또는 “Your input stays in this browser”

### B. 판별 중

- 100ms 이하는 spinner를 보이지 않음
- 100ms 이후 skeleton과 `Checking 8 formats locally…`
- 1초 이후 cancel 표시
- main thread 입력과 스크롤은 계속 반응

### C. 확신 있는 결과 — 넓은 화면

```text
┌──────────────────── Decode chain ────────────────────┬─ Inspector ───────┐
│ JWT 98%                                              │ Selected: payload │
│ ├─ header     { alg: RS256, typ: JWT }               │ Key / Value       │
│ ├─ payload                                             │ Copy field        │
│ │  ├─ exp  2026-07-14  ⚠ expired                     │ Spec reference    │
│ │  └─ aud  "staging"                                  │                  │
│ └─ signature  Not verified                            │                  │
├──────────────────────────────────────────────────────┴───────────────────┤
│ Other candidates: Base64URL 71% · JSON string 12%                        │
│ [Copy result] [Export redacted] [Wrong format?]                          │
└──────────────────────────────────────────────────────────────────────────┘
```

- chain tree와 inspector의 master-detail 구조
- 첫 노드는 자동 선택, 키보드로 이동
- raw, formatted, bytes 탭은 필요한 포맷에만
- 경고는 색·아이콘·텍스트·rule ID로 표현
- 서명 미검증을 “invalid”로 표현하지 않음

### D. 애매한 결과

- 제목: `We found a few possible formats`
- confidence와 근거를 카드로 비교
- 자동으로 하나를 정답처럼 펼치지 않음
- 사용자가 선택하면 tree 생성
- 선택 결과는 aggregate correction event만 전송 가능

### E. 지원하지 않음

- `We couldn't identify this yet.`
- 수동 포맷 검색
- 입력을 포함하지 않는 진단 코드 복사
- GitHub feature request 링크
- raw input을 issue에 붙이지 말라는 경고

### F. 안전 제한

- zip bomb, depth, memory, timeout을 서로 다른 오류로 설명
- 처리된 부분 결과는 유지
- `Open in CLI` 안내 시 안전한 stdin 명령만 제시

## 4. 인터랙션

| 키 | 동작 |
|---|---|
| `⌘/Ctrl+V` | 입력 surface에 붙여넣기 |
| `⌘/Ctrl+K` | 도구/포맷 command palette |
| `⌘/Ctrl+Shift+C` | 선택 노드 복사 |
| `↑/↓` | tree/candidate 이동 |
| `←/→` | tree 접기/펼치기 |
| `Esc` | palette 닫기 → 선택 해제 → 입력 clear 확인 순서 |
| `?` | 키보드 도움말 |

입력 clear는 민감 데이터 파괴 행동이므로 결과가 있으면 한 번 확인한다. 페이지 이탈 시 raw input은 메모리에서 해제한다.

## 5. 컴포넌트

### Astro 정적 컴포넌트

- `SiteHeader`, `ToolContent`, `SpecReference`, `FaqList`
- `PrivacyBadge`, `AdSlot`, `SiteFooter`
- `LocaleLinks`, `ChangelogEntry`

### Preact interactive island

- `DecoderWorkbench`
- `PasteSurface`, `FileDropZone`
- `CandidateList`, `DecodeTree`, `NodeInspector`
- `LintNotice`, `LimitNotice`, `ExportDialog`
- `LocalWorkspaceDialog`, `CommandPalette`
- `ToolCatalog`, `OperationWorkbench`, `OperationInspector`, `DirectionSwitch`

하나의 `DecoderWorkbench` island 안에서 상태를 소유하고 작은 island를 남발하지 않는다. 결과 값은 전역 store나 DOM attribute에 직렬화하지 않는다.

## 6. 시각 디자인

- 기본 테마는 OS 설정, 사용자가 light/dark 선택 가능
- 외부 폰트 없음: system sans + system monospace
- 본문 최대폭 72rem, decoder 최대폭 96rem
- 밀도 높은 데이터와 읽기 쉬운 설명 콘텐츠의 typography 분리
- confidence는 숫자+라벨(`High`, `Possible`, `Low`)로 표시
- depth 색상은 보조 수단이며 색만으로 계층을 표현하지 않음
- motion 150ms 이하, `prefers-reduced-motion` 존중

## 7. 반응형

- ≥1024px: tree 60% + inspector 40%
- 640~1023px: tree 위, inspector 아래 또는 drawer
- <640px: 입력·후보·tree 단일 열, inspector bottom sheet
- 모바일도 기능을 제거하지 않되 10MiB 파일은 장치 메모리 상태에 따라 더 낮게 제한 가능

## 8. 광고 UI

- 광고 도입 전 `AdSlot`은 DOM을 출력하지 않음
- 광고는 below-the-fold 설명 콘텐츠 뒤 또는 결과와 분리된 rail에 1개
- 고정 크기 skeleton이 아니라 실제 광고 활성 시에만 예약 공간 사용
- `Sponsored` 라벨과 광고주 도메인 표시
- 광고 색·버튼이 결과·경고·copy action과 혼동되지 않음
- PWA standalone, workspace, export dialog, desktop, extension에는 광고 없음

## 9. 접근성

- WCAG 2.2 AA
- tree는 적절한 `tree/treeitem/group` semantics와 roving tabindex
- 상태 변경은 과도하지 않은 `aria-live=polite`
- paste/drop에 동등한 keyboard input 제공
- focus ring 제거 금지
- 200% zoom과 고대비 모드 지원
- 경고·confidence·diff는 색에 의존하지 않음
- screen reader에서 raw secret을 자동으로 전체 낭독하지 않고 사용자가 펼칠 때만 읽음

## 10. UX 완료 조건

- 베타 10명 중 8명, 도움 없이 10초 내 완료
- 첫 입력까지 median ≤5초
- 잘못된 후보에서 2번 이하 동작으로 수정
- keyboard-only·screen-reader 핵심 플로우 통과
- 360px~1440px에서 horizontal overflow 없음
- 47-tool catalog에서 keyboard search 두 번 이하의 action으로 모든 구현 도구 실행
- manifest·route·search·help·lazy chunk parity 100%
- 선택하지 않은 heavy tool chunk가 초기 decoder bundle에 포함되지 않음
- 광고 도입 후 첫 viewport와 decoder action 영역의 시각적 변화 없음
