# 피부 분석 앱 - Supabase Edge Functions 백엔드

이 저장소는 Supabase Edge Functions를 사용한 백엔드 서버입니다.  
기존 Express.js 서버(`skinServer`)를 Supabase Edge Functions로 완전히 대체했습니다.

## 🏗 아키텍처

### 3단계 AI 파이프라인

1. **Vision AI (Stage A)** - 피부 이미지 분석
   - Google Gemini API 사용
   - 피부 상태 점수 계산 (pigmentation, acne, redness, pores, wrinkles)
   - 얼굴 감지 및 품질 검사

2. **Mapping AI (Stage B)** - 시술 추천 매핑
   - 피부 상태 점수를 시술 후보로 변환
   - 안전성 규칙 적용
   - 예상 개선률 계산

3. **NLG AI (Stage C)** - 사용자 친화적 텍스트 생성
   - Google Gemini API 사용
   - 비의료적 문구 생성
   - 법적 면책 문구 포함

## 📁 프로젝트 구조

```
supabase/
├── functions/
│   ├── analyze/              # 분석 Edge Function
│   │   └── index.ts
│   ├── update-trends/        # 트렌드 업데이트 Edge Function
│   │   └── index.ts
│   └── _shared/              # 공유 모듈
│       ├── orchestrator.ts   # 파이프라인 오케스트레이션
│       ├── stageA-vision.ts # Vision AI
│       ├── stageB-mapping.ts # Mapping AI
│       ├── stageC-nlg.ts    # NLG AI
│       └── utils/            # 유틸리티
│           ├── base64.ts
│           └── image-validation.ts
├── migrations/               # 데이터베이스 마이그레이션
│   ├── 001_initial_schema.sql
│   ├── 002_storage_and_triggers.sql
│   └── 003_add_trend_scores.sql
└── config.toml              # Supabase 설정
```

## 🚀 시작하기

### 1. Supabase CLI 설치

```bash
npm install -g supabase
```

### 2. 환경 변수 설정

Supabase 프로젝트에서 다음 시크릿을 설정하세요:

- `GOOGLE_GEMINI_API_KEY` - Google Gemini API 키

### 3. Edge Functions 배포

```bash
supabase functions deploy analyze
supabase functions deploy update-trends
```

### 4. 마이그레이션 적용

```bash
supabase db push
```

## 📡 API 엔드포인트

### 분석 API

**POST** `/functions/v1/analyze`

요청:
```json
{
  "image_url": "https://...",
  "user_id": "uuid",
  "access_token": "jwt_token"
}
```

응답:
```json
{
  "status": "success",
  "result_id": "uuid",
  "analysis": { ... },
  "mapping": { ... },
  "nlg": { ... },
  "review_needed": false
}
```

## 🛠 기술 스택

- **Runtime**: Deno
- **Framework**: Supabase Edge Functions
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini API
- **Storage**: Supabase Storage

## 📝 마이그레이션 노트

이 저장소는 기존 Express.js 서버(`skinServer`)를 대체합니다:
- ✅ Express.js 서버 제거
- ✅ Supabase Edge Functions로 전환
- ✅ 서버리스 아키텍처
- ✅ 자동 스케일링
- ✅ 더 낮은 운영 비용

## 🔗 관련 저장소

- **프런트엔드**: [skinfront](https://github.com/jyy4014/skinfront)
- **메인 저장소**: [skin-cursor](https://github.com/jyy4014/skin-cursor)
