# Git Commit Message Guidelines

## 📋 규칙

**모든 커밋 메시지는 영어로 작성합니다.**

한글 커밋 메시지는 Git 인코딩 문제로 인해 깨질 수 있으므로, 영어로 작성하여 일관성과 호환성을 유지합니다.

---

## 📝 커밋 메시지 형식

### 기본 형식
```
<type>: <subject>

<body>

<footer>
```

### Type 종류
- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 포맷팅, 세미콜론 누락 등 (기능 변경 없음)
- `refactor`: 코드 리팩토링
- `test`: 테스트 코드 추가/수정
- `chore`: 빌드 업무 수정, 패키지 매니저 설정 등

### 예시

#### 기능 추가
```
feat: add profile completion feature

- Implement skin type selection page
- Add main concerns selection UI
- Add profile completion banner component
- Update user profile mutation to save completion data
```

#### 버그 수정
```
fix: resolve toast hook type error

- Change useToast() destructuring to direct usage
- Update toast API calls to use success/error methods
- Fix React Query v5 isPending API usage
```

#### 리팩토링
```
refactor: consolidate error handling

- Move error handler to lib/error directory
- Remove duplicate errorHandler.ts
- Add integration tests for error classification
```

#### 테스트
```
test: add signup form validation tests

- Test real-time password validation
- Test required field validation
- Test form submission flow
```

---

## ✅ 좋은 커밋 메시지 예시

```
feat: implement profile completion flow

- Add profile completion page with skin type selection
- Add main concerns multi-select component
- Add profile completion banner to home page
- Update user profile mutation to handle completion data
- Add profile completion calculation utility
- Add tests for profile completion flow
```

```
fix: resolve build errors for production

- Fix Toast hook type error (useToast API change)
- Update React Query v5 API (isLoading -> isPending)
- Fix TypeScript compilation errors
- Update error handler imports
```

---

## ❌ 나쁜 커밋 메시지 예시

```
한글 커밋 메시지 (인코딩 문제 발생 가능)
프로필 완성 기능 추가
버그 수정
```

```
fix
update
changes
```

---

## 📌 참고사항

- 커밋 메시지는 간결하고 명확하게 작성
- 첫 줄은 50자 이내로 작성 (가능한 경우)
- 본문은 72자마다 줄바꿈
- 본문은 "what"과 "why"를 설명 (how는 코드에서 확인 가능)
- 과거형이 아닌 명령형으로 작성 (Add, Fix, Update 등)

---

**이 가이드라인을 따라 모든 커밋 메시지를 영어로 작성합니다.**

