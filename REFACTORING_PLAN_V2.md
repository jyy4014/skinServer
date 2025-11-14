# 🔧 앱 리팩토링 계획 v2 (사진 업로드 모듈 제외)

## 📋 개요

사진 업로드 모듈(`features/upload/`, `lib/forms/components/FileUpload.tsx`, `lib/forms/hooks/useFileUpload.ts`)을 제외한 앱 전체 리팩토링 계획입니다.

---

## 📊 현재 상태 분석

### ✅ 완료된 모듈
- ✅ API 클라이언트 통합 (`lib/api/`)
- ✅ 인증 모듈 통합 (`lib/auth/`)
- ✅ 에러 처리 통합 (`lib/error/`)
- ✅ 이미지 처리 통합 (`lib/image/`) - 업로드 제외
- ✅ 분석 플로우 모듈화 (`features/analysis/`)
- ✅ 데이터 페칭 통합 (`lib/data/`)
- ✅ UI 상태 통합 (`lib/ui/`)
- ✅ 폼 검증 모듈 (`lib/forms/validators.ts`, `lib/forms/hooks/useFormValidation.ts`)

### 🔍 개선이 필요한 영역

1. **페이지 컴포넌트 구조**
   - 페이지 컴포넌트가 비즈니스 로직을 직접 포함
   - 컴포넌트 재사용성 낮음
   - 테스트 어려움

2. **상수 및 설정 관리**
   - 하드코딩된 값들이 여러 곳에 분산
   - 환경 변수 접근이 일관되지 않음
   - API 엔드포인트가 하드코딩

3. **타입 정의**
   - 타입이 여러 파일에 분산
   - 중복된 타입 정의
   - API 응답 타입이 불완전

4. **공통 컴포넌트**
   - `components/common/` 구조 개선 필요
   - 컴포넌트 재사용성 향상 필요

5. **성능 최적화**
   - 코드 스플리팅 미적용
   - React 최적화 부족

---

## 🎯 리팩토링 우선순위

### 🔴 **우선순위 1: 설정 및 타입 통합** (2-3일)

#### 1-1. 상수 및 설정 통합 (`lib/config/`)

**목표**: 환경 변수 및 상수 중앙 관리

**현재 문제점**:
- 하드코딩된 값들이 여러 곳에 분산
  - 이미지 설정: `maxWidth: 1024`, `quality: 0.85`
  - 분석 설정: `MIN_CONFIDENCE: 0.3`, `HIGH_UNCERTAINTY_THRESHOLD: 0.5`
  - API 엔드포인트가 하드코딩
- 환경 변수 접근이 일관되지 않음

**모듈화 계획**:
```
lib/config/
├── env.ts                     # 환경 변수 타입 안전 접근
├── constants.ts               # 앱 전역 상수
├── api.ts                     # API 엔드포인트 상수
└── validation.ts              # 검증 규칙 상수
```

**작업 내용**:
- [ ] `lib/config/env.ts` 생성
  - 환경 변수 타입 안전 접근 함수
  - 필수 환경 변수 검증
- [ ] `lib/config/constants.ts` 생성
  - 이미지 처리 상수 (`IMAGE_CONFIG`)
  - 분석 설정 상수 (`ANALYSIS_CONFIG`)
  - UI 상수 (`UI_CONFIG`)
- [ ] `lib/config/api.ts` 생성
  - Edge Function 엔드포인트 상수
  - API 버전 관리
- [ ] `lib/config/validation.ts` 생성
  - 파일 크기 제한
  - 파일 타입 제한
  - 폼 검증 규칙
- [ ] 하드코딩된 값들을 상수로 교체
- [ ] 테스트 작성

**예상 시간**: 2-3시간

---

#### 1-2. 타입 정의 통합 (`types/`)

**목표**: 타입 중복 제거 및 완전성 향상

**현재 문제점**:
- 타입이 여러 파일에 분산 (`types/index.ts`, 각 모듈 내부)
- 중복된 타입 정의
- API 응답 타입이 불완전

**모듈화 계획**:
```
types/
├── index.ts                   # 공통 타입 (기존)
├── api.ts                     # API 응답 타입
├── analysis.ts                # 분석 관련 타입
├── user.ts                    # 사용자 관련 타입
├── treatment.ts               # 시술 관련 타입
└── storage.ts                 # Storage 관련 타입
```

**작업 내용**:
- [ ] `types/api.ts` 생성
  - Edge Function 응답 타입
  - API 에러 타입
  - 공통 API 타입
- [ ] `types/analysis.ts` 생성
  - 분석 결과 타입
  - 분석 히스토리 타입
  - 분석 상태 타입
- [ ] `types/user.ts` 생성
  - 사용자 프로필 타입
  - 인증 관련 타입
- [ ] `types/treatment.ts` 생성
  - 시술 정보 타입
  - 시술 추천 타입
- [ ] `types/storage.ts` 생성
  - Storage 파일 타입
  - 업로드 메타데이터 타입
- [ ] 중복 타입 제거 및 통합
- [ ] 타입 문서화 (JSDoc)

**예상 시간**: 2-3시간

---

### 🟡 **우선순위 2: 페이지 컴포넌트 리팩토링** (3-4일)

#### 2-1. 페이지 컴포넌트 구조 개선

**목표**: 페이지 컴포넌트에서 비즈니스 로직 분리

**현재 문제점**:
- 페이지 컴포넌트가 너무 많은 책임을 가짐
- 비즈니스 로직이 컴포넌트에 직접 포함
- 재사용 어려움

**개선 계획**:
```
app/
├── analyze/
│   ├── page.tsx              # 페이지 컴포넌트 (최소화)
│   └── components/           # 페이지 전용 컴포넌트
│       ├── AnalyzeView.tsx
│       └── AnalyzeHeader.tsx
├── home/
│   ├── page.tsx
│   └── components/
│       ├── HomeView.tsx
│       ├── DailySummary.tsx
│       └── RecentAnalysis.tsx
├── profile/
│   ├── page.tsx
│   └── components/
│       ├── ProfileView.tsx
│       └── ProfileSettings.tsx
└── treatments/
    ├── [id]/
    │   ├── page.tsx
    │   └── components/
    │       └── TreatmentDetailView.tsx
```

**작업 내용**:
- [ ] `app/analyze/` 리팩토링
  - 비즈니스 로직을 커스텀 훅으로 분리
  - UI 컴포넌트 분리
  - 페이지 컴포넌트는 오케스트레이션만 담당
- [ ] `app/home/` 리팩토링
  - 데이터 페칭 로직을 `lib/data/queries/`로 이동
  - 컴포넌트 분리
- [ ] `app/profile/` 리팩토링
  - 프로필 관리 로직 분리
  - 설정 컴포넌트 분리
- [ ] `app/treatments/[id]/` 리팩토링
  - 시술 상세 로직 분리
  - 컴포넌트 분리
- [ ] 테스트 작성

**예상 시간**: 4-5시간

---

#### 2-2. 공통 컴포넌트 개선 (`components/common/`)

**목표**: 공통 컴포넌트 재사용성 향상

**현재 구조**:
```
components/common/
├── BottomNav.tsx
├── Header.tsx
└── ToastProvider.tsx
```

**개선 계획**:
```
components/common/
├── navigation/
│   ├── BottomNav.tsx
│   └── Header.tsx
├── feedback/
│   └── ToastProvider.tsx
└── layout/
    └── PageLayout.tsx        # 페이지 레이아웃 래퍼
```

**작업 내용**:
- [ ] `PageLayout` 컴포넌트 생성
  - Header, BottomNav를 포함한 레이아웃
  - 페이지별 커스터마이징 가능
- [ ] 네비게이션 컴포넌트 개선
  - 활성 상태 관리 개선
  - 접근성 향상
- [ ] 컴포넌트 문서화
- [ ] 테스트 작성

**예상 시간**: 2-3시간

---

### 🟢 **우선순위 3: 성능 최적화** (2-3일)

#### 3-1. 코드 스플리팅

**목표**: 초기 로딩 시간 단축

**작업 내용**:
- [ ] 라우트별 코드 스플리팅
  - `app/analyze/page.tsx` → 동적 import
  - `app/home/page.tsx` → 동적 import
  - `app/profile/page.tsx` → 동적 import
- [ ] 큰 컴포넌트 분리
  - `ResultView.tsx` → 동적 import
  - `RecommendedTreatments.tsx` → 동적 import
- [ ] 이미지 처리 라이브러리 지연 로딩
  - `lib/image/` → 필요 시 로드
- [ ] 번들 크기 분석
  - `@next/bundle-analyzer` 설정
  - 최적화 포인트 식별

**예상 시간**: 3-4시간

---

#### 3-2. React 최적화

**목표**: 불필요한 리렌더링 방지

**작업 내용**:
- [ ] `React.memo` 적용
  - 공통 컴포넌트에 적용
  - 리스트 아이템 컴포넌트에 적용
- [ ] `useMemo`, `useCallback` 최적화
  - 비용이 큰 계산 메모이제이션
  - 이벤트 핸들러 최적화
- [ ] 컴포넌트 분리
  - 큰 컴포넌트를 작은 단위로 분리
  - 상태 관리 최적화
- [ ] React DevTools Profiler로 성능 측정
  - 리렌더링 원인 분석
  - 최적화 효과 확인

**예상 시간**: 2-3시간

---

### 🔵 **우선순위 4: 테스트 및 문서화** (1-2일)

#### 4-1. 테스트 커버리지 향상

**목표**: 테스트 커버리지 80% 이상 달성

**작업 내용**:
- [ ] 페이지 컴포넌트 테스트 추가
  - `app/analyze/page.tsx` 테스트
  - `app/home/page.tsx` 테스트
  - `app/profile/page.tsx` 테스트
- [ ] 통합 테스트 추가
  - 분석 플로우 통합 테스트
  - 인증 플로우 통합 테스트
- [ ] E2E 테스트 추가 (Playwright)
  - 주요 사용자 플로우 테스트
  - 크로스 브라우저 테스트
- [ ] 테스트 커버리지 리포트 생성

**예상 시간**: 4-5시간

---

#### 4-2. 문서화

**목표**: 코드 문서화 및 사용 가이드 작성

**작업 내용**:
- [ ] JSDoc 주석 추가
  - 모든 공개 함수/컴포넌트에 문서화
  - 타입 정의 문서화
- [ ] README 업데이트
  - 프로젝트 구조 설명
  - 개발 가이드
  - 배포 가이드
- [ ] 컴포넌트 사용 예시 작성
  - Storybook 또는 예시 코드
- [ ] API 문서 작성
  - Edge Function API 문서
  - 타입 정의 문서

**예상 시간**: 2-3시간

---

## 📅 리팩토링 일정

### Week 1: 설정 및 타입 통합
- **Day 1**: 상수 및 설정 통합 (`lib/config/`)
- **Day 2**: 타입 정의 통합 (`types/`)

### Week 2: 페이지 컴포넌트 리팩토링
- **Day 1-2**: 페이지 컴포넌트 구조 개선
- **Day 3**: 공통 컴포넌트 개선

### Week 3: 성능 최적화
- **Day 1-2**: 코드 스플리팅
- **Day 3**: React 최적화

### Week 4: 테스트 및 문서화
- **Day 1-2**: 테스트 커버리지 향상
- **Day 3**: 문서화

---

## 🎯 리팩토링 원칙

1. **TDD 방식**: 테스트 먼저 작성, 리팩토링 후 테스트 통과 확인
2. **점진적 마이그레이션**: 한 번에 하나씩, 기존 기능 유지
3. **타입 안전성**: TypeScript 타입을 최대한 활용
4. **문서화**: JSDoc 주석 및 사용 예시 작성
5. **테스트 커버리지**: 모든 새 모듈에 테스트 작성
6. **사진 업로드 모듈 제외**: `features/upload/`, `lib/forms/components/FileUpload.tsx`, `lib/forms/hooks/useFileUpload.ts`는 건드리지 않음

---

## 📊 예상 성과

### 코드 품질
- **중복 코드 제거**: ~150줄 감소 예상
- **타입 안전성 향상**: 하드코딩된 값 → 타입 안전 상수
- **일관성 향상**: 통일된 설정 관리 및 타입 정의

### 개발 경험
- **재사용성 향상**: 공통 컴포넌트 및 설정 모듈 제공
- **유지보수성 향상**: 모듈화된 구조로 변경 용이
- **테스트 용이성**: 각 모듈이 독립적으로 테스트 가능

### 성능
- **초기 로딩 시간**: 코드 스플리팅으로 ~20% 개선 예상
- **리렌더링 최적화**: React.memo로 불필요한 렌더링 감소

---

## ✅ 체크리스트

### Phase 1: 설정 및 타입 통합
- [ ] `lib/config/` 모듈 생성
- [ ] 하드코딩된 값들을 상수로 교체
- [ ] `types/` 모듈 확장
- [ ] 중복 타입 제거
- [ ] 모든 테스트 통과

### Phase 2: 페이지 컴포넌트 리팩토링
- [ ] 페이지 컴포넌트 구조 개선
- [ ] 공통 컴포넌트 개선
- [ ] 비즈니스 로직 분리
- [ ] 모든 테스트 통과

### Phase 3: 성능 최적화
- [ ] 코드 스플리팅 적용
- [ ] React 최적화 적용
- [ ] 성능 측정 및 개선 확인

### Phase 4: 테스트 및 문서화
- [ ] 테스트 커버리지 향상
- [ ] 문서화 완료

---

## 🚀 시작하기

**다음 단계**: 우선순위 1부터 시작
1. 상수 및 설정 통합 (`lib/config/`)
2. 타입 정의 통합 (`types/`)

각 단계마다 테스트를 작성하고 통과시킨 후 다음 단계로 진행합니다.

---

## ⚠️ 주의사항

- **사진 업로드 모듈은 절대 수정하지 않음**
  - `features/upload/UploadForm.tsx`
  - `features/upload/UploadPreview.tsx`
  - `lib/forms/components/FileUpload.tsx`
  - `lib/forms/hooks/useFileUpload.ts`
- **기존 기능 유지**: 리팩토링 중에도 모든 기능이 정상 작동해야 함
- **테스트 우선**: 리팩토링 전에 테스트 작성, 리팩토링 후 테스트 통과 확인

