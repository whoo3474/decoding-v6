# PRD-09: 보안·프라이버시 — 입력이 절대 경계를 넘지 않는 구조

> 상위 문서: [마스터 플랜](./README.md) · 엔진: [PRD-01](./01-product-core.md) · 광고: [PRD-04](./04-monetization.md)

## 1. 보안 목표

decod.ing은 사용자가 평문으로 공유하면 안 되는 데이터를 다룰 가능성이 높다. “브라우저에서 실행”이라는 설명만으로 안전을 주장하지 않고, 데이터 흐름·저장·광고·의존성·오류 경계를 테스트 가능한 계약으로 만든다.

보장 범위:

- 입력과 디코딩 결과가 애플리케이션 네트워크 요청에 포함되지 않음
- 기본 상태에서 raw input을 영구 저장하지 않음
- 외부 스크립트가 decoder runtime과 데이터 참조를 공유하지 않음
- 악성·대형 입력이 브라우저를 장시간 잠그거나 메모리를 고갈시키지 않음

보장하지 않는 범위:

- 이미 감염된 브라우저·OS·확장프로그램
- 사용자가 직접 복사·스크린샷·내보내기한 데이터
- 개발자 도구나 화면을 볼 수 있는 로컬 공격자
- 사용자가 빌드 무결성을 검증하지 않은 제3자 미러

## 2. 데이터 분류

| 등급 | 예 | 저장 | 네트워크 |
|---|---|---|---|
| S0 Public | tool slug, spec version, locale | 허용 | 허용된 destination만 |
| S1 Aggregate | event name, confidence bucket, duration bucket | 제한적 | schema 검증 후 허용 |
| S2 Sensitive metadata | 정확한 길이, chain digest, 파일명, field name | 기본 금지 | 금지 |
| S3 Secret payload | raw input, decoded value, JWT, key, certificate content | 메모리 only | 절대 금지 |

광고에는 S0 중 tool category만 사용할 수 있고 S1~S3는 전달하지 않는다.

## 3. 데이터 흐름

```text
User paste/file
  → Preact DecoderWorkbench memory
  → transferable message
  → dedicated Web Worker
  → engine/detectors/lint
  → structured result
  → UI memory

별도 경로:
S0/S1 allowlisted event → /e → aggregate dataset
tool category → isolated ad slot → approved ad network
```

두 별도 경로는 decoder state를 import하거나 참조할 수 없다.

## 4. 네트워크 allowlist

### 광고 도입 전

- same-origin static assets
- 선택적 same-origin `/e`
- Cloudflare Web Analytics beacon이 승인됐다면 해당 endpoint

### 광고 도입 후

- 위 항목
- 승인된 광고 네트워크의 문서화된 script/frame/image host

그 외 destination은 CSP와 Playwright route audit로 차단한다. connect/script/frame/img host 변경은 security review와 ADR이 필요하다.

## 5. 이벤트 스키마

허용 필드 예:

```ts
type ProductEvent = {
  name: 'paste_started' | 'detection_completed' | 'candidate_changed' | 'task_completed' | 'limit_hit'
  tool: string                 // route의 공개 slug
  detector?: string            // 공개 detector id
  confidenceBucket?: 'high' | 'medium' | 'low'
  durationBucket?: '<100ms' | '100-300ms' | '300ms-1s' | '>1s'
  sizeBucket?: '<1KiB' | '1-100KiB' | '100KiB-1MiB' | '>1MiB'
  build: string
}
```

금지:

- raw/decoded text, fragment, preview
- hash·digest·signature
- exact length·exact duration
- file name·path·MIME supplied by user
- arbitrary error message·stack with data
- stable user ID, email, account ID

collector는 allowlist 외 key와 2KiB 초과 body를 거절한다.

## 6. 로컬 저장

- raw input은 component/worker memory에만 존재
- page hide/unload/clear 때 reference 해제
- localStorage에는 theme, locale, analytics consent, recent tool slug만
- IndexedDB workspace는 opt-in redacted record만
- service worker cache에 사용자 input/result response가 존재하지 않음
- clipboard write는 사용자의 명시적 버튼에서만
- URL query/hash/history state에 S2/S3 금지

## 7. 광고 격리

- 광고 컴포넌트는 decoder props·context·store 접근 금지
- 결과 DOM의 텍스트를 읽을 수 없는 sandboxed iframe 우선
- 같은 document script가 필수인 네트워크는 별도 보안 검토
- 광고 script는 decoder 완료 전 로드하지 않음
- 광고 오류를 `console`에 사용자 데이터와 함께 기록하지 않음
- 광고 클릭 URL에 event/cohort token을 붙이지 않음
- network policy 변경을 월 1회 검토

정적 스폰서는 빌드 시 다음을 검사한다.

- image type·dimensions·size
- destination HTTPS·allowlist
- HTML/JS/SVG active content 없음
- 기간 만료
- `rel=sponsored`와 라벨

## 8. 악성 입력 방어

- chain depth 8, node 64
- 10MiB input, 32MiB expanded output
- compression ratio 100:1
- 2초 CPU budget과 cancel
- parser recursion·collection size 제한
- regex는 catastrophic backtracking 검토와 timeout test
- HTML/XML 결과를 DOM으로 실행하지 않고 text로 렌더
- JSON prototype pollution key를 data로만 취급
- certificate/key parser의 private material 자동 복사 금지

## 9. 브라우저 보안 헤더

초기 목표 정책:

- `Content-Security-Policy`: default-src self, object-src none, base-uri none, form-action none
- `frame-ancestors 'none'`
- `Referrer-Policy: strict-origin`
- `Permissions-Policy`: camera, microphone, geolocation, payment 등 불필요 권한 차단
- `X-Content-Type-Options: nosniff`
- HTTPS/HSTS
- Trusted Types는 지원 범위 검증 후 활성화

광고 단계에는 필요한 host만 좁게 추가하고 `unsafe-eval`은 허용하지 않는다.

## 10. 공급망·릴리스

- 최소 production dependencies
- lockfile, provenance 가능한 package, license allowlist
- dependency install script 기본 거부·예외 기록
- 주간 vulnerability scan
- release artifact hash와 engine version 공개
- OSS security policy와 비공개 신고 채널
- source map·fixture에 secret 없음 자동 검사

## 11. 프라이버시 검증

Playwright는 synthetic canary를 입력한 뒤 다음을 수집한다.

- request URL/header/body
- beacon/fetch/XHR/WebSocket
- localStorage/sessionStorage/IndexedDB/cache storage
- browser history state
- console/error report

canary 원문·부분 문자열·base64·URL encoding·digest가 어디에도 나타나지 않아야 한다. 광고 on/off, analytics on/off, PWA offline, error/limit 경로를 각각 테스트한다.

## 12. 사고 대응

payload egress 가능성이 발견되면:

1. 광고·analytics feature flag를 build-time `none`으로 전환
2. 이전 안전 정적 버전 rollback
3. 영향 버전과 destination 조사
4. 보안 공지와 재현·수정·검증 공개
5. 원인 계약을 테스트로 추가

사용자 payload를 서버에 저장하지 않으므로 삭제 API를 만들지 않는다. 저장 가능성이 확인되면 해당 시스템의 로그 보존·삭제 절차를 즉시 실행한다.

## 13. 데스크톱 보안 경계

데스크톱 앱은 브라우저보다 강한 OS 권한을 가질 수 있으므로 [PRD-10](./10-desktop.md)의 capability allowlist를 별도 제품 경계로 취급한다.

- 기본 네트워크 destination 0개. 사용자가 요청한 signed update manifest/artifact만 예외
- global shortcut 동작에서 clipboard를 한 번 읽고 즉시 worker memory로 전달; background polling 금지
- clipboard write·file dialog·외부 spec link는 각각 명시적 사용자 action에서만 실행
- 사용자가 고른 file scope 밖 filesystem, arbitrary shell/process, raw socket, unrestricted HTTP 금지
- `decoding://` deep link는 tool slug만 허용하고 payload·file path·command parameter를 거절
- web 광고·analytics adapter와 desktop updater를 같은 module/config로 묶지 않음
- Tauri capability JSON·plugin·command diff는 security review 없이 merge 금지
- updater signature 검증 실패·downgrade·manifest 변조·redirect를 E2E에서 거절

Desktop privacy suite는 explicit action 밖 clipboard read, file scope 밖 access, update check OFF 상태의 request가 모두 0건임을 검증한다.

## 14. 완료 조건

- 데이터 분류·흐름·allowlist가 코드 config와 1:1 대응
- canary privacy suite가 광고/분석/오류 전 조합 통과
- raw-storage 기본 OFF와 clear/unload 검증
- zip bomb·regex·depth·memory 공격 fixture 통과
- CSP report-only → enforce 전환 검증
- 광고 네트워크 심사 체크리스트와 kill switch 실증
- desktop 활성 시 capability·clipboard·file·signed updater privacy suite 통과
