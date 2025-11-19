# Gemini API 이미지 입력 방식 분석

## 현재 구현 방식

### 현재 코드 흐름
1. 프론트엔드 → Supabase Storage에 이미지 업로드
2. Supabase Storage → Signed URL 생성
3. Edge Function → Signed URL을 받아서 `fetch()`로 다운로드
4. Edge Function → Base64로 인코딩
5. Edge Function → Gemini API에 Base64 전송

**문제점**:
- 불필요한 다운로드/인코딩 단계
- 네트워크 대역폭 낭비
- 처리 시간 증가

---

## Gemini API 이미지 입력 방식

### 지원하는 방식

#### 1. `inlineData` (Base64) ✅ 현재 사용 중
```json
{
  "parts": [
    {
      "inlineData": {
        "mimeType": "image/jpeg",
        "data": "base64_encoded_string..."
      }
    }
  ]
}
```
- **장점**: 모든 이미지 URL 지원
- **단점**: Base64 인코딩 오버헤드 (약 33% 크기 증가)

#### 2. `fileData` (Google Cloud Storage URI) ❌ 사용 불가
```json
{
  "parts": [
    {
      "fileData": {
        "fileUri": "gs://bucket-name/path/to/image.jpg"
      }
    }
  ]
}
```
- **장점**: 인코딩 불필요, 빠름
- **단점**: **Google Cloud Storage에만 가능** (Supabase Storage는 불가능)

#### 3. 외부 URL 직접 지원 ❌ 지원 안 함
- Gemini API는 외부 URL을 직접 지원하지 않습니다
- 반드시 `inlineData` 또는 `fileData` 형식이어야 합니다

---

## 개선 방안

### 옵션 1: 현재 방식 유지 (권장) ✅
**이유**:
- Supabase Storage를 사용 중이므로 `fileData` 사용 불가
- Gemini API는 외부 URL 직접 지원 안 함
- 현재 방식이 유일한 선택지

**최적화 가능한 부분**:
- 이미지 리사이즈 (클라이언트 또는 Edge Function)
- WebP 변환으로 크기 감소
- 캐싱 (같은 이미지 재분석 시)

### 옵션 2: Google Cloud Storage로 마이그레이션 (비현실적)
- Supabase Storage → GCS로 변경 필요
- 인프라 변경 비용 큼
- 현재로서는 비추천

### 옵션 3: 이미지 프록시 서버 (복잡함)
- Edge Function에서 이미지를 다운로드하지 않고
- Gemini API가 직접 접근할 수 있는 공개 URL 생성
- 하지만 Gemini API는 외부 URL을 지원하지 않으므로 **불가능**

---

## 결론

### ❌ URL로 직접 전송 불가능
Gemini API는 외부 URL을 직접 지원하지 않습니다.

### ✅ 현재 방식이 최선
1. Supabase Storage 사용 중
2. Gemini API는 Base64 또는 GCS만 지원
3. 따라서 Base64 인코딩이 필수

### 🚀 최적화 방안
Base64 인코딩은 필수이지만, **이미지 크기를 줄여서** 인코딩 오버헤드를 최소화할 수 있습니다:

1. **클라이언트 사이드 리사이즈**
   - 업로드 전에 이미지 리사이즈 (예: 최대 1024px)
   - WebP 변환으로 크기 감소

2. **Edge Function에서 리사이즈**
   - 다운로드 후 리사이즈 후 Base64 인코딩
   - Sharp 라이브러리 사용 (Deno 지원 확인 필요)

3. **캐싱**
   - 같은 이미지 재분석 시 캐시된 결과 사용

---

## 권장 사항

**현재 방식 유지 + 클라이언트 사이드 최적화**

1. 프론트엔드에서 이미지 리사이즈 (1024px 이하)
2. WebP 변환 (선택사항)
3. Edge Function에서 Base64 인코딩 (현재 방식 유지)

이렇게 하면:
- Base64 인코딩 오버헤드 최소화
- 네트워크 전송 시간 단축
- Gemini API 처리 시간 단축

---

## 참고: 다른 Vision API 비교

| API | URL 지원 | Base64 지원 | GCS 지원 |
|-----|----------|-------------|----------|
| Gemini | ❌ | ✅ | ✅ |
| OpenAI Vision | ❌ | ✅ | ❌ |
| Replicate | ✅ | ✅ | ❌ |
| HuggingFace | ✅ | ✅ | ❌ |

**결론**: 대부분의 Vision API는 Base64 인코딩을 요구합니다.

