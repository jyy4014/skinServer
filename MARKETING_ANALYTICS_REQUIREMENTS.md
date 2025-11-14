# 📊 마케팅 분석을 위한 추가 필드 요구사항

## 현재 계획된 필드

### 기본 통계
- ✅ `birth_date`, `gender` (이미 있음, 회원가입 시 수집 필요)
- ✅ `signup_source` (가입 경로)
- ✅ `marketing_consent` (마케팅 동의)

---

## 🎯 마케팅 분석에 추가로 필요한 필드

### 1. 유입 경로 분석 (Acquisition Analytics)

**목적**: 마케팅 채널별 효과 측정, ROI 계산

| 필드명 | 타입 | 설명 | 통계 활용 |
|--------|------|------|-----------|
| `utm_source` | TEXT | 유입 소스 (google, naver, facebook, direct 등) | 채널별 가입자 수 |
| `utm_medium` | TEXT | 유입 매체 (cpc, email, social, organic 등) | 매체별 전환율 |
| `utm_campaign` | TEXT | 캠페인명 | 캠페인별 효과 측정 |
| `utm_term` | TEXT | 키워드 (검색 광고용) | 키워드별 전환율 |
| `utm_content` | TEXT | 광고 콘텐츠 ID | A/B 테스트 결과 |
| `referrer_url` | TEXT | 리퍼러 URL | 외부 사이트 유입 분석 |
| `landing_page` | TEXT | 첫 방문 페이지 | 랜딩 페이지별 전환율 |

**통계 활용 예시**:
- 채널별 가입자 수 및 전환율
- 캠페인별 ROI
- 키워드별 전환율
- 랜딩 페이지별 전환율

---

### 2. 디바이스/기술 정보 (Device & Technology)

**목적**: 사용자 환경 분석, 모바일/데스크톱 최적화

| 필드명 | 타입 | 설명 | 통계 활용 |
|--------|------|------|-----------|
| `device_type` | TEXT | 기기 타입 (mobile, tablet, desktop) | 기기별 사용 패턴 |
| `device_brand` | TEXT | 기기 브랜드 (iPhone, Samsung 등) | 브랜드별 사용자 분포 |
| `os_name` | TEXT | OS 이름 (iOS, Android, Windows 등) | OS별 사용자 분포 |
| `os_version` | TEXT | OS 버전 | 버전별 호환성 분석 |
| `browser_name` | TEXT | 브라우저 이름 (Chrome, Safari 등) | 브라우저별 사용자 분포 |
| `browser_version` | TEXT | 브라우저 버전 | 버전별 호환성 분석 |
| `screen_resolution` | TEXT | 화면 해상도 (1920x1080 등) | 해상도별 최적화 |

**통계 활용 예시**:
- 모바일 vs 데스크톱 사용 비율
- 주요 브라우저/OS 분포
- 기기별 전환율 차이

---

### 3. 지역 정보 (Geographic - 선택사항)

**목적**: 지역별 마케팅 전략, 지역별 선호도 분석

| 필드명 | 타입 | 설명 | 통계 활용 |
|--------|------|------|-----------|
| `country` | TEXT | 국가 (KR, US 등) | 국가별 사용자 분포 |
| `region` | TEXT | 지역/도시 (서울, 부산 등) | 지역별 사용자 분포 |
| `timezone` | TEXT | 시간대 (Asia/Seoul 등) | 시간대별 활동 패턴 |
| `language` | TEXT | 언어 설정 (ko, en 등) | 다국어 사용자 통계 |

**주의**: 개인정보 보호를 위해 선택적 수집 권장

**통계 활용 예시**:
- 지역별 사용자 분포
- 지역별 인기 시술
- 시간대별 활성 사용자 패턴

---

### 4. 사용자 행동 추적 (User Behavior Tracking)

**목적**: 사용자 여정 분석, 전환율 최적화

| 필드명 | 타입 | 설명 | 통계 활용 |
|--------|------|------|-----------|
| `first_visit_at` | TIMESTAMP | 첫 방문 날짜 | 신규 방문자 분석 |
| `last_visit_at` | TIMESTAMP | 마지막 방문 날짜 | 재방문율 분석 |
| `session_count` | INTEGER | 총 세션 수 | 사용자 참여도 |
| `page_view_count` | INTEGER | 총 페이지뷰 수 | 사용자 참여도 |
| `total_time_spent` | INTEGER | 총 체류 시간 (초) | 사용자 참여도 |
| `conversion_events` | JSONB | 전환 이벤트 기록 | 전환율 분석 |

**전환 이벤트 예시**:
```json
{
  "first_analysis": "2025-01-15T10:30:00Z",
  "first_treatment_view": "2025-01-15T10:35:00Z",
  "first_treatment_click": "2025-01-15T10:40:00Z",
  "profile_completed": "2025-01-15T10:20:00Z"
}
```

**통계 활용 예시**:
- 가입 → 첫 분석 전환율
- 첫 분석 → 시술 조회 전환율
- 평균 세션 수
- 평균 체류 시간

---

### 5. A/B 테스트 및 실험 (A/B Testing)

**목적**: 마케팅 실험, 최적화

| 필드명 | 타입 | 설명 | 통계 활용 |
|--------|------|------|-----------|
| `ab_test_group` | TEXT | A/B 테스트 그룹 (A, B, control 등) | 실험 그룹별 전환율 |
| `ab_test_variant` | JSONB | 실험 변형 정보 | 변형별 효과 측정 |
| `experiment_ids` | JSONB | 참여한 실험 ID 배열 | 실험별 효과 측정 |

**통계 활용 예시**:
- A/B 테스트 그룹별 전환율 비교
- 실험 변형별 효과 측정

---

### 6. 구독/프리미엄 정보 (Subscription - 향후)

**목적**: 수익화 분석, 구독 전환율

| 필드명 | 타입 | 설명 | 통계 활용 |
|--------|------|------|-----------|
| `subscription_status` | TEXT | 구독 상태 (free, premium, trial 등) | 구독자 비율 |
| `subscription_started_at` | TIMESTAMP | 구독 시작일 | 구독 전환율 |
| `subscription_ended_at` | TIMESTAMP | 구독 종료일 | 이탈율 분석 |
| `lifetime_value` | NUMERIC | 고객 생애 가치 (LTV) | LTV 분석 |

**통계 활용 예시**:
- 무료 → 유료 전환율
- 구독 이탈율
- 평균 LTV

---

### 7. 소셜/커뮤니티 정보 (Social - 향후)

**목적**: 소셜 공유 분석, 바이럴 효과 측정

| 필드명 | 타입 | 설명 | 통계 활용 |
|--------|------|------|-----------|
| `invited_by` | UUID | 초대한 사용자 ID | 추천 프로그램 효과 |
| `invite_count` | INTEGER | 초대한 사용자 수 | 바이럴 계수 |
| `social_shares` | JSONB | 소셜 공유 기록 | 공유 채널별 효과 |

**통계 활용 예시**:
- 추천 프로그램 효과
- 소셜 공유율
- 바이럴 계수

---

## 🎯 우선순위별 필드 분류

### 🔴 필수 (High Priority) - 마케팅 핵심
1. `utm_source`, `utm_medium`, `utm_campaign` - 채널별 효과 측정 필수
2. `device_type` - 모바일/데스크톱 분석 필수
3. `first_visit_at`, `last_visit_at` - 사용자 여정 분석 필수
4. `referrer_url` - 유입 경로 분석 필수
5. `landing_page` - 랜딩 페이지 최적화 필수

### 🟡 권장 (Medium Priority) - 상세 분석
1. `utm_term`, `utm_content` - 키워드/콘텐츠 분석
2. `device_brand`, `os_name`, `browser_name` - 기술 스택 분석
3. `session_count`, `page_view_count` - 참여도 분석
4. `conversion_events` - 전환율 분석
5. `country`, `timezone` - 지역 분석 (개인정보 고려)

### 🟢 선택 (Low Priority) - 고급 분석
1. `ab_test_group` - A/B 테스트 (실험 시 필요)
2. `subscription_status` - 구독 분석 (수익화 시 필요)
3. `invited_by` - 추천 프로그램 (바이럴 마케팅 시 필요)

---

## 📋 구현 계획

### Phase 1: 필수 마케팅 필드 (즉시 구현)
- UTM 파라미터 (source, medium, campaign)
- 디바이스 정보 (device_type)
- 방문 정보 (first_visit_at, last_visit_at)
- 리퍼러 정보 (referrer_url, landing_page)

### Phase 2: 권장 필드 (빠르게 추가)
- 상세 UTM 파라미터 (term, content)
- 상세 디바이스 정보 (os, browser)
- 사용자 행동 추적 (session_count, page_view_count)
- 지역 정보 (country, timezone)

### Phase 3: 선택 필드 (필요시 추가)
- A/B 테스트
- 구독 정보
- 소셜/추천 정보

---

## 🔄 자동 수집 방법

### 클라이언트 사이드 (프론트엔드)
1. **UTM 파라미터**: URL 쿼리에서 자동 추출
2. **디바이스 정보**: `navigator.userAgent` 파싱 또는 라이브러리 사용
3. **리퍼러**: `document.referrer` 사용
4. **랜딩 페이지**: `window.location.pathname` 사용

### 서버 사이드 (Edge Function)
1. **User-Agent 파싱**: 디바이스/브라우저 정보 추출
2. **IP 기반 지역 정보**: (개인정보 보호 고려)

---

## 📊 마케팅 대시보드 예시

### 채널별 통계
- Google: 가입자 100명, 전환율 5%
- Naver: 가입자 80명, 전환율 4%
- Direct: 가입자 50명, 전환율 3%

### 캠페인별 통계
- "봄맞이 프로모션": 가입자 200명, ROI 150%
- "신규 가입 이벤트": 가입자 150명, ROI 120%

### 디바이스별 통계
- 모바일: 가입자 70%, 전환율 4.5%
- 데스크톱: 가입자 30%, 전환율 3.5%

### 지역별 통계
- 서울: 가입자 40%
- 부산: 가입자 15%
- 기타: 가입자 45%

---

## ⚠️ 개인정보 보호 고려사항

1. **익명화**: IP 주소는 해시 처리 또는 마지막 옥텟 제거
2. **선택적 수집**: 지역 정보는 선택적으로 수집
3. **동의**: 마케팅 분석 목적 명시 및 동의
4. **보관 기간**: 통계 목적에 필요한 최소 기간만 보관
5. **GDPR 준수**: EU 사용자에 대한 추가 고려사항

---

## 🛠 구현 예시

### 회원가입 시 UTM 파라미터 수집
```typescript
// URL에서 UTM 파라미터 추출
const urlParams = new URLSearchParams(window.location.search)
const utmParams = {
  source: urlParams.get('utm_source') || 'direct',
  medium: urlParams.get('utm_medium') || 'none',
  campaign: urlParams.get('utm_campaign') || null,
  term: urlParams.get('utm_term') || null,
  content: urlParams.get('utm_content') || null,
}

// 회원가입 시 저장
await supabase.from('users').insert({
  ...userData,
  signup_source: 'web',
  utm_source: utmParams.source,
  utm_medium: utmParams.medium,
  utm_campaign: utmParams.campaign,
  referrer_url: document.referrer || null,
  landing_page: window.location.pathname,
})
```

### 디바이스 정보 수집
```typescript
// User-Agent 파싱 또는 라이브러리 사용
import { UAParser } from 'ua-parser-js'

const parser = new UAParser()
const device = parser.getDevice()
const os = parser.getOS()
const browser = parser.getBrowser()

const deviceInfo = {
  device_type: device.type || 'desktop',
  device_brand: device.vendor || null,
  os_name: os.name || null,
  os_version: os.version || null,
  browser_name: browser.name || null,
  browser_version: browser.version || null,
  screen_resolution: `${window.screen.width}x${window.screen.height}`,
}
```

