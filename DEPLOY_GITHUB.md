# GitHub 배포 가이드

프론트엔드와 백엔드가 각각 별도의 Git 저장소로 초기화되었습니다.

## ✅ 현재 상태

### 프론트엔드 (`skinfront`)
- ✅ Git 저장소 초기화 완료
- ✅ 초기 커밋 완료
- ✅ 브랜치: `main`
- 📍 위치: `d:\skin-cursor\skinfront`

### 백엔드 (`skinServer`)
- ✅ Git 저장소 초기화 완료
- ✅ 초기 커밋 완료
- ✅ 브랜치: `main`
- 📍 위치: `d:\skin-cursor\skinServer`

## 🚀 GitHub에 푸시하기

### 1. GitHub에서 저장소 생성

#### 프론트엔드 저장소
1. [GitHub](https://github.com) 접속
2. "New repository" 클릭
3. 저장소 이름: `skin-frontend` (또는 원하는 이름)
4. Public 또는 Private 선택
5. **README, .gitignore, license 추가하지 않음** (이미 있음)
6. "Create repository" 클릭
7. 생성된 저장소 URL 복사 (예: `https://github.com/YOUR_USERNAME/skin-frontend.git`)

#### 백엔드 저장소
1. "New repository" 클릭
2. 저장소 이름: `skin-backend` (또는 원하는 이름)
3. Public 또는 Private 선택
4. **README, .gitignore, license 추가하지 않음** (이미 있음)
5. "Create repository" 클릭
6. 생성된 저장소 URL 복사 (예: `https://github.com/YOUR_USERNAME/skin-backend.git`)

### 2. 프론트엔드 푸시

```bash
cd d:\skin-cursor\skinfront
git remote add origin https://github.com/YOUR_USERNAME/skin-frontend.git
git push -u origin main
```

### 3. 백엔드 푸시

```bash
cd d:\skin-cursor\skinServer
git remote add origin https://github.com/YOUR_USERNAME/skin-backend.git
git push -u origin main
```

## 🔐 GitHub Secrets 설정

### 프론트엔드 저장소 Secrets

프론트엔드 저장소의 **Settings > Secrets and variables > Actions**에서 다음을 추가:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=your_backend_url
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
```

### 백엔드 저장소 Secrets

백엔드 저장소의 **Settings > Secrets and variables > Actions**에서 다음을 추가:

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=your_frontend_url
RAILWAY_TOKEN=your_railway_token (Railway 사용 시)
RENDER_SERVICE_ID=your_render_service_id (Render 사용 시)
RENDER_API_KEY=your_render_api_key (Render 사용 시)
```

## 📋 배포 플랫폼 설정

### 프론트엔드 - Vercel

1. [Vercel](https://vercel.com) 접속
2. "New Project" 클릭
3. GitHub 저장소 선택 (`skin-frontend`)
4. Root Directory: `.` (루트)
5. 환경 변수 설정:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_API_URL`
6. "Deploy" 클릭

### 백엔드 - Railway

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

### 백엔드 - Render (대안)

1. [Render](https://render.com) 접속
2. "New +" > "Web Service" 클릭
3. GitHub 저장소 선택 (`skin-backend`)
4. 빌드 설정:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. 환경 변수 설정 (Railway와 동일)
6. 배포 완료 후 URL 확인

## 🔄 자동 배포

각 저장소에 코드를 푸시하면 GitHub Actions가 자동으로 실행됩니다:

### 프론트엔드
- `git push` → GitHub Actions 트리거 → Vercel 자동 배포

### 백엔드
- `git push` → GitHub Actions 트리거 → Railway/Render 자동 배포

## 📝 다음 단계

1. ✅ Git 저장소 초기화 완료
2. ⏳ GitHub 저장소 생성
3. ⏳ GitHub에 푸시 (`git remote add origin` + `git push`)
4. ⏳ GitHub Secrets 설정
5. ⏳ 배포 플랫폼 연결 (Vercel, Railway/Render)
6. ⏳ 자동 배포 테스트

## 🔧 문제 해결

### Git remote 추가 오류
```bash
# 기존 remote 제거 후 다시 추가
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
```

### 푸시 권한 오류
- GitHub Personal Access Token 사용 필요
- 또는 SSH 키 설정

### GitHub Actions 실패
- Secrets가 올바르게 설정되었는지 확인
- 워크플로우 로그 확인 (Actions 탭)
