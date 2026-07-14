# PRD-01: 코어 제품 — 자동판별·재귀 디코딩 엔진

> 상위 문서: [마스터 플랜](./README.md) · 보안 계약: [PRD-09](./09-security-privacy.md)

## 1. 목표

사용자가 포맷을 고르지 않아도 텍스트를 붙여넣거나 파일을 놓으면 브라우저가 정체를 판별하고, 중첩 인코딩을 안전하게 풀어 구조·경고·다음 행동을 10초 안에 제공한다.

핵심 품질은 “무조건 답하기”가 아니라 **맞으면 근거 있게 답하고, 애매하면 애매하다고 말하는 것**이다.

## 2. MVP 입력과 결과

### 입력

- 텍스트 붙여넣기·직접 입력
- UTF-8 텍스트 파일 및 지원 바이너리 파일 drag-and-drop
- MVP 입력 상한 10MiB, 1MiB 이하를 주 성능 구간으로 최적화
- 입력은 URL, analytics, 광고, 오류 추적, clipboard 재기록에 포함하지 않음

### 결과

- 판별 후보 목록: 포맷, 신뢰도, 판별 근거
- 1위 후보의 구조화 결과와 재귀 체인 트리
- deterministic lint: 룰 ID, 심각도, 근거값, 공식 스펙 링크
- 노드·필드별 복사, 전체 구조를 JSON/Text로 로컬 내보내기
- “Correct / Wrong format” 피드백. Wrong 선택 시 후보 변경 또는 수동 포맷 선택

## 3. 포맷 범위

### Phase 1 — MVP 8개 포맷군

| 포맷군 | 최소 기능 |
|---|---|
| JWT/JWS compact | header·payload·시간 claim, 알고리즘·만료 lint. 서명 검증은 공개키/secret을 로컬에서 명시 입력할 때만 |
| Base64/Base64URL | padding 변형, text/binary 구분, 내부 포맷 재판별 |
| JSON/JSON string | parse tree, escaped JSON 해제, 큰 정수 문자열 보존 |
| Hex | prefix·공백 변형, bytes/text preview, 내부 포맷 재판별 |
| URL encoding/query string | 다중 인코딩 탐지, key 중복 보존, `+` 의미 구분 |
| Epoch timestamp | s/ms/µs/ns 후보, UTC·local 표시, 비현실 범위 경고 |
| UUID/ULID | UUID v1/4/7·ULID 판별, 포함 시간만 추출 |
| gzip/zlib/deflate | magic byte·스트림 검증, 압축 해제 후 재판별, zip bomb 가드 |

### Phase 2 — 실제 실패 입력을 근거로 추가

- HTML entities, Unicode escapes
- PEM/X.509, SSH public key/fingerprint
- IPv4/IPv6 및 정수 표현
- Cron expression
- Punycode/IDN
- MIME/quoted-printable
- CBOR, MessagePack, Protobuf wire

### Phase 3 후보

- QR/바코드 이미지 로컬 인식
- ASN.1 상세 뷰
- User-Agent 구조화
- 사용자 정의 디텍터: 임의 JavaScript가 아닌 선언형 패턴·스키마만

포맷은 페이지 수를 채우기 위해 추가하지 않는다. 익명 실패 카운트, GitHub 요청, 사용자 인터뷰 중 둘 이상의 근거가 있는 포맷만 승격한다.

## 4. 판별·체인 계약

```ts
export interface DetectionEvidence {
  code: string
  weight: number
  detail?: string
}

export interface Detection<T = DecodedValue> {
  detectorId: string
  confidence: number          // 0..1, 블라인드셋으로 calibration
  evidence: DetectionEvidence[]
  value: T
  warnings: LintWarning[]
  nextInputs: DecodeInput[]
}

export interface Detector {
  readonly id: string
  readonly media: readonly ('text' | 'bytes')[]
  detect(input: DecodeInput, context: DetectContext): Detection | null
}
```

### 자동 전개 기준

- 1위 confidence ≥ 0.85
- 1위와 2위 차이 ≥ 0.15
- 해당 디텍터의 필수 구조 검증 통과

기준 미달이면 자동 전개하지 않고 “Ambiguous” 상태에서 후보를 제시한다. confidence는 장식용 퍼센트가 아니라 블라인드 holdout으로 보정한다.

### 재귀 제한

- 최대 depth 8
- 최대 노드 64
- 동일 `(detectorId, contentDigest)` 재등장 시 cycle 종료
- 누적 확장 결과 32MiB
- 압축 확장비 100:1
- 한 작업 CPU budget 2초, 초과 시 부분 결과와 중단 이유 표시
- digest는 메모리 내 cycle 판정에만 쓰고 저장·전송하지 않음

## 5. 설명과 보안 lint

생성형 AI를 사용하지 않는다. 설명은 다음 조합으로 만든다.

- 구조화된 detector output
- 포맷별 메시지 카탈로그
- 계산된 날짜·길이·알고리즘 상태
- 버전 고정된 공식 스펙 레지스트리

모든 경고는 `ruleId`, `severity`, `specRef`, `observedValue`, `safeNextStep`을 가진다. “위험할 수 있음” 같은 근거 없는 문구는 금지한다.

MVP lint:

- JWT `alg=none`, 만료·미래 `nbf`, 약한/예상 밖 알고리즘
- X.509 만료·아직 유효하지 않음(Phase 2)
- URL 안의 credential 형태
- 디코딩 결과의 private-key header

PII·secret 탐지는 오탐 위험이 높으므로 차단이 아니라 로컬 경고만 제공하고, 어떤 값도 전송하지 않는다.

## 6. 파일·메모리 처리

- 텍스트 입력은 dedicated Web Worker에서 처리
- 바이너리는 `ArrayBuffer` transfer로 복사 최소화
- 압축·CBOR 등 무거운 기능은 동적 import
- 결과 tree는 전체 문자열 복제 대신 slice/reference 사용
- 10MiB 초과 파일은 Phase 1에서 거절하고 CLI 안내
- 메모리 예상치가 128MiB를 넘으면 작업 전 중단

## 7. 픽스처와 정확도

디텍터당 다음 데이터가 필요하다.

- positive ≥ 20
- edge/ambiguous ≥ 10
- negative ≥ 20
- 다른 모든 디텍터 positive의 교차 음성 주입
- 구현자가 보지 못한 blind holdout ≥ 20

정확도는 전체 평균으로 숨기지 않고 포맷별 precision, recall, abstain rate, 후보 전환율을 보고한다. blind set은 CI 공개 결과만 제공하고 fixture 본문은 별도 테스트 패키지에서 관리한다.

## 8. 기능 우선순위

### Must

1. 8개 MVP 포맷군
2. 후보·근거·ambiguous 상태
3. 재귀 체인과 안전 제한
4. 복사·내보내기·수동 포맷 전환
5. deterministic lint
6. 네트워크 데이터 경계 자동 테스트

### Should

- 샘플 입력 4종
- 같은 입력의 다른 후보 비교
- 로컬 파일 처리
- 오류를 재현할 수 있는 payload 없는 진단 코드

### Later

- 로컬 워크스페이스
- CLI·PWA·확장
- 선언형 커스텀 디텍터

## 9. 완료 조건

- MVP 각 포맷 blind precision ≥95%, recall ≥90%
- ambiguous 입력을 오답으로 단정하는 비율 ≤2%
- 1MiB 입력 첫 후보 p75 ≤100ms, 결과 렌더 p75 ≤300ms(기준 장치)
- depth·cycle·zip bomb·메모리 제한 테스트 통과
- 입력·결과가 허용된 네트워크 요청 어디에도 포함되지 않음을 E2E로 증명
- 외부 베타 10명 중 8명이 설명 없이 10초 내 첫 작업 완료
