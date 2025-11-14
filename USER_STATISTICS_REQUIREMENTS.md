# 📊 회원가입 통계 필드 요구사항

## 현재 users 테이블 구조

```sql
- id (UUID)
- email (TEXT)
- name (TEXT)
- birth_date (DATE)
- gender (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

---

## 📈 통계에 필요한 필드 분석

### 1. 사용자 활동 통계 (Activity Statistics)

**목적**: 사용자 활성도, 참여도 측정

| 필드명 | 타입 | 설명 | 통계 활용 |
|--------|------|------|-----------|
| `last_login_at` | TIMESTAMP | 마지막 로그인 시간 | DAU/MAU 계산, 이탈 사용자 분석 |
| `login_count` | INTEGER | 총 로그인 횟수 | 사용자 참여도 측정 |
| `analysis_count` | INTEGER | 총 분석 횟수 | 사용자 활성도 측정 (캐시용) |
| `is_active` | BOOLEAN | 활성 사용자 여부 | 활성 사용자 비율 계산 |
| `first_analysis_at` | TIMESTAMP | 첫 분석 날짜 | 신규 사용자 전환율 |
| `last_analysis_at` | TIMESTAMP | 마지막 분석 날짜 | 사용자 재방문율 |

**통계 활용 예시**:
- 일일 활성 사용자 (DAU)
- 월간 활성 사용자 (MAU)
- 사용자 유지율 (Retention Rate)
- 평균 분석 횟수

---

### 2. 사용자 특성 통계 (User Characteristics)

**목적**: 사용자 세그먼트 분석, 맞춤형 추천

| 필드명 | 타입 | 설명 | 통계 활용 |
|--------|------|------|-----------|
| `skin_type` | TEXT | 피부 타입 (건성, 지성, 복합성, 민감성) | 피부 타입별 통계 |
| `skin_tone` | TEXT | 피부톤 (Fitzpatrick I-VI) | 피부톤별 분석 통계 |
| `main_concerns` | JSONB | 주요 피부 고민 배열 | 고민별 시술 추천 통계 |
| `preferred_treatments` | JSONB | 선호하는 시술 배열 | 인기 시술 통계 |

**통계 활용 예시**:
- 피부 타입별 분포
- 주요 피부 고민 순위
- 인기 시술 순위
- 피부 타입별 추천 시술 매칭률

---

### 3. 마케팅/분석 통계 (Marketing & Analytics)

**목적**: 마케팅 효과 측정, 사용자 행동 분석

| 필드명 | 타입 | 설명 | 통계 활용 |
|--------|------|------|-----------|
| `signup_source` | TEXT | 가입 경로 (web, mobile, google, email) | 가입 경로별 전환율 |
| `marketing_consent` | BOOLEAN | 마케팅 동의 여부 | 마케팅 수신 동의율 |
| `notification_enabled` | BOOLEAN | 알림 설정 여부 | 푸시 알림 활성화율 |
| `language` | TEXT | 언어 설정 (ko, en 등) | 다국어 사용자 통계 |
| `timezone` | TEXT | 시간대 | 지역별 사용자 분포 |

**통계 활용 예시**:
- 가입 경로별 전환율
- 마케팅 수신 동의율
- 알림 활성화율
- 지역별 사용자 분포

---

### 4. 사용자 행동 통계 (User Behavior)

**목적**: 사용자 행동 패턴 분석

| 필드명 | 타입 | 설명 | 통계 활용 |
|--------|------|------|-----------|
| `total_treatments_viewed` | INTEGER | 조회한 시술 수 | 시술 조회 통계 |
| `total_treatments_clicked` | INTEGER | 클릭한 시술 수 | 시술 클릭 통계 |
| `favorite_treatments` | JSONB | 관심 시술 배열 | 관심 시술 통계 |
| `device_type` | TEXT | 주 사용 기기 (mobile, desktop) | 기기별 사용 패턴 |

**통계 활용 예시**:
- 시술별 조회수/클릭수
- 사용자별 관심 시술 분포
- 기기별 사용 패턴

---

### 5. 지역/인구통계 (Demographics) - 선택사항

**목적**: 지역별 통계 (개인정보 보호 고려)

| 필드명 | 타입 | 설명 | 통계 활용 |
|--------|------|------|-----------|
| `country` | TEXT | 국가 (선택사항) | 국가별 사용자 분포 |
| `region` | TEXT | 지역 (선택사항) | 지역별 사용자 분포 |

**주의**: 개인정보 보호를 위해 선택적 수집 권장

---

## 🎯 우선순위별 필드 분류

### 🔴 필수 (High Priority)
1. `last_login_at` - 활성 사용자 분석 필수
2. `analysis_count` - 사용자 활성도 측정 필수
3. `signup_source` - 마케팅 효과 측정 필수
4. `skin_type` - 맞춤형 추천 필수
5. `main_concerns` - 시술 추천 통계 필수

### 🟡 권장 (Medium Priority)
1. `login_count` - 참여도 측정
2. `first_analysis_at` / `last_analysis_at` - 전환율 분석
3. `preferred_treatments` - 인기 시술 통계
4. `marketing_consent` - 마케팅 동의율
5. `notification_enabled` - 알림 활성화율

### 🟢 선택 (Low Priority)
1. `skin_tone` - 피부톤별 통계
2. `total_treatments_viewed` / `total_treatments_clicked` - 행동 분석
3. `language` / `timezone` - 다국어/지역 통계
4. `country` / `region` - 지역 통계 (개인정보 고려)

---

## 📋 구현 계획

### Phase 1: 필수 필드 추가
- `last_login_at`
- `analysis_count`
- `signup_source`
- `skin_type`
- `main_concerns`

### Phase 2: 권장 필드 추가
- `login_count`
- `first_analysis_at` / `last_analysis_at`
- `preferred_treatments`
- `marketing_consent`
- `notification_enabled`

### Phase 3: 선택 필드 추가 (필요시)
- 나머지 필드들

---

## 🔄 자동 업데이트 로직

### 트리거/함수로 자동 관리
1. **로그인 시**: `last_login_at`, `login_count` 업데이트
2. **분석 완료 시**: `analysis_count`, `last_analysis_at` 업데이트
3. **시술 조회 시**: `total_treatments_viewed` 업데이트
4. **시술 클릭 시**: `total_treatments_clicked` 업데이트

---

## 📊 통계 대시보드 예시

### 사용자 통계
- 총 가입자 수
- 활성 사용자 수 (DAU/MAU)
- 신규 가입자 수 (일/주/월)
- 사용자 유지율

### 사용자 특성 통계
- 피부 타입별 분포
- 주요 피부 고민 순위
- 인기 시술 순위
- 가입 경로별 분포

### 사용자 행동 통계
- 평균 분석 횟수
- 평균 시술 조회수
- 전환율 (가입 → 첫 분석)
- 재방문율

---

## ⚠️ 개인정보 보호 고려사항

1. **선택적 수집**: 민감한 정보는 선택적으로 수집
2. **익명화**: 통계 목적으로는 개인 식별 정보 제거
3. **동의**: 마케팅/통계 목적 명시 및 동의
4. **보관 기간**: 통계 목적에 필요한 최소 기간만 보관

