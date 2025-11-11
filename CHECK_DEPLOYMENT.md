# 배포 상태 확인 가이드

## 🔍 배포 확인 체크리스트

### 1. GitHub 저장소 확인

#### 프론트엔드 저장소
- [ ] GitHub 저장소 접속: `https://github.com/YOUR_USERNAME/skin-frontend`
- [ ] 코드가 올바르게 푸시되었는지 확인
- [ ] `.github/workflows/` 폴더가 있는지 확인

#### 백엔드 저장소
- [ ] GitHub 저장소 접속: `https://github.com/YOUR_USERNAME/skin-backend`
- [ ] 코드가 올바르게 푸시되었는지 확인
- [ ] `.github/workflows/` 폴더가 있는지 확인

### 2. GitHub Actions 상태 확인

#### 프론트엔드
1. 저장소의 **Actions** 탭 클릭
2. `Deploy Frontend` 워크플로우 확인
3. 최근 실행 상태 확인:
   - ✅ 녹색 체크: 성공
   - ❌ 빨간 X: 실패 (로그 확인 필요)
   - 🟡 노란 원: 진행 중

#### 백엔드
1. 저장소의 **Actions** 탭 클릭
2. `Deploy Backend` 워크플로우 확인
3. 최근 실행 상태 확인

### 3. 배포 플랫폼 확인

#### 프론트엔드 - Vercel
1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. 프로젝트 목록에서 `skin-frontend` 확인
3. 배포 상태 확인:
   - ✅ Ready: 배포 완료
   - 🔄 Building: 배포 중
   - ❌ Error: 배포 실패
4. 배포된 URL 확인 (예: `https://skin-frontend.vercel.app`)

#### 백엔드 - Railway
1. [Railway Dashboard](https://railway.app/dashboard) 접속
2. 프로젝트 목록에서 `skin-backend` 확인
3. 배포 상태 확인:
   - ✅ Deployed: 배포 완료
   - 🔄 Deploying: 배포 중
   - ❌ Failed: 배포 실패
4. 배포된 URL 확인 (예: `https://skin-backend.railway.app`)

#### 백엔드 - Render
1. [Render Dashboard](https://dashboard.render.com) 접속
2. 서비스 목록에서 `skin-backend` 확인
3. 배포 상태 확인:
   - ✅ Live: 배포 완료
   - 🔄 Building: 배포 중
   - ❌ Failed: 배포 실패
4. 배포된 URL 확인 (예: `https://skin-backend.onrender.com`)

### 4. 실제 배포 URL 테스트

#### 프론트엔드 테스트
```bash
# Health check
curl https://your-frontend-url.vercel.app

# 또는 브라우저에서 접속
# https://your-frontend-url.vercel.app
```

#### 백엔드 테스트
```bash
# Health check
curl https://your-backend-url.railway.app/health
# 또는
curl https://your-backend-url.onrender.com/health

# 예상 응답:
# {"status":"ok","message":"Backend server is running","timestamp":"..."}
```

### 5. 통합 테스트

1. **프론트엔드 접속**
   - 온보딩 화면이 표시되는지 확인
   - 로그인 페이지가 정상 작동하는지 확인

2. **백엔드 API 테스트**
   - Health check 엔드포인트 호출
   - CORS 설정 확인

3. **전체 플로우 테스트**
   - 회원가입/로그인
   - 이미지 업로드
   - AI 분석 기능

## 🐛 문제 해결

### GitHub Actions 실패
1. **Secrets 확인**
   - Settings > Secrets and variables > Actions
   - 필요한 모든 Secrets가 설정되었는지 확인

2. **워크플로우 로그 확인**
   - Actions 탭 > 실패한 워크플로우 클릭
   - 에러 메시지 확인

### 배포 플랫폼 실패
1. **환경 변수 확인**
   - Vercel: Project Settings > Environment Variables
   - Railway: Variables 탭
   - Render: Environment 탭

2. **빌드 로그 확인**
   - 배포 플랫폼의 로그 탭에서 에러 확인

### CORS 오류
- 백엔드의 `FRONTEND_URL` 환경 변수가 프론트엔드 URL과 일치하는지 확인

### API 연결 오류
- 프론트엔드의 `NEXT_PUBLIC_API_URL`이 백엔드 URL과 일치하는지 확인

