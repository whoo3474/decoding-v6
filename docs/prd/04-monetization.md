# PRD-04: 수익화 — 비추적 광고·스폰서 한 자리

> 상위 문서: [마스터 플랜](./README.md) · UI 배치: [PRD-05](./05-uiux.md) · 격리 계약: [PRD-09](./09-security-privacy.md)

## 1. 결정

decod.ing은 로그인·계정·구독·사용자 결제·유료 API를 만들지 않는다. 모든 디코딩 기능은 무료다.

수익화는 안정적인 유기적 트래픽이 생긴 뒤 다음 두 방식만 허용한다.

1. **자체 호스팅 정적 스폰서** — 우선
2. **비추적 문맥 광고 네트워크** — 보조

개인화 광고, 리타기팅, 광고 쿠키, 사용자 프로필, 데이터 판매는 영구 금지한다.

## 2. 왜 이 모델인가

- 제품의 핵심 신뢰는 “입력을 보내지 않는다”는 단순한 약속에서 나옴
- 계정·결제·환불·VAT·구독 상태가 제품과 코드베이스를 지배하지 않음
- 무료 도구의 검색·공유 유통을 훼손하지 않음
- 개발자 도구 광고는 포맷 페이지 문맥만으로도 관련성 확보 가능

수용하는 한계:

- 구독보다 매출 천장이 낮음
- 광고 차단 사용자에게는 수익 없음
- 초기 트래픽에서는 광고 수익이 거의 없을 수 있음
- 광고 플랫폼 정산금도 사업 소득 기록 대상이나, 사용자별 결제 운영은 없음

## 3. 광고 도입 게이트

다음을 모두 만족하기 전 광고 코드를 제품에 넣지 않는다.

- 최근 4주 평균 주간 페이지뷰 ≥10,000
- 비런칭 유입 ≥50%
- 방문 → 완료된 디코딩 ≥50%
- LCP p75 ≤1.8s, INP p75 ≤200ms, CLS p75 ≤0.05
- 공개 프라이버시 테스트와 CSP 테스트 통과
- 광고 없는 기준선 지표를 최소 4주 확보

게이트 미달 시 placeholder도 표시하지 않는다. 광고 없는 화면이 정상 제품이다.

## 4. 수익 방식

### A. 자체 호스팅 정적 스폰서 — 우선

- `sponsors.json`에 캠페인 기간, 문구, 이미지, URL, 허용 tool category 정의
- 이미지·텍스트는 빌드 시 검증 후 decod.ing 도메인에서 제공
- URL에 사용자·세션·payload 파라미터 없음
- 링크는 `rel="sponsored noopener noreferrer"`
- 노출 카운트는 coarse aggregate만, 사용자 단위 attribution 없음
- 캠페인당 고정 기간·고정 금액, 클릭 보장 판매 금지

이 방식은 외부 광고 JavaScript가 없어 성능과 데이터 경계가 가장 단순하다.

### B. 비추적 문맥 광고 네트워크 — 현재 승인 후보 없음

2026-07-15 공식 정책 기준 감사:

| 네트워크 | 장점 | 현재 충돌 | 판정 |
|---|---|---|---|
| [EthicalAds](https://www.ethicalads.io/publishers/) | 개발자 문맥 타게팅, behavioral tracking 없음, 한 페이지 한 광고 | 월 50K+ PV를 찾고 있으며 첫 방문 desktop/mobile above-the-fold 배치를 요구 | 보류 — 본 PRD의 첫 viewport 금지와 충돌 |
| [Carbon Ads](https://www.carbonads.net/join) | 기술 독자·수동 publisher 심사·비침투형 형식 | pixel-based tracking을 명시 | 보류 — 현행 no-tracking 계약과 충돌 |
| Google AdSense | 큰 수요·자동 fill | 지역별 CMP·ad-tech provider·세금 프로필 운영 표면 | 사용하지 않음 |

따라서 외부 네트워크 allowlist의 초기값은 빈 배열이다. 계약·정책이 바뀌거나 프라이버시와 배치 조건을 모두 지키는 서면 예외를 받았을 때만 PRD-09 심사와 ADR을 거쳐 추가한다. “privacy-friendly” 마케팅 문구만으로 승인하지 않는다.

## 5. 수익성 모델과 운영 현실

광고 총수익의 기본식은 다음과 같다.

```text
월 총수익 = 월 광고 가능 pageview ÷ 1,000 × 실제 page RPM
월 순수익 = 총수익 - hosting/domain/tooling - 환전·송금 수수료 - 세금·회계 비용
```

EthicalAds가 공개한 약 `$2.50 / 1,000 pageviews`는 EU·북미 트래픽 비중이 높을 때의 참고 CPM일 뿐 decod.ing의 보장값이 아니다. 이를 단순 benchmark로 적용하면:

| 평균 주간 pageview | 월 환산(×4.33) | $2.50 benchmark 월 총수익 |
|---:|---:|---:|
| 10K | 43K | 약 $108 |
| 50K | 217K | 약 $541 |
| 250K | 1.08M | 약 $2,706 |

결론적으로 10K weekly 진입 게이트는 “광고를 시험할 최소 표본”이지 사업 수익성 증명이 아니다. benchmark 기준 월 $500 총수익에는 약 200K monthly pageview가 필요하다. 실제 단가·fill·지역·광고 차단·desktop/PWA 사용 비중에 따라 더 낮아질 수 있다.

자체 호스팅 스폰서는 외부 script가 없지만 광고주 발굴·계약·청구 운영이 생긴다. 다음처럼 관리 부담을 제한한다.

- 한 시점 한 스폰서, 월 단위가 아니라 4~12주 고정 캠페인
- click 성과 보장·사용자별 attribution·환불형 성과계약 없음
- 운영자 payout 계정 하나와 월별 정산서/PDF·입금 기록만 보관
- 첫 수익 전 한국 사업·세무 전문가에게 신고 형태를 한 번 확인
- 최종 사용자 결제·영수증·환불·VAT 계산은 제품에 존재하지 않음

광고 수익도 사업 소득과 플랫폼 세금 정보 제출 가능성이 있으므로 회계·세무가 완전히 0이 되지는 않는다. 이 모델의 목적은 이를 **월 단위 광고 정산 한 줄**로 줄이는 것이지 법적 의무를 없애는 것이 아니다.

## 6. 배치 계약

허용:

- 도구 페이지 설명 콘텐츠 하단 1자리
- 넓은 화면에서 결과와 분리된 우측 rail의 below-the-fold 1자리
- changelog/docs footer 1자리

금지:

- 홈 첫 viewport
- PasteBox, 후보 목록, ChainTree, lint, copy 버튼 내부·사이
- 결과처럼 보이는 native placement
- 팝업, interstitial, sticky overlay, autoplay, countdown
- PWA standalone·workspace·CLI·desktop·브라우저 확장
- 한 페이지 동시 2개 이상

광고 슬롯은 고정 크기를 예약해 CLS를 만들지 않고, `Sponsored` 또는 `Ad` 라벨을 항상 표시한다.

## 7. 로딩·성능 계약

- 제품의 LCP와 decoder island hydration 후 `requestIdleCallback`에서 로드
- 광고 실패·차단·timeout이 제품 오류가 되지 않음
- 2.5초 timeout 후 빈 공간을 축소하되 CLS가 생기지 않는 CSS 처리
- 광고 요청에 tool category 이상의 문맥을 전달하지 않음
- Referrer-Policy는 최소 `strict-origin`
- 네트워크 광고는 sandboxed iframe 또는 격리 wrapper
- 광고 도입 후 추가 JS ≤30KB gzip, LCP 회귀 ≤200ms

## 8. 수익·품질 지표

### 수익

- 순광고수익
- page RPM
- fill rate
- 스폰서 슬롯 판매율
- 월별 플랫폼 정산서 합계

### 제품 가드레일

- 완료 전환 하락 ≤3 percentage points
- 4주 재방문 상대 하락 ≤5%
- LCP 증가 ≤200ms
- CLS p75 ≤0.05 유지
- 광고 관련 사용자 불만률 <0.5%
- CSP·payload egress 위반 0건

광고 클릭은 제품 event와 사용자 단위로 결합하지 않는다. 광고 네트워크가 제공하는 aggregate report만 사용한다.

## 9. 실험과 중단

1. 트래픽의 10%에 정적 house sponsor로 레이아웃 검증
2. 50%에서 2주 품질 가드레일 측정
3. 이상 없으면 전체 적용
4. 네트워크 광고는 allowlist 후보가 승인된 경우에만 정적 스폰서와 별도 실험

다음 중 하나면 광고를 즉시 끈다.

- 입력·결과 유출 가능성
- 개인화·추적 정책으로 변경
- Core Web Vitals 가드레일 2주 연속 위반
- 수익이 추가 운영비·검수비보다 낮음
- 광고가 제품 콘텐츠로 오인됨

## 10. 완료 조건

- 광고 도입 게이트의 4주 기준선 확보
- 자체 호스팅 sponsor adapter와 `none` fallback 구현
- 네트워크 비활성 상태에서 외부 광고 요청 0건
- 광고 활성 상태에서도 payload egress 0건
- 수익·성능·활성 가드레일 대시보드 또는 월간 리포트 가동
- 계정·구독·결제 코드와 데이터 테이블 0개
