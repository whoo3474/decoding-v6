# PRD-08: 플랫폼·국제화 — 최소 Cloudflare, 데이터 기반 로케일

> 상위 문서: [마스터 플랜](./README.md) · 아키텍처: [PRD-06](./06-architecture.md)

## 1. 목표

정적 글로벌 도구에 필요한 Cloudflare 기능만 사용하고, 국제화는 영어 출시를 늦추지 않으면서 하드코딩 부채 없이 준비한다.

## 2. Cloudflare 활용 맵

### 사용

| 기능 | 용도 | 단계 |
|---|---|---|
| Workers Static Assets | Astro 정적 HTML/CSS/JS·전 세계 캐시 | Phase 0 |
| Workers Builds/preview | PR별 preview·main 배포 | Phase 0 |
| Web Analytics 또는 동등한 coarse pageview | 입력 없는 페이지·referrer 지표 | Phase 1, privacy 검증 후 |
| Analytics Engine | 허용된 aggregate product event | Phase 2, 필요성 승인 후 |
| Cache headers | fingerprinted asset 장기 캐시, HTML 짧은 캐시 | Phase 0 |
| WAF 기본 관리 규칙 | 정적 사이트·event endpoint 보호 | endpoint가 생길 때 |

### 사용하지 않음

| 기능 | 이유 |
|---|---|
| D1 | 계정·결제·서버 저장 데이터 없음 |
| KV | session·feature flag·사용자 설정 없음 |
| R2 | 사용자 파일 업로드 없음 |
| Durable Objects | 실시간·공유 상태 없음 |
| Workers AI / AI Gateway | 생성형 AI 기능 없음 |
| Vectorize / AI Search | RAG 없음 |
| Turnstile | 공개 폼·로그인·AI endpoint 없음 |
| Queues / Workflows / Cron | runtime background work 없음; sitemap은 build-time |
| Pages | Workers Static Assets로 배포 표면 통일 |

새 binding은 이 표와 ADR을 먼저 갱신한 뒤에만 추가한다.

## 3. 캐시·헤더

- fingerprinted JS/CSS/WASM: `public, max-age=31536000, immutable`
- HTML: `public, max-age=0, must-revalidate` 또는 짧은 edge cache
- `Service-Worker-Allowed`, CSP, Permissions-Policy를 명시
- 외부 font·image CDN 없음
- sponsor asset은 같은 도메인, 캠페인 종료 시 새 fingerprint
- HTML과 detector/spec version mismatch를 release test로 차단

## 4. 국제화 원칙

1. 영어 루트 URL로 출시
2. 모든 UI 문구는 Day-1부터 message catalog
3. detector output은 locale-independent structured data
4. 날짜·숫자·byte는 `Intl` adapter에서만 포맷
5. 로케일은 국가 추측이 아니라 실제 검색·완료 작업 근거로 추가
6. 자동 redirect 금지; 브라우저 언어에 따른 로컬 제안만
7. 한 로케일은 도구·privacy·오류·접근성 문구가 모두 준비될 때 출시

## 5. URL·콘텐츠 구조

- 영어: `/jwt`
- 추가 로케일: `/ja/jwt`, `/ko/jwt`
- 각 페이지 canonical은 자기 언어 URL
- `hreflang`은 실제 완성된 페이지만 생성
- `x-default`는 영어 루트
- tool slug는 언어 간 고정해 문서·공유 경로 단순화
- locale selector는 현재 페이지의 번역이 없으면 비활성 이유 표시

## 6. 로케일 승격 게이트

### 6.1 2026-07-15 사용자 지시에 따른 기술 베타 선행

사용자가 일본어를 포함해 가능한 범위의 국제화를 선행하도록 명시했다. 따라서 수요 데이터를 기다리지 않고 다음 8개 로케일의 정적 라우트·도구 UI·오류·privacy·methodology 초안을 구현한다.

| 상태 | 로케일 | 운영 경계 |
|---|---|---|
| 기본 | `en` | 색인·`hreflang`·sitemap 포함 |
| 핵심 기술 베타 | `ko`, `ja` | 전체 공통 UI와 핵심 문서 초안, native review 전 `noindex` |
| 확장 기술 베타 | `zh-cn`, `es`, `pt-br`, `de`, `fr` | 전체 공통 UI·도구 라우트와 핵심 안전 문서 초안, native review 전 `noindex` |
| 후보 | `hi`, `id`, `ru`, `ar` | 현재 8개 로케일의 용어 검수·실사용 결과 후 순차 확장 |

기술 베타는 사용자가 직접 열고 실행할 수 있지만 `Translation beta`를 명시하고 자동 redirect하지 않는다. Native reviewer가 용어·예시·privacy 정확성을 승인하기 전에는 검색 색인·sitemap·`hreflang` 집합에 승격하지 않는다.

첫 로케일은 다음 점수로 선택한다.

- 최근 8주 국가/브라우저 언어 aggregate 유입
- 해당 언어 tool query의 Search Console 노출
- 해당 언어 GitHub issue·커뮤니티 요청
- 검수 가능한 native reviewer 확보

출시 조건:

- 상위 8개 tool page 100% 번역
- 공통 UI·오류·privacy·methodology 100% 번역
- 공식 스펙 링크와 locale-specific 예시 검수
- snapshot·keyboard·screen-reader smoke 통과
- 부분 번역 fallback이 사용자를 속이지 않음

## 7. 번역 파이프라인

```text
en message/content 변경
→ key/schema validation
→ 번역 초안
→ 기술 용어 glossary 검사
→ native review
→ screenshot/content test
→ hreflang/sitemap 생성
```

- message key는 의미 기반, 영어 문장 자체를 key로 쓰지 않음
- UI와 긴 tool content catalog를 분리
- detector/spec registry의 기술 값은 번역하지 않음
- machine/AI-assisted translation만으로 검색 색인 로케일에 승격 금지; 미검수 기술 베타는 명시적 라벨·`noindex`를 유지

## 8. 광고 국제화

- 광고·스폰서 문구는 UI locale과 일치하거나 영어 공통임을 표시
- 광고 네트워크에 브라우저 언어·국가를 직접 전달하지 않음
- tool category와 페이지 URL 이상의 targeting 금지
- 지역별 광고 규제를 위해 제품에 consent SDK를 넣어야 한다면 해당 네트워크를 사용하지 않음
- PWA offline·standalone·desktop·CLI·extension에는 광고 없음

## 9. 완료 조건

- 정적 배포에 불필요한 binding 0개
- 영어 UI literal lint 0건(예외 allowlist 문서화)
- `Intl` 외 날짜·숫자 직접 포맷 0건
- 첫 로케일이 승격 게이트와 전체 번역 검증을 통과
- locale 추가가 초기 JS·LCP 예산을 변화시키지 않음
- 광고 locale이 제품 privacy 경계를 넓히지 않음
