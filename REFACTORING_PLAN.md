# 🔧 리팩토링 계획 (Phase 3)

## 📊 현재 상태

### ✅ 완료된 작업 (Priority 1-2)
- ✅ API 클라이언트 통합 모듈 (`lib/api/`)
- ✅ 인증 모듈 통합 (`lib/auth/`)
- ✅ 에러 처리 통합 (`lib/error/`)
- ✅ 이미지 처리 통합 (`lib/image/`)
- ✅ 분석 플로우 모듈화 (`features/analysis/`)
- ✅ 데이터 페칭 통합 (`lib/data/`)
- ✅ **55개 테스트 모두 통과** ✅

### 🔍 발견된 개선 포인트
1. **레거시 코드**: `useUploadFlow.ts`가 아직 존재하지만 사용되지 않음
2. **UploadForm**: `useImageResize`, `useFaceDetection` 직접 사용 → 통합 모듈로 마이그레이션 가능
3. **UI 컴포넌트**: 로딩/에러 상태 표시가 일관되지 않음
4. **상수 관리**: 하드코딩된 값들이 여러 곳에 분산
5. **타입 정의**: 일부 타입이 중복되거나 불완전함

---

## 🎯 Phase 3 리팩토링 계획

### 🔴 **우선순위 1: 레거시 코드 정리 및 마이그레이션**

#### 1-1. 레거시 훅 제거
**목표**: 사용되지 않는 레거시 코드 제거

**작업 내용**:
- [ ] `hooks/useUploadFlow.ts` 제거 (이미 `useAnalysisFlow`로 대체됨)
- [ ] `hooks/useAnalysisHistory.ts` 제거 (이미 `lib/data/queries/analysis.ts`로 대체됨)
- [ ] 모든 import 경로 확인 및 정리
- [ ] 테스트에서 레거시 훅 참조 제거

**예상 시간**: 1-2시간

---

#### 1-2. UploadForm 마이그레이션
**목표**: UploadForm이 새 모듈을 사용하도록 개선

**현재 상태**:
```tsx
// 현재: hooks 직접 사용
import { useImageResize } from '@/app/hooks/useImageResize'
import { useFaceDetection } from '@/app/hooks/useFaceDetection'
```

**개선 방향**:
```tsx
// 개선: 통합 모듈 사용
import { useImageProcessor } from '@/app/lib/image'
import { useFaceDetection } from '@/app/lib/image' // 또는 별도 모듈
```

**작업 내용**:
- [ ] `useImageResize` → `useImageProcessor` 마이그레이션
- [ ] `useFaceDetection` 모듈화 검토 (이미 `lib/image`에 통합 가능한지)
- [ ] UploadForm 테스트 업데이트
- [ ] 기능 동작 확인

**예상 시간**: 2-3시간

---

### 🟡 **우선순위 2: UI/UX 모듈 통합**

#### 2-1. 로딩/에러 상태 통합 (`lib/ui/`)
**목표**: 일관된 UI 상태 컴포넌트 제공

**현재 문제점**:
- `ProgressLoader.tsx`와 각 컴포넌트의 로딩 표시가 다름
- 에러 메시지 표시 방식이 일관되지 않음
- 빈 상태(Empty State) 컴포넌트가 없음

**모듈화 계획**:
```
lib/ui/
├── hooks/
│   ├── useLoadingState.ts    # 로딩 상태 관리
│   └── useErrorDisplay.ts   # 에러 표시 관리
├── components/
│   ├── LoadingSpinner.tsx   # 통일된 로딩 스피너
│   ├── ErrorMessage.tsx     # 통일된 에러 메시지
│   ├── EmptyState.tsx       # 빈 상태 컴포넌트
│   └── ProgressBar.tsx      # 진행률 표시
└── constants.ts              # UI 상수 (로딩 메시지 등)
```

**재사용 가능한 컴포넌트**:
- `<LoadingSpinner />` - 통일된 로딩 스피너
- `<ErrorMessage error={error} />` - 통일된 에러 메시지
- `<EmptyState message="..." />` - 빈 상태 표시
- `<ProgressBar progress={50} />` - 진행률 표시

**작업 내용**:
- [ ] `LoadingSpinner` 컴포넌트 생성
- [ ] `ErrorMessage` 컴포넌트 생성
- [ ] `EmptyState` 컴포넌트 생성
- [ ] `ProgressBar` 컴포넌트 생성
- [ ] 기존 컴포넌트 마이그레이션:
  - `ProgressLoader.tsx` → `LoadingSpinner` + `ProgressBar`
  - 각 페이지의 에러 표시 → `ErrorMessage`
- [ ] 테스트 작성

**예상 시간**: 3-4시간

---

#### 2-2. 폼 처리 통합 (`lib/forms/`)
**목표**: 재사용 가능한 폼 컴포넌트 및 훅 제공

**현재 문제점**:
- 파일 업로드 로직이 여러 컴포넌트에 중복
- 폼 검증 로직이 분산
- 에러 표시 방식이 일관되지 않음

**모듈화 계획**:
```
lib/forms/
├── hooks/
│   ├── useFileUpload.ts       # 파일 업로드 훅
│   ├── useFormValidation.ts   # 폼 검증 훅
│   └── useFormState.ts        # 폼 상태 관리 훅
├── components/
│   ├── FileUpload.tsx         # 재사용 가능한 파일 업로드 컴포넌트
│   ├── FormField.tsx         # 폼 필드 래퍼
│   └── FormError.tsx          # 폼 에러 표시
└── validators.ts              # 검증 함수 모음
```

**재사용 가능한 함수**:
- `useFileUpload()` - 파일 업로드 훅
- `useFormValidation()` - 폼 검증 훅
- `validateEmail()`, `validatePassword()` 등 - 검증 함수
- `<FileUpload />` - 재사용 가능한 파일 업로드 컴포넌트

**작업 내용**:
- [ ] `validators.ts` 생성 (이메일, 비밀번호, 파일 등)
- [ ] `useFormValidation` 훅 생성
- [ ] `useFileUpload` 훅 생성 (UploadForm 로직 추출)
- [ ] `<FileUpload />` 컴포넌트 생성
- [ ] `<FormField />` 컴포넌트 생성
- [ ] 기존 폼 컴포넌트 마이그레이션
- [ ] 테스트 작성

**예상 시간**: 4-5시간

---

### 🟢 **우선순위 3: 설정 및 타입 통합**

#### 3-1. 상수 및 설정 통합 (`lib/config/`)
**목표**: 환경 변수 및 상수 중앙 관리

**현재 문제점**:
- 환경 변수 접근이 여러 곳에 분산
- 하드코딩된 값들이 많음 (예: `maxWidth: 1024`, `quality: 0.85`)
- 설정 값이 일관되지 않음

**모듈화 계획**:
```
lib/config/
├── env.ts                     # 환경 변수 타입 안전 접근
├── constants.ts               # 앱 전역 상수
├── api.ts                     # API 엔드포인트 상수
└── validation.ts              # 검증 규칙 상수
```

**상수 예시**:
```typescript
// lib/config/constants.ts
export const IMAGE_CONFIG = {
  MAX_WIDTH: 1024,
  MAX_HEIGHT: 1024,
  QUALITY: 0.85,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const

export const ANALYSIS_CONFIG = {
  MIN_CONFIDENCE: 0.3,
  HIGH_UNCERTAINTY_THRESHOLD: 0.5,
  REVIEW_NEEDED_UNCERTAINTY: 0.4,
} as const
```

**작업 내용**:
- [ ] `env.ts` 생성 (환경 변수 타입 안전 접근)
- [ ] `constants.ts` 생성 (이미지, 분석 설정 등)
- [ ] `api.ts` 생성 (API 엔드포인트 상수)
- [ ] `validation.ts` 생성 (검증 규칙 상수)
- [ ] 하드코딩된 값들을 상수로 교체
- [ ] 테스트 작성

**예상 시간**: 2-3시간

---

#### 3-2. 타입 정의 통합 (`types/`)
**목표**: 타입 중복 제거 및 완전성 향상

**현재 문제점**:
- 타입이 여러 파일에 분산
- 중복된 타입 정의
- API 응답 타입이 불완전

**모듈화 계획**:
```
types/
├── index.ts                   # 공통 타입 (기존)
├── api.ts                     # API 응답 타입
├── analysis.ts                # 분석 관련 타입
├── user.ts                    # 사용자 관련 타입
├── storage.ts                 # Storage 관련 타입
└── forms.ts                   # 폼 관련 타입
```

**작업 내용**:
- [ ] `types/api.ts` 생성 (API 응답 타입 통합)
- [ ] `types/analysis.ts` 생성 (분석 관련 타입)
- [ ] `types/user.ts` 생성 (사용자 관련 타입)
- [ ] `types/storage.ts` 생성 (Storage 관련 타입)
- [ ] `types/forms.ts` 생성 (폼 관련 타입)
- [ ] 중복 타입 제거 및 통합
- [ ] 타입 문서화 (JSDoc)

**예상 시간**: 2-3시간

---

### 🔵 **우선순위 4: 성능 최적화**

#### 4-1. 코드 스플리팅
**목표**: 초기 로딩 시간 단축

**작업 내용**:
- [ ] 큰 컴포넌트를 동적 import로 분리
- [ ] 라우트별 코드 스플리팅
- [ ] 이미지 처리 라이브러리 지연 로딩
- [ ] 번들 크기 분석 및 최적화

**예상 시간**: 3-4시간

---

#### 4-2. React 최적화
**목표**: 불필요한 리렌더링 방지

**작업 내용**:
- [ ] `React.memo` 적용 (불필요한 리렌더링 방지)
- [ ] `useMemo`, `useCallback` 최적화
- [ ] 컴포넌트 분리 (큰 컴포넌트를 작은 단위로)
- [ ] React DevTools Profiler로 성능 측정

**예상 시간**: 2-3시간

---

## 📅 리팩토링 일정

### Week 1: 레거시 정리 및 UI 통합
- **Day 1-2**: 레거시 코드 제거 및 UploadForm 마이그레이션
- **Day 3-4**: UI 상태 통합 (로딩/에러 컴포넌트)
- **Day 5**: 폼 처리 통합 시작

### Week 2: 설정 통합 및 성능 최적화
- **Day 1-2**: 폼 처리 통합 완료
- **Day 3**: 상수 및 설정 통합
- **Day 4**: 타입 정의 통합
- **Day 5**: 성능 최적화

---

## 🎯 리팩토링 원칙

1. **TDD 방식**: 테스트 먼저 작성, 리팩토링 후 테스트 통과 확인
2. **점진적 마이그레이션**: 한 번에 하나씩, 기존 기능 유지
3. **타입 안전성**: TypeScript 타입을 최대한 활용
4. **문서화**: JSDoc 주석 및 사용 예시 작성
5. **테스트 커버리지**: 모든 새 모듈에 테스트 작성

---

## 📊 예상 성과

### 코드 품질
- **중복 코드 제거**: ~200줄 감소 예상
- **타입 안전성 향상**: 하드코딩된 값 → 타입 안전 상수
- **일관성 향상**: 통일된 UI 컴포넌트 및 에러 처리

### 개발 경험
- **재사용성 향상**: 공통 컴포넌트 및 훅 제공
- **유지보수성 향상**: 모듈화된 구조로 변경 용이
- **테스트 용이성**: 각 모듈이 독립적으로 테스트 가능

### 성능
- **초기 로딩 시간**: 코드 스플리팅으로 ~20% 개선 예상
- **리렌더링 최적화**: React.memo로 불필요한 렌더링 감소

---

## ✅ 체크리스트

### Phase 3-1: 레거시 정리
- [ ] `useUploadFlow.ts` 제거
- [ ] `useAnalysisHistory.ts` 제거
- [ ] UploadForm 마이그레이션
- [ ] 모든 테스트 통과

### Phase 3-2: UI 통합
- [ ] 로딩/에러 상태 컴포넌트 생성
- [ ] 폼 처리 모듈 생성
- [ ] 기존 컴포넌트 마이그레이션
- [ ] 모든 테스트 통과

### Phase 3-3: 설정 통합
- [ ] 상수 및 설정 모듈 생성
- [ ] 타입 정의 통합
- [ ] 하드코딩된 값 교체
- [ ] 모든 테스트 통과

### Phase 3-4: 성능 최적화
- [ ] 코드 스플리팅 적용
- [ ] React 최적화 적용
- [ ] 성능 측정 및 개선 확인

---

## 🚀 시작하기

**다음 단계**: 우선순위 1부터 시작
1. 레거시 코드 제거
2. UploadForm 마이그레이션
3. UI 통합 모듈 생성

각 단계마다 테스트를 작성하고 통과시킨 후 다음 단계로 진행합니다.

