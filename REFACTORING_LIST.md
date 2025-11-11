# 🔧 리팩토링 및 모듈화 리스트

## 📋 개요
코드베이스 분석 결과, 재사용 가능한 모듈로 분리할 수 있는 중복 코드와 개선 포인트들을 정리했습니다.

---

## 🎯 우선순위별 리팩토링 리스트

### 🔴 **우선순위 1: 핵심 인프라 모듈화**

#### 1. **API 클라이언트 통합 모듈** (`lib/api/`)
**현재 문제점:**
- `lib/api.ts`와 `hooks/useUploadFlow.ts`에 중복된 fetch 로직
- Edge Function 호출이 여러 곳에 분산
- 에러 처리 로직이 각각 다름

**모듈화 계획:**
```
lib/api/
├── client.ts              # 기본 HTTP 클라이언트 (fetch 래퍼)
├── edge-functions.ts      # Supabase Edge Functions 전용 클라이언트
├── storage.ts             # Supabase Storage 업로드/다운로드
├── types.ts               # API 응답 타입 정의
└── interceptors.ts        # 요청/응답 인터셉터 (인증, 에러 처리)
```

**재사용 가능한 함수:**
- `createApiClient()` - 기본 클라이언트 생성
- `callEdgeFunction<T>()` - Edge Function 호출 통합
- `uploadToStorage()` - Storage 업로드 통합
- `handleApiError()` - 통합 에러 처리

---

#### 2. **인증 모듈 통합** (`lib/auth/`)
**현재 문제점:**
- 5개 이상의 파일에서 `supabase.auth.getUser()` 반복
- 인증 체크 로직이 각 컴포넌트에 분산
- 세션 관리가 일관되지 않음

**모듈화 계획:**
```
lib/auth/
├── hooks/
│   ├── useAuth.ts         # 인증 상태 관리 훅
│   ├── useRequireAuth.ts  # 인증 필수 페이지용 훅
│   └── useSession.ts      # 세션 관리 훅
├── guards/
│   └── AuthGuard.tsx      # 인증 가드 컴포넌트
└── utils.ts               # 인증 유틸리티 함수
```

**재사용 가능한 함수:**
- `useAuth()` - 현재 사용자 정보 및 인증 상태
- `useRequireAuth()` - 인증 필요 시 리다이렉트
- `<AuthGuard>` - 페이지 레벨 인증 가드
- `getAccessToken()` - 토큰 가져오기 통합

---

#### 3. **에러 처리 통합 모듈** (`lib/error/`)
**현재 문제점:**
- `utils/errorHandler.ts`는 있지만 활용도 낮음
- 각 컴포넌트에서 에러 처리 방식이 다름
- 에러 메시지가 하드코딩됨

**모듈화 계획:**
```
lib/error/
├── handler.ts             # 에러 분류 및 변환 (기존 errorHandler.ts 개선)
├── messages.ts            # 에러 메시지 상수화
├── hooks/
│   └── useErrorHandler.ts # 에러 처리 훅
└── components/
    └── ErrorBoundary.tsx  # React Error Boundary
```

**재사용 가능한 함수:**
- `classifyError()` - 개선된 에러 분류
- `getErrorMessage()` - 사용자 친화적 메시지 변환
- `useErrorHandler()` - 훅 기반 에러 처리
- `<ErrorBoundary>` - 컴포넌트 레벨 에러 캐치

---

### 🟡 **우선순위 2: 비즈니스 로직 모듈화**

#### 4. **이미지 처리 통합 모듈** (`lib/image/`)
**현재 문제점:**
- `utils/image.ts`와 `hooks/useImageResize.ts`에 로직 분산
- 얼굴 감지와 이미지 처리 로직이 혼재
- 품질 검사 로직이 여러 곳에 중복

**모듈화 계획:**
```
lib/image/
├── processing.ts          # 이미지 리사이즈, 변환
├── quality.ts             # 품질 검사 (Laplacian, blur detection)
├── validation.ts          # 파일 유효성 검사
├── face-detection.ts      # 얼굴 감지 통합 (기존 useFaceDetection 개선)
└── hooks/
    ├── useImageProcessor.ts  # 통합 이미지 처리 훅
    └── useImageValidator.ts  # 이미지 검증 훅
```

**재사용 가능한 함수:**
- `processImage()` - 리사이즈 + WebP 변환
- `validateImageFile()` - 파일 타입/크기 검증
- `checkImageQuality()` - 품질 점수 계산
- `useImageProcessor()` - 통합 이미지 처리 훅

---

#### 5. **분석 플로우 모듈화** (`features/analysis/`)
**현재 문제점:**
- `useUploadFlow.ts`가 너무 많은 책임을 가짐 (300줄 이상)
- 업로드, 분석, 저장 로직이 하나의 훅에 혼재
- 테스트하기 어려운 구조

**모듈화 계획:**
```
features/analysis/
├── hooks/
│   ├── useImageUpload.ts      # 이미지 업로드만 담당
│   ├── useAnalysis.ts         # AI 분석 호출만 담당
│   ├── useAnalysisSave.ts     # 결과 저장만 담당
│   └── useAnalysisFlow.ts     # 전체 플로우 오케스트레이션
├── services/
│   ├── analysisService.ts     # 분석 API 서비스
│   └── storageService.ts      # Storage 서비스
└── types.ts                   # 분석 관련 타입
```

**재사용 가능한 함수:**
- `useImageUpload()` - 업로드 전용 훅
- `useAnalysis()` - 분석 전용 훅
- `useAnalysisFlow()` - 전체 플로우 통합 훅
- `analysisService.analyze()` - 분석 서비스

---

#### 6. **데이터 페칭 통합** (`lib/data/`)
**현재 문제점:**
- 여러 페이지에서 Supabase 쿼리가 중복
- React Query 설정이 일관되지 않음
- 캐싱 전략이 없음

**모듈화 계획:**
```
lib/data/
├── queries/
│   ├── analysisQueries.ts     # 분석 관련 쿼리
│   ├── userQueries.ts         # 사용자 관련 쿼리
│   └── treatmentQueries.ts    # 시술 관련 쿼리
├── mutations/
│   ├── analysisMutations.ts   # 분석 관련 뮤테이션
│   └── userMutations.ts       # 사용자 관련 뮤테이션
└── cache.ts                    # 캐시 키 상수
```

**재사용 가능한 함수:**
- `useAnalysisHistory()` - 개선된 히스토리 쿼리
- `useAnalysisDetail()` - 상세 조회 쿼리
- `useSaveAnalysis()` - 저장 뮤테이션
- `queryKeys` - 캐시 키 상수

---

### 🟢 **우선순위 3: UI/UX 모듈화**

#### 7. **폼 처리 통합** (`lib/forms/`)
**현재 문제점:**
- 파일 업로드 로직이 여러 컴포넌트에 중복
- 폼 검증 로직이 분산
- 에러 표시 방식이 일관되지 않음

**모듈화 계획:**
```
lib/forms/
├── hooks/
│   ├── useFileUpload.ts       # 파일 업로드 훅
│   ├── useFormValidation.ts   # 폼 검증 훅
│   └── useFormState.ts        # 폼 상태 관리 훅
├── components/
│   ├── FileUpload.tsx         # 재사용 가능한 파일 업로드 컴포넌트
│   └── FormField.tsx          # 폼 필드 래퍼
└── validators.ts              # 검증 함수 모음
```

---

#### 8. **로딩/에러 상태 통합** (`lib/ui/`)
**현재 문제점:**
- 로딩 상태 표시가 각 컴포넌트마다 다름
- 에러 메시지 표시 방식이 일관되지 않음

**모듈화 계획:**
```
lib/ui/
├── hooks/
│   ├── useLoadingState.ts    # 로딩 상태 관리
│   └── useErrorDisplay.ts     # 에러 표시 관리
├── components/
│   ├── LoadingSpinner.tsx    # 통일된 로딩 스피너
│   ├── ErrorMessage.tsx       # 통일된 에러 메시지
│   └── EmptyState.tsx         # 빈 상태 컴포넌트
└── constants.ts               # UI 상수 (로딩 메시지 등)
```

---

### 🔵 **우선순위 4: 유틸리티 및 상수 모듈화**

#### 9. **상수 및 설정 통합** (`lib/config/`)
**현재 문제점:**
- 환경 변수 접근이 여러 곳에 분산
- 하드코딩된 값들이 많음
- 설정 값이 일관되지 않음

**모듈화 계획:**
```
lib/config/
├── env.ts                     # 환경 변수 타입 안전 접근
├── constants.ts               # 앱 전역 상수
├── api.ts                     # API 엔드포인트 상수
└── validation.ts              # 검증 규칙 상수
```

**재사용 가능한 함수:**
- `getApiUrl()` - API URL 가져오기
- `getSupabaseUrl()` - Supabase URL 가져오기
- `MAX_IMAGE_SIZE` - 최대 이미지 크기 상수
- `IMAGE_QUALITY_THRESHOLD` - 품질 임계값

---

#### 10. **타입 정의 통합** (`types/`)
**현재 문제점:**
- 타입이 여러 파일에 분산
- 중복된 타입 정의
- API 응답 타입이 불완전

**모듈화 계획:**
```
types/
├── index.ts                   # 공통 타입 (기존)
├── api.ts                     # API 응답 타입
├── analysis.ts                # 분석 관련 타입
├── user.ts                    # 사용자 관련 타입
└── storage.ts                 # Storage 관련 타입
```

---

## 📊 리팩토링 우선순위 매트릭스

| 모듈 | 우선순위 | 복잡도 | 영향도 | 예상 시간 |
|------|---------|--------|--------|----------|
| API 클라이언트 통합 | 🔴 높음 | 중 | 높음 | 4-6시간 |
| 인증 모듈 통합 | 🔴 높음 | 낮음 | 높음 | 2-3시간 |
| 에러 처리 통합 | 🔴 높음 | 낮음 | 중 | 2-3시간 |
| 이미지 처리 통합 | 🟡 중간 | 중 | 중 | 3-4시간 |
| 분석 플로우 모듈화 | 🟡 중간 | 높음 | 높음 | 6-8시간 |
| 데이터 페칭 통합 | 🟡 중간 | 중 | 중 | 3-4시간 |
| 폼 처리 통합 | 🟢 낮음 | 낮음 | 낮음 | 2-3시간 |
| UI 상태 통합 | 🟢 낮음 | 낮음 | 낮음 | 2-3시간 |
| 상수 및 설정 | 🟢 낮음 | 낮음 | 낮음 | 1-2시간 |
| 타입 정의 통합 | 🟢 낮음 | 낮음 | 낮음 | 1-2시간 |

---

## 🎯 리팩토링 원칙

1. **단일 책임 원칙 (SRP)**: 각 모듈은 하나의 책임만 가짐
2. **의존성 역전 (DIP)**: 인터페이스 기반 설계
3. **DRY (Don't Repeat Yourself)**: 중복 코드 제거
4. **테스트 가능성**: 각 모듈은 독립적으로 테스트 가능
5. **타입 안전성**: TypeScript 타입을 최대한 활용

---

## 📝 리팩토링 체크리스트

### 각 모듈화 작업 시 확인사항:
- [ ] 기존 기능이 정상 작동하는지 확인
- [ ] 단위 테스트 작성/업데이트
- [ ] 타입 정의 완료
- [ ] 문서화 (JSDoc 주석)
- [ ] 사용 예시 코드 작성
- [ ] 기존 코드에서 새 모듈로 마이그레이션

---

## 🚀 추천 리팩토링 순서

1. **1주차**: API 클라이언트 + 인증 모듈 (기반 인프라)
2. **2주차**: 에러 처리 + 이미지 처리 (비즈니스 로직)
3. **3주차**: 분석 플로우 모듈화 (핵심 기능)
4. **4주차**: 데이터 페칭 + UI 모듈 (편의 기능)

---

## 💡 추가 개선 제안

1. **환경 변수 검증**: 앱 시작 시 필수 환경 변수 체크
2. **로깅 시스템**: 통합 로깅 모듈 (개발/프로덕션 분리)
3. **성능 모니터링**: React Query DevTools, 성능 메트릭 수집
4. **코드 스플리팅**: 큰 모듈을 동적 import로 분리
5. **스토리북**: UI 컴포넌트 문서화 및 테스트

