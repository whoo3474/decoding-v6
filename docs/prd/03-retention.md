# PRD-03: 리텐션 — 계정 없이 작업 동선에 남는 도구

> 상위 문서: [마스터 플랜](./README.md) · 저장 보안: [PRD-09](./09-security-privacy.md)

## 1. 목표

이메일·푸시·계정 락인 없이 “이 값이 뭐지?”라는 반복 순간에 가장 먼저 떠오르고 가장 빨리 실행되는 도구가 된다.

리텐션 수단은 알림이 아니라 다음 세 가지다.

1. 신뢰할 수 있는 판별 품질
2. 브라우저·터미널·오프라인 작업 동선
3. 사용자가 통제하는 로컬 편의성

## 2. 웹·PWA

### Phase 1

- 홈 진입 즉시 paste surface 활성
- 최근 사용 도구 목록만 로컬 저장(포맷 slug, 원문 없음)
- 테마·분석 허용 여부·접근성 설정 로컬 저장
- 주소창 검색 키워드 등록 안내: `decode <value>`는 사용자가 선택할 때만

### Phase 2 PWA

- 첫 방문 후 핵심 shell·engine·MVP detector 오프라인 사용
- 설치 후 standalone mode에서는 광고 요청 자체를 만들지 않음
- 새 버전은 작업 중 강제 갱신하지 않고 다음 실행 시 적용
- 오프라인 상태·엔진 버전을 명확히 표시

## 3. 로컬 워크스페이스

원시 입력 저장은 기본 OFF다. 워크스페이스는 사용자가 명시적으로 저장한 **리댁션된 구조와 메모**를 보관한다.

### 저장 가능

- 포맷·체인 구조
- 사용자가 선택한 비민감 필드
- rule ID와 경고 상태
- 사용자가 직접 작성한 이름·메모
- 원문을 제거한 두 결과의 구조 diff

### 기본 저장 금지

- 원시 blob, JWT 전체, secret/key, certificate private key
- decoded value 전체
- content hash
- clipboard 내용

민감 값 저장을 사용자가 강제로 선택하면 경고·TTL·브라우저 로컬 범위를 설명하고 별도 opt-in을 받는다. 동기화·백업·계정 복구는 제공하지 않는다.

### 제어

- 항목별 TTL: session / 24h / 7d / keep
- “Clear workspace” 즉시 삭제
- 저장 용량과 브라우저 범위 표시
- 내보내기 전 리댁션 preview

## 4. CLI

CLI는 `packages/engine`을 재사용하고 네트워크 기능을 포함하지 않는다.

```bash
pbpaste | decoding
cat payload.txt | decoding --format auto
decoding --file sample.bin --json
```

### 보안 계약

- blob을 positional argument로 받지 않음: shell history·process list 노출 방지
- stdin 또는 `--file`만 허용
- 파일을 수정하지 않고 stdout/stderr만 사용
- update check·telemetry 기본 없음
- `--offline`이 기본이며 네트워크 옵션 자체를 제공하지 않음
- secret-like output은 TTY에서 경고 후 표시, pipe에서는 결정적 출력

### 기능

- human tree / JSON / NDJSON 출력
- `--format`, `--max-depth`, `--no-lint`
- exit code: success / ambiguous / unsupported / unsafe-limit / invalid-args
- 웹과 동일 fixture로 결과 동등성 검증

## 5. 데스크톱 앱

브라우저 탭보다 더 빠른 반복 동선이 실제로 요청될 때만 [PRD-10](./10-desktop.md)의 Tauri 앱을 시작한다. 웹·PWA·CLI와 동일한 engine과 fixture를 사용하고 다음을 지킨다.

- global shortcut을 누른 순간에만 clipboard를 한 번 읽음
- quick panel에서 판별·복사, full workbench에서 chain·inspector 제공
- recent/favorite에는 tool slug만 저장하고 원문은 저장하지 않음
- update check·launch at login은 기본 OFF
- 광고·계정·결제·product telemetry 없음

데스크톱은 광고 pageview를 늘리는 채널이 아니라 습관과 신뢰를 강화하는 무료 배포 채널이다. macOS에서 반복·안정성 게이트를 통과한 뒤 Windows, 이후 Linux로 확장한다.

## 6. 브라우저 확장

Phase 3에 다음 조건을 충족할 때만 개발한다.

- 웹 재방문 사용자의 20% 이상이 선택 텍스트 동선을 요청하거나
- 확장 대기 목록·GitHub 요청 100건 이상

MVP 권한은 `contextMenus`, `activeTab`, `storage`로 제한한다. 선택 텍스트는 content script에서 로컬 engine worker로만 전달하고 서버·광고·계측으로 보내지 않는다. 광범위한 host permission과 clipboard 상시 감시는 금지한다.

## 7. 재방문 커뮤니케이션

- 이메일·웹푸시·리마케팅 없음
- `/changelog`와 RSS
- GitHub Releases/Watch
- 새 detector badge는 앱 내에서 한 번만 표시하고 로컬에서 닫힘 상태 저장
- 광고 네트워크 데이터를 리텐션 측정에 사용하지 않음

## 8. 리텐션 측정

- 분석 허용 시 브라우저에 30일마다 회전하는 무작위 cohort token 생성
- token은 계정·IP·payload와 결합하지 않음
- 서버에는 일/주 cohort와 event count만 기록
- 사용자는 Settings에서 분석을 끄고 token을 삭제할 수 있음
- PWA·CLI·desktop은 설치 수보다 실제 반복 작업 수를 우선

## 9. 완료 조건

- 4주 재방문 20% 이상
- PWA 설치 후 반복 작업률이 비설치 사용자보다 높음
- CLI 결과가 웹 fixture와 100% 동등
- workspace raw-storage 기본 OFF와 전체 삭제 E2E 통과
- desktop 개발 전 수요 게이트와 플랫폼 순차 출시 조건 문서화
- 확장 개발 전 수요 게이트 문서화
