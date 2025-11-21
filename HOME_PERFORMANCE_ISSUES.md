# 🐌 홈 화면 성능 문제 분석

## 발견된 문제점

### 1. 중복 API 호출
- `useAuth`: `getUser()` 호출
- `useUserProfile`: `getUser()` 다시 호출 (중복!)
- `ProfileCompletionBanner`: `useUserProfile()` 또 호출 (중복!)
- 총 3번의 `getUser()` 호출

### 2. 순차적 쿼리 실행
- `useAuth` 완료 → `useUserProfile` 시작 → `useAnalysisHistory` 시작
- 병렬 처리 안 됨

### 3. RecommendedTreatments 비효율
- React Query 사용 안 함 (캐싱 없음)
- useEffect로 매번 새로 페칭

### 4. 불필요한 로딩 대기
- 모든 데이터가 로드될 때까지 화면이 비어있음
- 점진적 로딩 없음

## 최적화 방안

1. **useAuth의 user를 useUserProfile에 전달** (중복 호출 제거)
2. **ProfileCompletionBanner에 userProfile을 props로 전달** (중복 호출 제거)
3. **RecommendedTreatments를 React Query로 변경** (캐싱)
4. **병렬 쿼리 실행** (staleTime 설정)
5. **Suspense/스켈레톤으로 점진적 로딩**





