# 배포 가이드

## 🚀 배포 전 체크리스트

### 1. 환경 변수 확인

#### 프론트엔드 (`skinfront/.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=your_backend_url
```

#### 백엔드 (`skinServer/.env`)
```env
PORT=3001
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
FRONTEND_URL=your_frontend_url
```

### 2. 데이터베이스 마이그레이션

1. Supabase 대시보드 접속
2. SQL Editor에서 마이그레이션 파일 실행:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_storage_and_triggers.sql`

### 3. Storage 버킷 확인

- 버킷 이름: `skin-images`
- Public: 활성화
- 정책: 설정 완료

## 📦 배포 방법

### 프론트엔드 (Vercel)

1. **GitHub에 푸시**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Vercel 배포**
   - [Vercel](https://vercel.com) 접속
   - "New Project" 클릭
   - GitHub 저장소 선택
   - Root Directory: `skinfront` 설정
   - 환경 변수 설정:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `NEXT_PUBLIC_API_URL` (백엔드 URL)
   - "Deploy" 클릭

### 백엔드 (Railway / Render)

#### Railway 배포

1. **GitHub에 푸시**
   ```bash
   # skinServer 폴더만 별도 저장소로 푸시
   cd skinServer
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. **Railway 배포**
   - [Railway](https://railway.app) 접속
   - "New Project" 클릭
   - "Deploy from GitHub repo" 선택
   - 저장소 선택
   - 환경 변수 설정
   - 배포 완료 후 URL 확인

#### Render 배포

1. **Render 대시보드 접속**
   - [Render](https://render.com) 접속
   - "New +" > "Web Service" 클릭

2. **GitHub 저장소 연결**
   - 저장소 선택
   - Root Directory: `skinServer` 설정

3. **빌드 설정**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

4. **환경 변수 설정**
   - `PORT`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `FRONTEND_URL`

## 🔧 배포 후 확인

### 1. 프론트엔드 확인
- [ ] 홈페이지 접속 확인
- [ ] 온보딩 화면 확인
- [ ] 로그인 페이지 확인

### 2. 백엔드 확인
- [ ] Health check: `GET /health`
- [ ] API 엔드포인트 테스트

### 3. 통합 테스트
- [ ] 회원가입/로그인 테스트
- [ ] 이미지 업로드 테스트
- [ ] 분석 기능 테스트

## 🐛 문제 해결

### CORS 오류
- 백엔드의 `FRONTEND_URL` 환경 변수 확인
- 프론트엔드 URL과 일치하는지 확인

### API 연결 오류
- 프론트엔드의 `NEXT_PUBLIC_API_URL` 확인
- 백엔드 서버가 실행 중인지 확인

### 데이터베이스 오류
- Supabase 프로젝트 URL 확인
- 마이그레이션 파일 실행 확인

