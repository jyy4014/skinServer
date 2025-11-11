# 테스트 가이드

## 🧪 테스트 체크리스트

### 1. 서버 실행 테스트

#### 백엔드 서버
```bash
cd skinServer
npm run dev
```

확인 사항:
- [ ] 서버가 `http://localhost:3001`에서 실행되는지 확인
- [ ] `/health` 엔드포인트가 정상 응답하는지 확인
  ```bash
  curl http://localhost:3001/health
  ```

#### 프론트엔드 서버
```bash
cd skinfront
npm run dev
```

확인 사항:
- [ ] 서버가 `http://localhost:3000`에서 실행되는지 확인
- [ ] 브라우저에서 접속 시 에러가 없는지 확인

### 2. 인증 기능 테스트

#### 회원가입
1. 브라우저에서 `http://localhost:3000` 접속
2. 온보딩 화면 확인
3. 로그인 화면으로 이동
4. 이메일과 비밀번호 입력하여 회원가입
5. 이메일 확인 링크 클릭 (Supabase 대시보드에서 확인)

확인 사항:
- [ ] 회원가입 성공
- [ ] 이메일 확인 메일 수신
- [ ] 로그인 후 홈 화면으로 이동

#### 로그인
1. 로그인 화면에서 이메일과 비밀번호 입력
2. 로그인 버튼 클릭

확인 사항:
- [ ] 로그인 성공
- [ ] 홈 화면으로 리다이렉트
- [ ] 사용자 정보 표시

#### Google 로그인
1. Google 로그인 버튼 클릭
2. Google 계정 선택

확인 사항:
- [ ] Google 로그인 성공
- [ ] 홈 화면으로 리다이렉트

### 3. 피부 분석 기능 테스트

#### 이미지 업로드
1. 홈 화면에서 "오늘의 피부 분석하기" 클릭
2. "사진 업로드" 버튼 클릭
3. 이미지 파일 선택

확인 사항:
- [ ] 이미지 미리보기 표시
- [ ] 이미지가 Supabase Storage에 업로드되는지 확인

#### AI 분석
1. 이미지 선택 후 "분석 시작하기" 버튼 클릭
2. 분석 진행 대기

확인 사항:
- [ ] 로딩 화면 표시
- [ ] 분석 결과 표시 (요약, 상세 분석, 추천 시술)
- [ ] 분석 결과가 DB에 저장되는지 확인

### 4. API 엔드포인트 테스트

#### Health Check
```bash
curl http://localhost:3001/health
```

예상 응답:
```json
{
  "status": "ok",
  "message": "Backend server is running",
  "timestamp": "2025-11-07T..."
}
```

#### 분석 API
```bash
curl -X POST http://localhost:3001/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "image_url": "https://example.com/image.jpg",
    "user_id": "user-uuid",
    "access_token": "token"
  }'
```

#### 사용자 정보 조회
```bash
curl http://localhost:3001/api/auth/user \
  -H "Authorization: Bearer <token>"
```

### 5. 데이터베이스 테스트

#### Supabase 대시보드에서 확인
1. [Supabase 대시보드](https://supabase.com/dashboard) 접속
2. Table Editor에서 확인:
   - [ ] `users` 테이블에 사용자 데이터가 있는지
   - [ ] `skin_analysis` 테이블에 분석 결과가 있는지
   - [ ] `treatments` 테이블에 시술 데이터가 있는지

#### Storage 확인
1. Storage 메뉴에서 `skin-images` 버킷 확인
2. 업로드된 이미지 파일 확인

### 6. 에러 처리 테스트

#### 잘못된 요청
- [ ] 필수 필드 누락 시 400 에러 반환
- [ ] 잘못된 토큰 시 401 에러 반환
- [ ] 서버 오류 시 500 에러 반환

#### 네트워크 오류
- [ ] 백엔드 서버가 꺼져있을 때 적절한 에러 메시지 표시
- [ ] 타임아웃 처리

## 🐛 문제 해결

### 백엔드 서버가 시작되지 않는 경우
1. 환경 변수 확인 (`skinServer/.env`)
2. 포트 3001이 사용 중인지 확인
3. 의존성 설치 확인 (`npm install`)

### 프론트엔드 서버가 시작되지 않는 경우
1. 환경 변수 확인 (`skinfront/.env.local`)
2. 포트 3000이 사용 중인지 확인
3. 의존성 설치 확인 (`npm install`)

### CORS 오류
1. `skinServer/.env`의 `FRONTEND_URL` 확인
2. 백엔드 서버 재시작

### 이미지 업로드 실패
1. Supabase Storage 버킷 확인
2. Storage 정책 확인
3. 파일 크기 제한 확인 (50MB)

## 📊 성능 테스트

### 응답 시간 측정
- Health check: < 100ms
- 분석 API: < 3초 (모의 데이터)
- 이미지 업로드: 파일 크기에 따라 다름

## ✅ 완료 기준

- [ ] 모든 서버가 정상 실행
- [ ] 회원가입/로그인 기능 정상 작동
- [ ] 이미지 업로드 및 분석 기능 정상 작동
- [ ] API 엔드포인트 정상 응답
- [ ] 데이터베이스에 데이터 저장 확인
- [ ] 에러 처리 정상 작동

