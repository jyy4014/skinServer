# 피부 분석 앱 - AI 기반 시술 추천 MVP

AI가 분석하는 당신의 피부, 맞춤형 시술을 추천받는 웹 애플리케이션입니다.

## 🎯 프로젝트 개요

사용자의 피부 사진을 분석하여 적합한 피부 시술(예: 레이저, 필링 등)을 추천하는 AI 기반 MVP 앱입니다.  
의료 진단이 아닌 **뷰티 컨설팅 및 참고용 보조 도구**로 작동합니다.

## 📁 프로젝트 구조

```
skin-cursor/
├── skinfront/          # 프론트엔드 (Next.js)
│   ├── app/            # Next.js 앱 라우트
│   ├── lib/            # 유틸리티 및 Supabase 클라이언트
│   ├── public/         # 정적 파일
│   └── package.json
├── skinServer/         # 백엔드 서버 (Express.js) - 유일한 백엔드 폴더
│   ├── src/
│   │   ├── routes/     # API 라우트
│   │   ├── services/   # 비즈니스 로직
│   │   └── config/     # 설정
│   └── package.json
├── supabase/           # DB 마이그레이션 (공통)
│   └── migrations/     # Supabase SQL 마이그레이션 파일
│       ├── 001_initial_schema.sql
│       └── 002_storage_and_triggers.sql
└── package.json        # 통합 실행 스크립트
```

## ⚙️ 기술 스택

### 프론트엔드
- **Framework**: Next.js 16 (React 19, TypeScript)
- **스타일링**: Tailwind CSS
- **애니메이션**: Framer Motion
- **아이콘**: Lucide React

### 백엔드
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: Supabase

### 인프라
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Auth**: Supabase Auth
- **AI 모델**: OpenAI / Replicate (향후 연동)

## 🚀 시작하기

### 1. 전체 시스템 실행 (프론트엔드 + 백엔드)

```bash
# 루트 디렉토리에서
npm run dev:all
```

이 명령어는 프론트엔드(포트 3000)와 백엔드(포트 3001)를 동시에 실행합니다.

### 2. 개별 실행

#### 프론트엔드만 실행
```bash
cd skinfront
npm install
npm run dev
```
프론트엔드가 `http://localhost:3000`에서 실행됩니다.

#### 백엔드만 실행
```bash
cd skinServer
npm install
npm run dev
```
백엔드가 `http://localhost:3001`에서 실행됩니다.

### 3. 환경 변수 설정

#### 프론트엔드 (`skinfront/.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### 백엔드 (`skinServer/.env`)
```env
PORT=3001
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
FRONTEND_URL=http://localhost:3000
```

### 4. Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트를 생성하세요.
2. SQL Editor에서 `supabase/migrations/001_initial_schema.sql` 파일의 내용을 실행하세요.
3. SQL Editor에서 `supabase/migrations/002_storage_and_triggers.sql` 파일의 내용을 실행하세요.

## 🧩 주요 기능

1. **회원가입 및 로그인**
   - 이메일/비밀번호 인증
   - Google 소셜 로그인

2. **피부 사진 업로드 및 분석**
   - 이미지 업로드 (Supabase Storage)
   - AI 기반 피부 상태 분석 (백엔드 API)
   - 분석 결과 요약 및 추천 시술 제시

3. **시술 정보 제공**
   - 각 시술의 효과, 비용, 소요 시간, 회복 기간 등

4. **피부 상태 이력 관리**
   - 과거 분석 기록 조회
   - 분석 결과 상세 보기

5. **마이페이지**
   - 프로필 정보
   - 분석 기록 목록

## 📡 API 엔드포인트

### 백엔드 API

- `GET /health` - 서버 상태 확인
- `POST /api/analyze` - 피부 이미지 분석
- `POST /api/analyze/save` - 분석 결과 저장
- `GET /api/auth/user` - 사용자 정보 조회

자세한 내용은 `skinServer/README.md`를 참고하세요.

## 🗄️ 데이터베이스 스키마

### users
- id (UUID)
- email (TEXT)
- name (TEXT)
- birth_date (DATE)
- gender (TEXT)

### skin_analysis
- id (UUID)
- user_id (UUID)
- image_url (TEXT)
- result_summary (TEXT)
- analysis_data (JSONB)
- recommended_treatments (JSONB)

### treatments
- id (UUID)
- name (TEXT)
- description (TEXT)
- benefits (TEXT)
- cost (NUMERIC)
- recovery_time (TEXT)
- risk_level (TEXT)

## 🔒 보안 및 정책

- **의료 진단 아님**: 본 서비스는 의료 진단이 아닌 뷰티 컨설팅 참고용 도구입니다.
- **개인정보 보호**: 사진은 암호화 저장되며, 사용자가 삭제할 수 있습니다.
- **Row Level Security**: Supabase RLS를 통해 사용자별 데이터 접근을 제한합니다.
- **CORS**: 백엔드 서버에서 프론트엔드 도메인만 허용합니다.

## 🚀 배포

### 프론트엔드 (Vercel)

1. GitHub에 `skinfront` 폴더를 푸시하세요.
2. [Vercel](https://vercel.com)에서 프로젝트를 import하세요.
3. 환경 변수를 설정하세요.
4. 배포가 완료되면 자동으로 URL이 생성됩니다.

### 백엔드 (Railway / Render / AWS)

1. GitHub에 `skinServer` 폴더를 푸시하세요.
2. Railway, Render, 또는 AWS에 배포하세요.
3. 환경 변수를 설정하세요.
4. 프론트엔드의 `NEXT_PUBLIC_API_URL`을 백엔드 URL로 업데이트하세요.

## 📝 향후 확장 계획

- [ ] 실제 AI 모델 연동 (OpenAI Vision API / Replicate)
- [ ] 피부 개선 추이 시각화 (그래프)
- [ ] 피부 타입별 맞춤 루틴 추천
- [ ] 병원 예약 연동 기능
- [ ] AI 시술 후기 요약 시스템
- [ ] 모바일 앱 (React Native)

## 📄 라이선스

MIT
