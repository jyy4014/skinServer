# 🚀 배포 가이드

## 📋 개요

이 프로젝트는 **프론트엔드**와 **백엔드**가 **독립적으로 배포**되는 구조입니다.

- **프론트엔드**: Next.js → Vercel 배포
- **백엔드**: Supabase Edge Functions → Supabase 배포
- **데이터베이스**: Supabase (공통)

---

## 🏗 아키텍처

```
┌─────────────────┐         ┌──────────────────┐
│   프론트엔드     │────────▶│   Supabase       │
│   (Vercel)      │  API    │   Edge Functions │
│   Next.js       │  호출   │   (백엔드)        │
└─────────────────┘         └──────────────────┘
                                      │
                                      ▼
                            ┌──────────────────┐
                            │   Supabase DB    │
                            │   (PostgreSQL)   │
                            └──────────────────┘
```

---

## 📦 배포 구조

### 1. 프론트엔드 (`skinfront/`)

**배포 플랫폼**: Vercel

**디렉토리 구조**:
```
skinfront/
├── app/              # Next.js 앱 라우트
├── lib/              # 클라이언트 라이브러리
├── components/        # UI 컴포넌트
├── public/           # 정적 파일
├── package.json
└── next.config.ts
```

**환경 변수** (`.env.local` 또는 Vercel 환경 변수):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=https://your-project.supabase.co/functions/v1
```

**배포 명령어**:
```bash
cd skinfront
npm run build
# Vercel CLI 또는 GitHub 연동으로 자동 배포
```

---

### 2. 백엔드 (`supabase/functions/`)

**배포 플랫폼**: Supabase Edge Functions

**디렉토리 구조**:
```
supabase/
├── functions/
│   ├── analyze/              # 분석 API
│   │   └── index.ts
│   ├── update-trends/        # 트렌드 업데이트 API
│   │   └── index.ts
│   └── _shared/              # 공유 모듈
│       ├── orchestrator.ts
│       ├── stageA-vision.ts
│       ├── stageB-mapping.ts
│       └── stageC-nlg.ts
├── migrations/               # DB 마이그레이션
└── config.toml
```

**환경 변수** (Supabase Secrets):
```bash
# Supabase 대시보드에서 설정
GOOGLE_GEMINI_API_KEY=your-api-key
```

**배포 명령어**:
```bash
# Supabase CLI 사용
supabase functions deploy analyze
supabase functions deploy update-trends

# 또는 Supabase 대시보드에서 직접 배포
```

---

### 3. 데이터베이스 (`supabase/migrations/`)

**배포 플랫폼**: Supabase

**마이그레이션 적용**:
```bash
supabase db push
```

---

## 🔄 배포 워크플로우

### 개발 환경

```bash
# 1. 프론트엔드 개발 서버 실행
cd skinfront
npm run dev

# 2. 백엔드 로컬 테스트 (선택사항)
supabase functions serve analyze

# 3. 데이터베이스 마이그레이션 (로컬)
supabase db reset
```

### 프로덕션 배포

#### Step 1: 데이터베이스 마이그레이션
```bash
# Supabase 프로젝트에 마이그레이션 적용
supabase db push
```

#### Step 2: 백엔드 배포
```bash
# Edge Functions 배포
supabase functions deploy analyze
supabase functions deploy update-trends

# 환경 변수 설정 확인
supabase secrets list
```

#### Step 3: 프론트엔드 배포
```bash
# Vercel CLI 사용
cd skinfront
vercel --prod

# 또는 GitHub 연동 시 자동 배포
git push origin main
```

---

## 🔐 환경 변수 관리

### 프론트엔드 (Vercel)

**Vercel 대시보드** → 프로젝트 설정 → Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_URL`

### 백엔드 (Supabase)

**Supabase 대시보드** → Edge Functions → Secrets:
- `GOOGLE_GEMINI_API_KEY`

**CLI로 설정**:
```bash
supabase secrets set GOOGLE_GEMINI_API_KEY=your-key
```

---

## 🧪 배포 전 체크리스트

### 프론트엔드
- [ ] `npm run build` 성공 확인
- [ ] 환경 변수 설정 확인
- [ ] API 엔드포인트 URL 확인
- [ ] 정적 파일 경로 확인

### 백엔드
- [ ] Edge Functions 배포 성공 확인
- [ ] 환경 변수(Secrets) 설정 확인
- [ ] API 엔드포인트 테스트
- [ ] CORS 설정 확인

### 데이터베이스
- [ ] 마이그레이션 적용 확인
- [ ] RLS 정책 확인
- [ ] Storage 버킷 설정 확인

---

## 🔗 API 엔드포인트

### 프론트엔드에서 백엔드 호출

```typescript
// lib/api/edge-functions.ts
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const API_URL = `${SUPABASE_URL}/functions/v1`

// 분석 API 호출
fetch(`${API_URL}/analyze`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ image_url, user_id }),
})
```

---

## 🚨 주의사항

### 1. 독립 배포
- 프론트엔드와 백엔드는 **완전히 독립적으로 배포**됩니다
- 한쪽을 배포해도 다른 쪽에 영향 없음
- API 호환성 유지 필요

### 2. 환경 변수 분리
- 프론트엔드: `NEXT_PUBLIC_*` 접두사 필수
- 백엔드: Supabase Secrets 사용
- **절대 공유하지 않음**

### 3. CORS 설정
- Supabase Edge Functions는 기본적으로 CORS 허용
- 필요시 `cors` 헤더 추가

### 4. 버전 관리
- 프론트엔드와 백엔드의 API 버전 호환성 확인
- Breaking change 시 양쪽 동시 배포 필요

---

## 📊 모니터링

### 프론트엔드 (Vercel)
- Vercel 대시보드에서 로그 확인
- Analytics 및 성능 모니터링

### 백엔드 (Supabase)
- Supabase 대시보드 → Edge Functions → Logs
- 함수 실행 시간 및 에러 로그 확인

---

## 🔄 CI/CD 파이프라인 (향후)

### GitHub Actions 예시

#### 프론트엔드 배포
```yaml
# .github/workflows/deploy-frontend.yml
name: Deploy Frontend
on:
  push:
    branches: [main]
    paths:
      - 'skinfront/**'
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./skinfront
```

#### 백엔드 배포
```yaml
# .github/workflows/deploy-backend.yml
name: Deploy Backend
on:
  push:
    branches: [main]
    paths:
      - 'supabase/functions/**'
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: supabase/setup-cli@v1
      - run: supabase functions deploy analyze
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

---

## 📝 배포 로그

배포 시 다음 정보를 기록하세요:
- 배포 날짜/시간
- 배포된 버전/커밋 해시
- 변경 사항 요약
- 문제 발생 시 롤백 계획




