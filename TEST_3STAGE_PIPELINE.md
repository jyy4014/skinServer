# 3단계 파이프라인 테스트 가이드

## 서버 실행 확인

### 1. 백엔드 서버 확인
```bash
cd skinServer
npm run dev
```

**예상 출력:**
```
🚀 Backend server running on http://localhost:3001
📡 Frontend URL: http://localhost:3000
```

### 2. 프론트엔드 서버 확인
```bash
cd skinfront
npm run dev
```

**예상 출력:**
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

## 테스트 시나리오

### 1. Health Check 테스트

**요청:**
```bash
GET http://localhost:3001/health
```

**예상 응답:**
```json
{
  "status": "ok",
  "message": "Backend server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. 3단계 파이프라인 테스트

**요청:**
```bash
POST http://localhost:3001/api/analyze
Content-Type: application/json

{
  "image_url": "https://example.com/skin-image.jpg",
  "user_id": "test-user-id",
  "access_token": "test-token"
}
```

**예상 응답:**
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
    "treatment_candidates": [...],
    "mapping_version": "map-v1",
    "applied_rules": []
  },
  "nlg": {
    "headline": "...",
    "paragraphs": [...],
    "cta": {...}
  },
  "review_needed": false
}
```

## 브라우저 테스트

### 1. 프론트엔드 접속
1. 브라우저에서 `http://localhost:3000` 접속
2. 로그인 또는 회원가입
3. 홈 화면에서 "사진 업로드하기" 클릭
4. 이미지 선택 및 업로드
5. 분석 결과 확인

### 2. 확인 사항
- ✅ 이미지 업로드 성공
- ✅ 3단계 파이프라인 실행 (A → B → C)
- ✅ 분석 결과 표시 (NLG 결과, 상세 분석, 추천 시술)
- ✅ 신뢰도 및 불확실성 표시
- ✅ Review 필요 안내 (조건부)

## 문제 해결

### 1. Google Gemini API 키 오류
**증상:** `GOOGLE_GEMINI_API_KEY is not set` 에러

**해결:**
- `skinServer/.env` 파일에 `GOOGLE_GEMINI_API_KEY` 확인
- API 키가 올바르게 설정되었는지 확인
- 서버 재시작

### 2. 이미지 가져오기 실패
**증상:** `Failed to fetch image` 에러

**해결:**
- 이미지 URL이 공개적으로 접근 가능한지 확인
- CORS 설정 확인
- 이미지 형식 확인 (JPEG, PNG, WebP)

### 3. 파싱 오류
**증상:** `Failed to parse Gemini response` 에러

**해결:**
- 모의 데이터 폴백 확인
- Gemini API 응답 형식 확인
- 로그 확인

## 다음 단계

1. ✅ 서버 실행 확인
2. ✅ Health Check 테스트
3. ✅ 3단계 파이프라인 테스트
4. ✅ 브라우저 테스트
5. ⏳ 실제 이미지 업로드 테스트
6. ⏳ 결과 저장 및 조회 테스트

