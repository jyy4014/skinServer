# 3단계 파이프라인 구현 가이드

## 완료된 작업 ✅

1. **단계 A (Vision AI)**: Google Gemini 1.5 Pro 연동
2. **단계 B (Mapping AI)**: 규칙 엔진 구현
3. **단계 C (NLG AI)**: Google Gemini 1.5 Flash 연동
4. **오케스트레이터**: 3단계 파이프라인 순차 호출
5. **프론트엔드 업데이트**: 새로운 결과 형식 처리

## 환경 변수 설정

### 백엔드 (`skinServer/.env`)

```env
# 서버 포트
PORT=3001

# Supabase 설정
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# 프론트엔드 URL
FRONTEND_URL=http://localhost:3000

# Google Gemini API 키 (필수)
GOOGLE_GEMINI_API_KEY=your_google_gemini_api_key
```

### Google Gemini API 키 발급 방법

1. **[Google AI Studio](https://aistudio.google.com/)** 접속
2. Google 계정으로 로그인
3. 우측 상단의 **"Get API Key"** 또는 **"API Keys"** 클릭
4. **"Create API Key"** 클릭
5. 프로젝트 선택 (새 프로젝트 생성 가능)
6. 생성된 API 키 복사
7. `skinServer/.env` 파일에 `GOOGLE_GEMINI_API_KEY=your_api_key_here`로 설정

**직접 링크:**
- [Google AI Studio - API Keys](https://aistudio.google.com/app/apikey)
- [Google AI Studio 메인](https://aistudio.google.com/)

## 실행 방법

### 1. 백엔드 서버 실행

```bash
cd skinServer
npm install
npm run dev
```

### 2. 프론트엔드 실행

```bash
cd skinfront
npm install
npm run dev
```

### 3. 동시 실행

```bash
npm run dev:all
```

## API 엔드포인트

### POST `/api/analyze`

**요청:**
```json
{
  "image_url": "https://...",
  "user_id": "uuid",
  "access_token": "token",
  "user_profile": {
    "age": 32,
    "skin_tone": "Fitzpatrick III"
  },
  "meta": {
    "camera": "iPhone12",
    "orientation": 0
  }
}
```

**응답:**
```json
{
  "status": "success",
  "result_id": "result_xxx",
  "analysis": {
    "skin_condition_scores": {
      "pigmentation": 0.72,
      "acne": 0.12,
      "redness": 0.08,
      "pores": 0.45,
      "wrinkles": 0.05
    },
    "masks": [...],
    "metrics": {...},
    "confidence": 0.84,
    "uncertainty_estimate": 0.16,
    "model_version": "vision-v1-gemini-1.5-pro"
  },
  "mapping": {
    "treatment_candidates": [
      {
        "id": "laser_toning",
        "name": "토닝 레이저",
        "score": 0.62,
        "expected_improvement_pct": 0.25,
        "notes": ["표면 색소 개선에 자주 사용됩니다"]
      }
    ],
    "mapping_version": "map-v1",
    "applied_rules": []
  },
  "nlg": {
    "headline": "색소 침착이 확인됩니다 — 참고용 안내",
    "paragraphs": [
      "이미지 분석 결과, 색소 침착이 상대적으로 뚜렷하게 나타났습니다. (신뢰도 84%)",
      "비교적 자주 선택되는 옵션: 토닝 레이저 — 표면 색소 개선에 자주 사용됩니다.",
      "본 설명은 의료 진단이 아니며, 시술 전 전문의 상담을 권장합니다."
    ],
    "cta": {
      "label": "전문가 상담 요청",
      "url": "/consult"
    }
  },
  "review_needed": false
}
```

## 비용 예상

### 월 1,000건 기준

- **단계 A (Vision)**: Google Gemini 1.5 Pro - 약 $10-20
- **단계 B (Mapping)**: 규칙 엔진 - $0 (무료)
- **단계 C (NLG)**: Google Gemini 1.5 Flash - 약 $0.1-0.3

**총 비용**: 약 **$10-20/월**

## 다음 단계

1. **데이터베이스 스키마 업데이트** (선택사항)
   - `skin_analysis` 테이블에 새 필드 추가
   - `analysis_a`, `analysis_b`, `analysis_c` (JSONB)
   - `confidence`, `uncertainty_estimate`, `review_needed`

2. **테스트**
   - 실제 이미지 업로드 테스트
   - 3단계 파이프라인 전체 플로우 테스트
   - 에러 처리 테스트

3. **최적화**
   - 프롬프트 최적화
   - 캐싱 전략 구현
   - 페일오버 전략 개선

## 문제 해결

### Google Gemini API 키 오류

- API 키가 올바르게 설정되었는지 확인
- API 키 권한 확인
- 할당량 확인

### 이미지 가져오기 실패

- 이미지 URL이 공개적으로 접근 가능한지 확인
- CORS 설정 확인
- 이미지 형식 확인 (JPEG, PNG, WebP)

### 파싱 오류

- Gemini 응답 형식 확인
- JSON 파싱 로직 확인
- 모의 데이터 폴백 확인

