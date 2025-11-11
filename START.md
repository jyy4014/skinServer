# 시작 가이드

## 🚀 빠른 시작

### 1. 전체 시스템 실행 (프론트엔드 + 백엔드)

```bash
# 루트 디렉토리에서
npm run dev:all
```

이 명령어는 프론트엔드(포트 3000)와 백엔드(포트 3001)를 동시에 실행합니다.

### 2. 개별 실행

#### 프론트엔드만 실행
```bash
npm run dev
```
프론트엔드가 `http://localhost:3000`에서 실행됩니다.

#### 백엔드만 실행
```bash
cd backend
npm run dev
```
백엔드가 `http://localhost:3001`에서 실행됩니다.

## 📋 사전 요구사항

### 환경 변수 설정

#### 프론트엔드 (`.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### 백엔드 (`backend/.env`)
```env
PORT=3001
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
FRONTEND_URL=http://localhost:3000
```

## 🧪 테스트

### 1. 백엔드 Health Check
```bash
curl http://localhost:3001/health
```

### 2. 프론트엔드 접속
브라우저에서 `http://localhost:3000` 접속

## 📝 개발 워크플로우

1. **백엔드 서버 시작** (포트 3001)
2. **프론트엔드 서버 시작** (포트 3000)
3. **브라우저에서 테스트**

## 🔧 문제 해결

### 백엔드 서버가 시작되지 않는 경우
- `backend/.env` 파일이 올바르게 설정되었는지 확인
- 포트 3001이 사용 중인지 확인

### 프론트엔드가 백엔드에 연결되지 않는 경우
- `.env.local`의 `NEXT_PUBLIC_API_URL`이 올바른지 확인
- 백엔드 서버가 실행 중인지 확인

### CORS 오류가 발생하는 경우
- `backend/.env`의 `FRONTEND_URL`이 올바른지 확인
- 백엔드 서버를 재시작

