# PRD-10: 데스크톱 앱 — hotkey로 여는 오프라인 디코더

> 상위 문서: [마스터 플랜](./README.md) · 경쟁 감사: [DevUtils feature audit](../research/2026-07-15-devutils-feature-audit.md) · 보안: [PRD-09](./09-security-privacy.md)

## 1. 결정

다운로드형 앱은 제품 방향에 적합하다. 로컬 실행 약속을 강화하고, 브라우저 탭을 찾지 않고 hotkey 한 번으로 사용하는 반복 동선을 만든다.

단, 웹 MVP와 동시에 만들지 않는다. 웹·PWA·CLI에서 반복 사용이 증명된 후 동일 engine을 감싸는 **무료·무로그인·무광고 데스크톱 클라이언트**로 제공한다.

장기 catalog 목표는 DevUtils가 현재 공개한 47개 도구를 모두 안전한 형태로 수용하고, 여기에 decod.ing 고유의 auto-detect·recursive chain·evidence inspector를 더하는 것이다. 47개는 출시를 한 번에 묶는 범위가 아니라 아래 Pack 1~4의 완전한 확장 지도다.

`packages/operations`와 `workbench-ui`는 web/PWA/desktop 공유다. pure/parser utility는 웹에서도 먼저 출시할 수 있고, 데스크톱은 이미 검증된 catalog에 native hotkey·clipboard·file·window 동선을 더한다.

## 2. 진입 게이트

다음 중 하나를 만족하고, 웹 Phase 2 품질 게이트가 유지될 때 시작한다.

- 4주 재방문 사용자 20% 이상이 native hotkey/desktop을 요청
- desktop waitlist 또는 GitHub 요청 300건
- PWA+CLI 반복 사용자 500명과 인터뷰 15명 중 8명 이상 설치 의향

플랫폼 우선순위:

1. macOS universal(Apple Silicon + Intel)
2. Windows x64/arm64
3. Linux AppImage/deb

macOS에서 4주 안정화 후 Windows, 두 플랫폼의 crash/privacy gate 후 Linux로 확장한다.

## 3. 사용자 경험

### 첫 실행

1. 앱이 완전 오프라인으로 동작함을 설명
2. global shortcut 설정(기본값을 강제하지 않고 충돌 검사)
3. clipboard는 shortcut을 눌렀을 때만 읽는다고 설명
4. launch at login·update check는 기본 OFF
5. 샘플로 첫 smart detection 실행

### 주 흐름

```text
copy opaque value
→ global shortcut
→ compact window appears
→ clipboard read once
→ auto-detect + chain
→ copy selected result
→ Esc hides window
```

clipboard가 비어 있거나 지원되지 않으면 이전 입력을 유지하지 않고 paste/file 선택을 보여준다.

### 창 모드

- Quick panel: 후보·요약·첫 경고·copy
- Full workbench: web과 같은 chain tree·inspector
- 여러 window: 서로 다른 입력 비교
- 항상 위·menu/tray 동작은 사용자 설정

## 4. Desktop v1 기능

### 코어

- 웹 MVP+Phase 2 detector 전부
- recursive chain, confidence, ambiguous, deterministic lint
- text/file input, redacted export
- favorites·recent tool slug(원문 없음)
- tool search·keyboard navigation
- multiple windows

### 네이티브 동선

- global shortcut
- tray/menu bar show/hide
- macOS Service / Windows context action / Linux desktop action
- `decoding://tool/{slug}` deep link — payload parameter 금지
- OS Open With와 file dialog
- optional launch at login
- signed update check와 manual install

### Utility Pack 1

- JSON format/validate
- Unix timestamp
- JWT debugger
- Base64 text/image, URL, HTML entity, backslash encode/decode
- URL parser
- UUID/ULID generate/decode
- Hex ↔ ASCII
- X.509 decoder
- Cron parser
- String inspector
- Hash generator

각 utility는 공통 input/result contract를 사용하되, DevUtils처럼 작업에 맞는 전용 inspector UI를 가질 수 있다. detector scoring과 formatter operation을 한 함수에 섞지 않는다.

## 5. 전체 47개 확장 지도

기능은 4개 안팎의 수직 slice로 구현·검증하되 Pack 단위가 끝날 때 한 번에 배포할 필요는 없다. 각 도구는 독립 lazy chunk, operation manifest, 전용 inspector, fixture를 가진다.

### Utility Pack 2 — 변환·검사 11개

- YAML ↔ JSON
- JSON ↔ CSV
- Number base converter
- Text diff
- RegExp tester
- Markdown preview(script disabled)
- String case converter
- Line sort/dedupe
- QR read/generate

### Utility Pack 3 — 안전한 formatter·generator 10개

- HTML Beautify/Minify
- CSS Beautify/Minify
- JavaScript Beautify/Minify
- XML Beautify/Minify
- SQL Formatter
- HTML → JSX
- SVG → CSS
- Color Converter
- Lorem Ipsum Generator
- Random String Generator

### Utility Pack 4 — 고위험 parser·preview·codegen 10개

- ERB Beautify/Minify
- LESS Beautify/Minify
- SCSS Beautify/Minify
- PHP → JSON
- JSON → PHP
- PHP Serializer
- PHP Unserializer
- cURL → Code
- JSON → Code
- HTML Preview

Pack 4는 다음 추가 조건을 충족해야 한다.

- PHP runtime이나 arbitrary code execution을 번들하지 않고 제한된 grammar parser/serializer로 구현
- cURL은 command를 실행하지 않고 AST로 파싱하며 credential header를 preview·copy 전에 경고
- codegen template은 지원 언어·버전 fixture와 owner를 명시하고, 초기에는 유지 가능한 언어 subset부터 확장
- HTML Preview는 script·form·navigation·download·network를 차단한 sandbox document에서만 실행
- ERB/LESS/SCSS는 formatting/parsing만 제공하고 template·build code를 실행하지 않음

DevUtils 공개 목록 기준 coverage는 Pack 1의 16개 + Pack 2의 11개 + Pack 3의 10개 + Pack 4의 10개 = 47개다. 방향이 나뉜 공식 도구(Hex→ASCII/ASCII→Hex, YAML→JSON/JSON→YAML 등)는 인벤토리와 동일하게 별도 개수로 센다.

## 6. 기술 구조

Tauri 2 + Vite/Preact를 사용한다.

```text
apps/desktop/
├─ src/                         # Preact shell
│  ├─ quick-panel/
│  ├─ workbench/
│  ├─ settings/
│  └─ native-adapter/
├─ src-tauri/
│  ├─ src/                      # 최소 command·window lifecycle
│  ├─ capabilities/             # OS별 최소 권한
│  ├─ icons/
│  └─ tauri.conf.json
└─ tests/

packages/workbench-ui/          # web/desktop 공유 Preact UI
packages/operations/            # registry + formatter/converter/inspector/generator/encoder
packages/engine/                # detector/chain
```

Tauri는 OS webview를 사용하므로 Electron처럼 브라우저 런타임을 앱마다 포함하지 않는다. Rust command는 OS 통합에만 사용하고 detector logic은 TypeScript SSOT로 유지한다.

### Operation plugin contract

```ts
type OperationPlugin = {
  id: string
  category: 'format' | 'convert' | 'inspect' | 'generate' | 'encode'
  inputKinds: Array<'text' | 'bytes' | 'file' | 'structured'>
  outputKinds: Array<'text' | 'bytes' | 'structured' | 'preview'>
  detect?: (sample: Uint8Array) => DetectionEvidence
  load: () => Promise<OperationRuntime>
  inspector: () => Promise<OperationInspector>
  securityProfile: 'pure' | 'parser' | 'preview'
}
```

- registry metadata와 search index만 startup bundle에 포함
- parser·syntax highlighter·QR/image dependency는 tool별 local dynamic import
- 모든 lazy chunk는 installer에 포함되어 offline에서 동작하며 runtime download 금지
- operation은 OS API를 직접 호출하지 않고 native adapter를 명시적 action에서만 사용
- tool manifest ↔ route/search ↔ inspector ↔ fixture의 1:1 parity를 CI로 검증

## 7. Capability allowlist

허용 후보:

- global shortcut register/unregister
- clipboard read/write: 사용자 shortcut·copy action 때만
- dialog: 사용자가 고른 파일
- opener: 외부 spec link
- single instance
- window state
- updater: signed HTTPS artifact

기본 금지:

- arbitrary shell/process
- unrestricted filesystem
- HTTP client와 WebSocket
- SQL/store cloud sync
- notification, location, camera, microphone
- continuous clipboard monitor

OS별 capability JSON에서 필요한 window와 command를 명시하고 broad default permission을 사용하지 않는다.

## 8. 업데이트·배포

- GitHub Releases 또는 전용 static release manifest
- Tauri updater signature 필수, private key는 CI secret manager
- update check 기본 OFF, Settings에서 opt-in 또는 수동 Check
- crash reporter·product telemetry 없음
- 다운로드 페이지에 SHA-256와 signing/notarization 상태 표시

### 산출물

- macOS: notarized universal `.dmg`, Homebrew Cask는 안정화 후
- Windows: signed `.msi`/NSIS, winget는 안정화 후
- Linux: AppImage + deb, checksum

App Store·Microsoft Store는 direct distribution이 안정된 뒤에만 검토한다.

## 9. 광고·수익 경계

- desktop UI에 광고·스폰서 없음
- 웹 광고 script나 network adapter를 번들하지 않음
- About/Changelog에서 공식 웹사이트 링크만 제공
- desktop 다운로드가 웹 pageview를 줄이는 것은 신뢰·리텐션을 위한 의도된 tradeoff
- desktop 유료 라이선스·결제·계정 도입은 현재 사업모델을 바꾸므로 새 ADR과 사용자 결정 필요

## 10. 성능 예산

- cold start p75 ≤700ms macOS/Windows 기준
- warm shortcut → quick panel p75 ≤200ms
- clipboard → first result p75 ≤300ms
- idle RSS 목표 ≤100MiB
- installer 목표 ≤20MiB(플랫폼 runtime 제외 방식 기준)
- Pack 확장 후 installer가 20MiB를 넘으면 기능 삭제보다 parser 중복 제거·chunk dedupe를 먼저 수행하고, 30MiB hard ceiling은 새 ADR 없이 넘지 않음
- background idle CPU 0%에 수렴
- network 0건(update check를 사용자가 누른 경우 제외)

## 11. 테스트

- web/CLI/desktop engine fixture 동등성
- 47-tool inventory ↔ operation registry ↔ inspector ↔ help content parity
- tool별 local lazy chunk가 offline에서 로드되고 startup chunk에 섞이지 않음
- shortcut 충돌·register/unregister
- clipboard read가 명시 동작 외 발생하지 않음
- selected-file scope 밖 접근 실패
- deep link payload parameter 거절
- update signature tamper 실패
- PHP/template/cURL 입력이 local process·shell·network를 실행하지 않음
- HTML Preview sandbox에서 script·form·navigation·download·network 0건
- macOS Intel/ARM, Windows x64/ARM, Linux display server matrix
- quick panel keyboard/screen-reader
- sleep/wake, monitor change, multiple window, app relaunch

## 12. 완료 조건

- macOS beta 100 installs, 4주 반복 실행 30% 이상
- crash-free session 99.5% 이상(로컬 opt-in beta report 또는 tester report)
- explicit action 외 clipboard read 0건
- 광고·계정·결제·product telemetry dependency 0개
- 공개 47-tool expansion ledger에서 미구현·구현·차단 이유가 항상 추적 가능
- signed update·rollback·checksum 검증
- Windows/Linux 확장은 macOS 품질과 수요 게이트 후에만
