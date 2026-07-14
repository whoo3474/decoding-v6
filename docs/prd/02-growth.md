# PRD-02: 성장 — 검색·커뮤니티·오픈소스 유통

> 상위 문서: [마스터 플랜](./README.md) · 광고 계약: [PRD-04](./04-monetization.md)

## 1. 목표

광고비·회원가입·이메일 마케팅 없이 개발자가 문제를 겪는 순간에 발견되고, 유용해서 다시 찾고, 신뢰할 수 있어 동료에게 공유하는 유통 구조를 만든다.

우선순위는 **제품 품질 → 도구성 검색 → 커뮤니티 런칭 → OSS → 국제화**다.

## 2. 획득 퍼널

```text
검색·GitHub·커뮤니티
  → 도구가 바로 보이는 랜딩
  → 붙여넣기
  → 후보 수락/교정
  → 복사·내보내기
  → 북마크/PWA/CLI/재방문
  → 반복 수요가 증명되면 desktop download
```

각 단계는 aggregate event로만 측정하며 입력·결과·사용자 계정이 없다.

## 3. 도구 페이지 SEO

### URL과 페이지 계약

- 영어 기본: `/{tool}` — `/jwt`, `/base64`, `/timestamp`, `/certificate`
- 로케일: `/{locale}/{tool}` — 데이터 게이트 후에만
- 첫 화면에 실제 동작하는 도구 배치
- 아래에 포맷 정의, 판별 근거, 흔한 오류, 보안 주의, 공식 스펙, FAQ
- 각 페이지는 해당 detector 또는 operation의 실제 기능과 fixture를 공유
- 정적 OG 이미지·canonical·hreflang·SoftwareApplication JSON-LD

### 출시 배치

- Phase 1: MVP detector와 1:1인 8페이지
- Phase 2 이후: 검색 노출·실패 수요가 확인된 detector/utility 페이지를 4개 단위로 추가
- 한 페이지가 6주 동안 노출·작업 완료를 만들지 못하면 통합 또는 제거
- FAQ 구조화 데이터나 `llms.txt`를 순위 보장 수단으로 취급하지 않음

### 콘텐츠 품질 게이트

- 공식 스펙 또는 포맷 소스 링크 ≥1
- 다른 페이지의 문장 복제 금지
- 실행 가능한 안전한 예시 ≥3
- 실제 detector/operation이 없는 포맷·utility 페이지 금지
- 광고보다 도구와 답이 먼저 보여야 함

## 4. 공개 런칭

### 비공개 베타

- 개발자/SRE/보안 사용자 10명
- 사용자가 가져온 민감하지 않은 샘플은 사용자 브라우저에서만 실행
- 막힌 시점, 잘못 고른 후보, 완료 시간 기록
- 8/10이 설명 없이 10초 내 첫 작업을 완료해야 공개 런칭

### 공개 순서

1. Show HN: 자동판별 + 로컬 실행 + 체인 데모
2. GitHub 공개: 엔진·위협 모델·fixture 방식
3. r/webdev → r/devops → r/netsec: 각 커뮤니티 문제에 맞는 예시
4. Product Hunt는 지속 유입이 확인된 뒤 보조 런칭

한 커뮤니티에 같은 문구를 복제하지 않는다. 실패·오탐을 숨기지 않고 재현 가능한 synthetic fixture로 전환한다.

## 5. OSS 유통

Phase 2에 `@decoding/engine`을 MIT로 공개한다.

- 웹과 동일한 detector·chain 코드
- README에 “입력 전송 없음”의 범위와 위협 모델 명시
- 브라우저·Node 예제
- fixture-first 기여 가이드
- security policy와 private vulnerability reporting
- 릴리스 changelog와 detector coverage 표

OSS 스타는 목표가 아니라 신뢰·기여·웹 유입의 선행지표다. 라이브러리 사용을 유료 API로 전환하려는 퍼널은 만들지 않는다.

## 6. 안전한 공유 루프

- 기본 공유: 포맷명·체인 모양·경고 rule ID만 포함한 로컬 생성 이미지/텍스트
- 원문·decoded value·부분 문자열·digest는 공유물에 포함하지 않음
- 공유 링크에 사용자 payload를 넣는 기능은 제공하지 않음
- Slack/PR용 Markdown 복사 제공
- 공유 카드 footer에 `Decoded locally at decod.ing`만 표시

## 7. 성장 지표

| 지표 | 목적 |
|---|---|
| 검색 노출 → 방문 CTR | 제목·검색 의도 정합성 |
| 방문 → 붙여넣기 | 랜딩 즉시성 |
| 붙여넣기 → 작업 완료 | 제품 실제 가치 |
| 후보 전환·Wrong format | 판별 품질 |
| 7일·28일 재방문 | 반복 도구성 |
| 도구 페이지별 완료 작업 | 페이지 유지·삭제 판단 |
| GitHub → 웹 리퍼러 | OSS 유통 효과 |

국가·언어는 coarse aggregate로만 보고 개인 프로필을 만들지 않는다.

## 8. 광고와 성장의 경계

- Phase 1~3 런칭 페이지는 광고 없음
- 광고 도입 후에도 검색 랜딩의 첫 viewport는 도구 전용
- 광고 클릭을 제품 이벤트와 사용자 단위로 결합하지 않음
- 광고 수익을 위해 페이지를 얇게 대량 생성하지 않음
- 광고가 활성·리텐션·Core Web Vitals 가드레일을 넘으면 즉시 제거

## 9. 데스크톱 배포 성장 루프

[PRD-10](./10-desktop.md)의 수요 게이트를 통과한 뒤에만 `/download`를 공개한다.

- 첫 배포는 macOS universal beta 한 플랫폼에 집중
- 다운로드 페이지에 OS 요구사항·서명/notarization·checksum·권한·무네트워크 범위를 명시
- GitHub Release와 direct download를 같은 signed artifact로 연결
- 설치 수보다 4주 반복 실행·shortcut 사용 작업·uninstall 이유를 우선
- Windows는 macOS 안정화, Linux는 macOS/Windows 안정화 후 별도 런칭
- desktop에는 광고가 없으며 웹 광고 노출을 위해 download 동선을 숨기지 않음

## 10. 완료 조건

- 공개 첫 주 방문 1K, 완료 작업 500 이상
- 8개 도구 페이지 색인 및 각 페이지에 실제 완료 작업 발생
- 8주 내 비런칭 유입 50% 이상
- 4주 재방문 20% 이상 또는 PWA/CLI/desktop이 명확한 대체 리텐션 경로를 증명
- OSS 엔진 공개 후 웹과 엔진의 detector 결과 동등성 CI 통과
