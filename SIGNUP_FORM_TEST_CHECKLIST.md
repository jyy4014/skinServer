# 회원가입 폼 테스트 체크리스트

## ✅ 코드 검증 완료

### 1. Input 필드 텍스트 색상
- ✅ 모든 input 필드에 `text-gray-900 bg-white` 클래스 적용됨
- ✅ globals.css에 `!important` 규칙으로 강제 적용됨
- ✅ 적용된 필드:
  - 이메일 (line 253)
  - 비밀번호 (line 277)
  - 비밀번호 확인 (line 303)
  - 생년월일 (line 337)
  - 핸드폰번호 (line 378)
  - 별명 (line 419)

### 2. Select 필드 텍스트 색상
- ✅ 성별 select에 `text-gray-900 bg-white` 클래스 적용됨 (line 355)
- ✅ 국적 select에 `text-gray-900 bg-white` 클래스 적용됨 (line 396)
- ✅ 모든 option에 `text-gray-900` 클래스 적용됨 (lines 357-361, 399)
- ✅ globals.css에 `!important` 규칙으로 강제 적용됨

### 3. 서버 통신
- ✅ Edge Function을 통한 회원가입 처리
- ✅ 서버 측 검증 로직 적용
- ✅ 데이터베이스 트리거로 자동 사용자 생성

## 📋 수동 테스트 가이드

### Step 1 테스트
1. http://localhost:3000/auth/signup 접속
2. 이메일 입력 필드 확인
   - 텍스트가 검은색으로 보이는지 확인
   - 배경이 흰색인지 확인
3. 비밀번호 입력 필드 확인
   - 텍스트가 검은색으로 보이는지 확인
4. 비밀번호 확인 입력 필드 확인
   - 텍스트가 검은색으로 보이는지 확인
5. 모든 필드 입력 후 "다음 단계" 버튼 클릭

### Step 2 테스트
1. 생년월일 입력 필드 확인
   - 텍스트가 검은색으로 보이는지 확인
2. 성별 select 클릭
   - 드롭다운이 열릴 때 옵션 텍스트가 검은색으로 보이는지 확인
   - "남성", "여성", "기타", "선택 안 함" 모두 확인
3. 핸드폰번호 입력 필드 확인
   - 텍스트가 검은색으로 보이는지 확인
   - 자동 포맷팅 (010-1234-5678) 동작 확인
4. 국적 select 클릭
   - 드롭다운이 열릴 때 옵션 텍스트가 검은색으로 보이는지 확인
   - 모든 국가 옵션 확인
5. 별명 입력 필드 확인
   - 텍스트가 검은색으로 보이는지 확인
   - 최대 20자 제한 확인
6. 모든 필드 입력 후 "회원가입" 버튼 클릭

### 검증 포인트
- ✅ 모든 input 필드의 텍스트가 검은색 (#111827)
- ✅ 모든 select 옵션의 텍스트가 검은색 (#111827)
- ✅ 배경이 흰색 (#ffffff)
- ✅ placeholder 텍스트가 회색 (#9ca3af)

## 🔧 기술적 구현 사항

### CSS 우선순위
```css
/* globals.css */
input[type="text"],
input[type="email"],
input[type="password"],
input[type="tel"],
input[type="date"] {
  color: #111827 !important;
  background-color: #ffffff !important;
}

select {
  color: #111827 !important;
  background-color: #ffffff !important;
}

select option {
  color: #111827 !important;
  background-color: #ffffff !important;
}
```

### React 컴포넌트 클래스
```tsx
// 모든 input
className="... text-gray-900 bg-white"

// 모든 select
className="... bg-white text-gray-900"

// 모든 option
<option className="text-gray-900">...</option>
```

## 🐛 알려진 이슈
- Playwright MCP 서버 연결 문제로 자동화 테스트 불가
- 수동 테스트 필요

## 📝 다음 단계
1. 브라우저에서 수동 테스트 진행
2. 모든 필드의 텍스트 색상 확인
3. 회원가입 플로우 전체 테스트
4. 실제 데이터베이스 저장 확인

