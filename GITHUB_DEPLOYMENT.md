# GitHub 배포 가이드

프론트엔드와 백엔드를 각각 별도의 GitHub 저장소로 관리하고 배포하는 방법입니다.

## 📦 저장소 구조

### 1. 프론트엔드 저장소 (`skinfront`)
```
skinfront/
├── .github/
│   └── workflows/
│       ├── deploy.yml      # Vercel 자동 배포
│       └── ci.yml          # CI/CD 파이프라인
├── app/
├── lib/
├── public/
└── package.json
```

### 2. 백엔드 저장소 (`skinServer`)
```
skinServer/
├── .github/
│   └── workflows/
│       ├── deploy.yml      # Railway/Render 자동 배포
│       └── ci.yml          # CI/CD 파이프라인
├── src/
└── package.json
```

## 🚀 GitHub 저장소 생성 및 푸시

### 프론트엔드 저장소

1. **GitHub에서 새 저장소 생성**
   - 저장소 이름: `skin-frontend` (또는 원하는 이름)
   - Public 또는 Private 선택

2. **로컬에서 초기화 및 푸시**
   ```bash
   cd skinfront
   git init
   git add .
   git commit -m "Initial commit: Frontend"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/skin-frontend.git
   git push -u origin main
   ```

### 백엔드 저장소

1. **GitHub에서 새 저장소 생성**
   - 저장소 이름: `skin-backend` (또는 원하는 이름)
   - Public 또는 Private 선택

2. **로컬에서 초기화 및 푸시**
   ```bash
   cd skinServer
   git init
   git add .
   git commit -m "Initial commit: Backend"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/skin-backend.git
   git push -u origin main
   ```

## 🔐 GitHub Secrets 설정

### 프론트엔드 저장소 Secrets

프론트엔드 저장소의 Settings > Secrets and variables > Actions에서 다음을 추가:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=your_backend_url
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
```

### 백엔드 저장소 Secrets

백엔드 저장소의 Settings > Secrets and variables > Actions에서 다음을 추가:

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=your_frontend_url
RAILWAY_TOKEN=your_railway_token (Railway 사용 시)
RENDER_SERVICE_ID=your_render_service_id (Render 사용 시)
RENDER_API_KEY=your_render_api_key (Render 사용 시)
```

## 📋 Vercel 배포 설정 (프론트엔드)

### 방법 1: Vercel 대시보드에서 연결

1. [Vercel](https://vercel.com) 접속
2. "New Project" 클릭
3. GitHub 저장소 선택 (`skin-frontend`)
4. Root Directory: `.` (루트)
5. 환경 변수 설정:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_API_URL`
6. "Deploy" 클릭

### 방법 2: GitHub Actions로 자동 배포

GitHub Actions 워크플로우가 자동으로 실행되어 Vercel에 배포됩니다.

## 📋 Railway/Render 배포 설정 (백엔드)

### Railway 배포

1. [Railway](https://railway.app) 접속
2. "New Project" 클릭
3. "Deploy from GitHub repo" 선택
4. `skin-backend` 저장소 선택
5. 환경 변수 설정:
   - `PORT=3001`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `GOOGLE_GEMINI_API_KEY`
   - `FRONTEND_URL`
6. 배포 완료 후 URL 확인

### Render 배포

1. [Render](https://render.com) 접속
2. "New +" > "Web Service" 클릭
3. GitHub 저장소 선택 (`skin-backend`)
4. 빌드 설정:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. 환경 변수 설정 (Railway와 동일)
6. 배포 완료 후 URL 확인

## 🔄 자동 배포 플로우

### 프론트엔드
1. `skinfront` 저장소에 코드 푸시
2. GitHub Actions 트리거
3. 빌드 및 테스트 실행
4. Vercel에 자동 배포

### 백엔드
1. `skinServer` 저장소에 코드 푸시
2. GitHub Actions 트리거
3. 빌드 및 타입 체크 실행
4. Railway/Render에 자동 배포

## 📝 .gitignore 확인

### 프론트엔드 (`skinfront/.gitignore`)
```
node_modules/
.next/
.env.local
.env*.local
*.log
.DS_Store
```

### 백엔드 (`skinServer/.gitignore`)
```
node_modules/
dist/
.env
.env*.local
*.log
.DS_Store
```

## ✅ 배포 확인

### 프론트엔드
- Vercel 대시보드에서 배포 상태 확인
- 배포된 URL 접속 테스트

### 백엔드
- Railway/Render 대시보드에서 배포 상태 확인
- Health check: `GET https://your-backend-url/health`

## 🔧 문제 해결

### GitHub Actions 실패
- Secrets가 올바르게 설정되었는지 확인
- 워크플로우 로그 확인 (Actions 탭)

### 배포 실패
- 환경 변수 확인
- 빌드 로그 확인
- 의존성 설치 오류 확인

### CORS 오류
- 백엔드의 `FRONTEND_URL`이 프론트엔드 URL과 일치하는지 확인

