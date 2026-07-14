# DevUtils 기능 감사 — decod.ing 데스크톱 계획 입력

> 조사일: 2026-07-15
> 목적: DevUtils를 복제하지 않고 다운로드형 decod.ing에 필요한 기능·워크플로우를 선별
> 출처: [공식 홈](https://devutils.com/), [전체 스크린샷](https://devutils.com/demo/), [공식 문서](https://devutils.com/docs/), [변경 기록](https://devutils.com/changelog/), [FAQ](https://devutils.com/faqs/), [가격](https://devutils.com/pricing/), [DevUtils vs CyberChef](https://devutils.com/devutils_vs_cyberchef/)

## 1. 현재 제품 개요

- DevUtils 1.17.0, 공식 홈은 `47+`로 표기하며 현재 공개 목록에서 확인되는 도구는 아래 47개
- macOS 10.13+, Intel·Apple Silicon
- direct download, Mac App Store, Setapp, Homebrew 제공
- Windows/Linux 버전은 개발 중이라고 안내
- 완전 오프라인. 네트워크는 license verification과 기본 비활성 auto-update에만 사용
- smart clipboard detection, status bar, global hotkey, macOS Service menu가 핵심 동선
- 가격은 영구 라이선스: Basic $29/1대, Personal $39/2대, Team $24/device

## 2. 공식 47개 도구 인벤토리

### Format / Validate / Minify — 10

1. JSON Format/Validate
2. HTML Beautify/Minify
3. CSS Beautify/Minify
4. JavaScript Beautify/Minify
5. ERB Beautify/Minify
6. LESS Beautify/Minify
7. SCSS Beautify/Minify
8. XML Beautify/Minify
9. SQL Formatter
10. Line Sort/Dedupe

### Data Converter — 17

11. URL Parser
12. YAML → JSON
13. JSON → YAML
14. Number Base Converter
15. JSON → CSV
16. CSV → JSON
17. HTML → JSX
18. String Case Converter
19. PHP → JSON
20. JSON → PHP
21. PHP Serializer
22. PHP Unserializer
23. SVG → CSS
24. cURL → Code
25. JSON → Code
26. Hex → ASCII
27. ASCII → Hex

### Inspect / Preview / Debug — 9

28. Unix Time Converter
29. JWT Debugger
30. RegExp Tester
31. HTML Preview
32. Text Diff Checker
33. String Inspector
34. Markdown Preview
35. Cron Job Parser
36. Color Converter

### Generators — 5

37. UUID/ULID Generate/Decode
38. Lorem Ipsum Generator
39. QR Code Reader/Generator
40. Hash Generator
41. Random String Generator

### Encoder / Decoder — 6

42. Base64 String Encode/Decode
43. Base64 Image Encode/Decode
44. URL Encode/Decode
45. HTML Entity Encode/Decode
46. Backslash Escape/Unescape
47. Certificate Decoder (X.509)

## 3. 도구 밖의 핵심 워크플로우 기능

- clipboard 내용 기반 Smart Detection
- global hotkey와 status/menu-bar 실행
- 선택 텍스트 → macOS Service `Inspect with DevUtils.app`
- Instant Copy와 Instant Replace Clipboard
- 입력/출력 전환(`Use as input`)
- 여러 window
- tool group과 Frequently Used Top 5/10/20
- tool 설명까지 포함한 keyboard search
- syntax highlighting, folding, line numbers, wrap
- light/dark mode
- tool별 설정 저장
- start at login, background 실행, Escape로 숨기기
- Raycast·Alfred·Terminal·URL Scheme integration
- file drag/drop
- signed update와 이전 버전 다운로드

## 4. decod.ing에 가져올 가치가 큰 것

### Desktop v1

- 모든 웹 detector와 chain tree
- explicit global hotkey → clipboard를 한 번 읽고 smart detect
- tray/menu bar + show/hide
- OS context/service menu: 선택 텍스트 decode
- file open/drop
- favorites/recent tools, keyboard search
- multiple windows
- copy output, redacted export
- signed manual update check

### Utility Pack 1

- JSON format/validate
- Unix timestamp
- JWT debugger
- Base64·URL·HTML entity·backslash encode/decode
- URL parser
- UUID/ULID generate/decode
- Hex/ASCII
- X.509 decoder
- Cron parser
- String inspector
- Hash generator

이 기능은 현재 detector/spec registry를 재사용하거나 작은 결정적 operation으로 구현 가능하다.

### Utility Pack 2 — 수요 게이트 후

- YAML ↔ JSON
- JSON ↔ CSV
- Number base
- Text diff
- RegExp tester
- Markdown preview
- String case
- Line sort/dedupe
- QR read/generate

## 5. 나머지 기능의 확장 배치

| 기능 | 판정 | 이유 |
|---|---|---|
| HTML/CSS/JS/XML formatter | Pack 3 | local lazy parser와 formatter fixture로 추가 |
| SQL Formatter | Pack 3 | dialect 표기·fixture·lazy dependency 조건 |
| HTML→JSX, SVG→CSS, Color | Pack 3 | pure conversion으로 구현 가능 |
| Lorem Ipsum, Random String | Pack 3 | 낮은 차별성이나 작은 pure operation이므로 catalog 완성 단계에 포함 |
| ERB/LESS/SCSS formatter | Pack 4 | code 실행 없이 parsing/formatting만 제공 |
| cURL → Code | Pack 4 | command 미실행 AST parser와 지원 언어별 template owner 필요 |
| JSON → Code | Pack 4 | 언어별 type semantics·version fixture 필요 |
| PHP converter/serializer 4개 | Pack 4 | PHP runtime 없이 제한 grammar parser/serializer로 구현 |
| HTML Preview | Pack 4 | script/form/navigation/download/network 차단 sandbox 필요 |
| arbitrary scripting | 기각 | 로컬 파일·shell·코드 실행 권한 확대 |
| continuous clipboard monitoring | 기각 | 민감 데이터 감시 인상과 불필요한 권한 |

[PRD-10](../prd/10-desktop.md)은 Pack 1 16개, Pack 2 11개, Pack 3 10개, Pack 4 10개로 공식 공개 47개 전체를 구현 가능한 backlog에 배치한다. 제외하는 것은 47개 도구가 아니라 별도 arbitrary scripting과 상시 clipboard 감시다.

## 6. 차별화 결론

DevUtils의 강점은 도구 47개의 숫자보다 **항상 켜져 있고, hotkey 한 번으로 clipboard를 감지하며, 도구별 UI가 작업에 맞게 설계된 것**이다. decod.ing은 이를 다음과 같이 변형한다.

- 47개 전체를 확장 지도에 넣되 detector·chain·evidence를 공통 중심으로 유지하고 Pack별로 검증
- 자동 clipboard 감시는 하지 않고 사용자의 shortcut 동작에서만 읽음
- 웹·CLI·desktop이 동일 engine과 fixture를 사용
- macOS 전용 native code 대신 Tauri 2로 macOS→Windows→Linux 순차 배포
- 무료·무로그인·오프라인, desktop에는 광고와 product telemetry 없음

## 7. 제품 리스크

- desktop은 웹 광고 pageview를 일부 대체하므로 직접 수익원이 아님
- macOS signing/notarization, Windows code signing, Linux packaging이 운영 부담
- system webview 차이로 렌더·clipboard·shortcut 회귀 가능
- updater endpoint가 새 network destination이 됨
- clipboard·file permission이 웹보다 강하므로 capability allowlist와 E2E가 필요

따라서 웹 Phase 2가 반복 수요를 증명한 뒤 desktop v1을 시작한다. “도구 수”가 아니라 web/PWA/CLI 반복 사용자 중 native hotkey 요청이 명확한지가 진입 게이트다.
