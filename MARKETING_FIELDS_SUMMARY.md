# 📊 마케팅 분석 필드 요약

## ✅ 추가된 마케팅 필드

### 1. UTM 파라미터 (채널별 효과 측정)
- `utm_source` - 유입 소스 (google, naver, facebook, direct)
- `utm_medium` - 유입 매체 (cpc, email, social, organic)
- `utm_campaign` - 캠페인명
- `utm_term` - 키워드 (검색 광고용)
- `utm_content` - 광고 콘텐츠 ID (A/B 테스트용)

### 2. 유입 경로
- `referrer_url` - 리퍼러 URL
- `landing_page` - 첫 방문 페이지

### 3. 디바이스 정보
- `device_type` - 기기 타입 (mobile, tablet, desktop)
- `device_brand` - 기기 브랜드 (iPhone, Samsung 등)
- `os_name` - OS 이름 (iOS, Android, Windows 등)
- `os_version` - OS 버전
- `browser_name` - 브라우저 이름 (Chrome, Safari 등)
- `browser_version` - 브라우저 버전
- `screen_resolution` - 화면 해상도

### 4. 지역 정보 (선택사항)
- `country` - 국가 코드 (KR, US 등)
- `region` - 지역/도시 (서울, 부산 등)
- `timezone` - 시간대 (Asia/Seoul 등)
- `language` - 언어 설정 (ko, en 등)

### 5. 사용자 행동 추적
- `first_visit_at` - 첫 방문 날짜
- `last_visit_at` - 마지막 방문 날짜
- `session_count` - 총 세션 수
- `page_view_count` - 총 페이지뷰 수
- `total_time_spent` - 총 체류 시간 (초)
- `conversion_events` - 전환 이벤트 기록 (JSONB)

---

## 📈 마케팅 통계 활용 예시

### 채널별 가입자 수
```sql
SELECT 
  utm_source,
  COUNT(*) as signups,
  COUNT(CASE WHEN analysis_count > 0 THEN 1 END) as converted_users,
  ROUND(COUNT(CASE WHEN analysis_count > 0 THEN 1 END)::numeric / COUNT(*) * 100, 2) as conversion_rate
FROM public.users
WHERE utm_source IS NOT NULL
GROUP BY utm_source
ORDER BY signups DESC;
```

### 캠페인별 ROI
```sql
SELECT 
  utm_campaign,
  COUNT(*) as signups,
  COUNT(CASE WHEN first_analysis_at IS NOT NULL THEN 1 END) as first_analysis_count,
  ROUND(AVG(analysis_count), 2) as avg_analyses_per_user
FROM public.users
WHERE utm_campaign IS NOT NULL
GROUP BY utm_campaign
ORDER BY signups DESC;
```

### 디바이스별 전환율
```sql
SELECT 
  device_type,
  COUNT(*) as signups,
  COUNT(CASE WHEN analysis_count > 0 THEN 1 END) as converted,
  ROUND(COUNT(CASE WHEN analysis_count > 0 THEN 1 END)::numeric / COUNT(*) * 100, 2) as conversion_rate
FROM public.users
WHERE device_type IS NOT NULL
GROUP BY device_type;
```

### 지역별 사용자 분포
```sql
SELECT 
  country,
  region,
  COUNT(*) as user_count
FROM public.users
WHERE country IS NOT NULL
GROUP BY country, region
ORDER BY user_count DESC;
```

---

## 🎯 다음 단계

1. ✅ 데이터베이스 마이그레이션 완료
2. ⏳ 회원가입 폼에 생년월일, 성별 필드 추가
3. ⏳ 회원가입 시 UTM 파라미터 수집 로직 추가
4. ⏳ 디바이스 정보 자동 수집 로직 추가
5. ⏳ 로그인 시 last_login_at, login_count 업데이트
6. ⏳ 분석 완료 시 analysis_count 업데이트

