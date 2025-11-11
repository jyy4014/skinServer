# 다음 단계 가이드

## 현재 완료된 작업 ✅

1. **프로젝트 구조**
   - 프론트엔드 (`skinfront/`)와 백엔드 (`skinServer/`) 분리 완료
   - Supabase 데이터베이스 설정 완료
   - 환경 변수 설정 완료

2. **기본 기능 구현**
   - 온보딩 페이지 (3단계 스와이프)
   - 로그인/회원가입 (비밀번호 방식 기본, 인증코드 방식 선택)
   - 홈 페이지 (DB에서 시술 목록 조회)
   - 피부 분석 페이지
   - 분석 결과 상세 페이지
   - 시술 상세 페이지
   - 프로필 페이지

3. **법적 면책 문구 적용**
   - 모든 페이지에 법적 면책 문구 추가
   - 개인정보 처리 안내 추가
   - AI 결과 표시 시 권장 문구 추가

4. **에러 처리**
   - 회원가입/로그인 에러 처리 개선
   - API 에러 처리 미들웨어 구현
   - 유효성 검사 미들웨어 구현

## 새로운 아키텍처 요구사항 (룰즈 추가됨) 🆕

### 3단계 멀티-AI 파이프라인

1. **단계 A (Vision AI)**: 사진 분석
   - 입력: `storage_path`, `user_id`, `meta`
   - 출력: `skin_condition_scores`, `masks`, `metrics`, `confidence`, `uncertainty_estimate`, `heatmap_url`
   - 목적: 피부 문제 탐지 + 정량화 + 마스크/좌표

2. **단계 B (Mapping AI)**: 문제 → 시술 매핑
   - 입력: `skin_condition_scores`, `metrics`, `user_profile`
   - 출력: `treatment_candidates` (id, name, score, expected_improvement_pct, notes)
   - 목적: 개선 가능한 시술 목록 산출 + 예상 효과

3. **단계 C (NLG AI)**: 사용자 친화 문구 생성
   - 입력: `skin_summary`, `treatment_candidates`, `confidence`, `uncertainty`
   - 출력: `headline`, `paragraphs[]`, `cta`
   - 목적: 법적으로 안전한 설명 문장 생성

## 다음 단계 제안

### 1. 3단계 파이프라인 구조 리팩토링 (우선순위: 높음) 🔴

#### 1.1 단계 A (Vision AI) 구현
- [ ] 표준화된 출력 형식 정의
  - `skin_condition_scores` (pigmentation, acne, redness, pores, wrinkles)
  - `masks` (x, y, w, h 좌표)
  - `metrics` (area_pct_by_label, color_deltaE)
  - `confidence`, `uncertainty_estimate`
  - `heatmap_url` (선택사항)
- [ ] 이미지 품질 검증 (Laplacian blur check)
- [ ] 신뢰도 기반 검증 로직 (confidence < 0.3 or uncertainty > 0.5 → review queue)
- [ ] 현재 모의 데이터를 단계 A 형식으로 변환

#### 1.2 단계 B (Mapping AI) 구현
- [ ] Rule engine 구현 (안전성/금기 필터)
- [ ] 통계 기반 가중치 시스템 (또는 간단한 ML)
- [ ] 표준화된 출력 형식 정의
  - `treatment_candidates` 배열
  - `mapping_version`
  - `applied_rules`
- [ ] 안전성 검증 로직 (high-risk flags → needs-medical-clearance)
- [ ] 낮은 심각도 케이스 처리 (빈 리스트 반환)

#### 1.3 단계 C (NLG AI) 구현
- [ ] LLM 프롬프트 템플릿 구현
- [ ] 금지어 리스트 적용 ("diagnose", "prescribe" 등)
- [ ] 표준화된 출력 형식 정의
  - `headline`
  - `paragraphs[]`
  - `cta` (label, url)
- [ ] 불확실성 기반 안내 문구 추가 (uncertainty > 0.4)

#### 1.4 오케스트레이터 구현
- [ ] Edge Function 또는 Express 라우트로 오케스트레이터 구현
- [ ] 순차 호출: A → B → C
- [ ] DB 저장 (analysis_results 테이블에 전체 payload 저장)
- [ ] Review queue 로직 (uncertainty > threshold)
- [ ] 페일오버 전략 구현

### 2. 데이터베이스 스키마 업데이트 (우선순위: 높음) 🔴

- [ ] `skin_analysis` 테이블에 새 필드 추가
  - `analysis_a` (JSONB) - 단계 A 결과
  - `analysis_b` (JSONB) - 단계 B 결과
  - `analysis_c` (JSONB) - 단계 C 결과
  - `confidence` (NUMERIC)
  - `uncertainty_estimate` (NUMERIC)
  - `review_needed` (BOOLEAN)
  - `model_version` (TEXT)
  - `mapping_version` (TEXT)
  - `nlg_prompt_version` (TEXT)
- [ ] `review_queue` 테이블 생성 (선택사항)
- [ ] 마이그레이션 파일 생성

### 3. 실제 AI 모델 연동 (우선순위: 중간) 🟡

#### 3.1 단계 A (Vision AI) 연동
- [ ] OpenAI Vision API 연동
- [ ] 또는 Replicate 피부 분석 모델 연동
- [ ] 또는 HuggingFace 모델 연동
- [ ] 이미지 품질 검증 로직 추가

#### 3.2 단계 C (NLG AI) 연동
- [ ] OpenAI GPT API 연동
- [ ] Anthropic Claude API 연동 (선택사항)
- [ ] 프롬프트 템플릿 최적화

### 4. 페일오버 전략 구현 (우선순위: 중간) 🟡

- [ ] Vision API 다운 시 로컬 경량 휴리스틱 실행
- [ ] LLM 다운 시 정적 템플릿 문구 사용
- [ ] 에러 로깅 및 재시도 로직

### 5. 모니터링 및 A/B 테스트 (우선순위: 낮음) 🟢

- [ ] 모델별 메트릭 추적 (accuracy, confidence distribution)
- [ ] 사용자 전환 추적 (CTA 클릭 → 상담 예약)
- [ ] A/B 테스트 프레임워크 (mapping weight tables, NLG tones)
- [ ] Drift detection (skin-tone distribution)

### 6. 사용자 경험 개선 (우선순위: 중간) 🟡

- [ ] 로딩 상태 표시 개선 (스켈레톤 UI)
- [ ] 에러 메시지 개선
- [ ] 성공 메시지 추가
- [ ] 이미지 업로드 진행률 표시
- [ ] Heatmap 시각화 (단계 A 결과)

## 권장 진행 순서

### Phase 1: 구조 리팩토링 (1-2주)
1. **단계 A, B, C 서비스 분리**
   - 각 단계별 독립 서비스/함수로 분리
   - 표준화된 입출력 인터페이스 정의
   - 현재 모의 데이터를 새 형식으로 변환

2. **오케스트레이터 구현**
   - Express 라우트에서 순차 호출
   - 에러 처리 및 페일오버 로직

3. **데이터베이스 스키마 업데이트**
   - 새 필드 추가
   - 마이그레이션 적용

### Phase 2: 실제 AI 연동 (1-2주)
1. **단계 A (Vision AI) 연동**
   - OpenAI Vision API 또는 Replicate 연동
   - 이미지 품질 검증

2. **단계 C (NLG AI) 연동**
   - OpenAI GPT API 연동
   - 프롬프트 최적화

### Phase 3: 고도화 (1주)
1. **페일오버 전략**
2. **모니터링 및 A/B 테스트**
3. **사용자 경험 개선**

## 즉시 진행 가능한 작업

### 1. 단계 A, B, C 서비스 분리
```typescript
// skinServer/src/services/stageA-vision.ts
export async function analyzeVision(imageUrl: string): Promise<VisionAnalysis>

// skinServer/src/services/stageB-mapping.ts
export async function mapToTreatments(visionResult: VisionAnalysis): Promise<MappingResult>

// skinServer/src/services/stageC-nlg.ts
export async function generateUserText(mappingResult: MappingResult): Promise<NLGResult>
```

### 2. 오케스트레이터 구현
```typescript
// skinServer/src/routes/analyze.ts
router.post('/', async (req, res) => {
  // 1. 단계 A 호출
  const visionResult = await analyzeVision(imageUrl)
  
  // 2. 단계 B 호출
  const mappingResult = await mapToTreatments(visionResult)
  
  // 3. 단계 C 호출
  const nlgResult = await generateUserText(mappingResult)
  
  // 4. DB 저장
  // 5. 응답 반환
})
```

## 현재 상태 요약

- ✅ 기본 기능 구현 완료
- ✅ 법적 면책 문구 적용 완료
- ✅ 에러 처리 개선 완료
- ⚠️ **3단계 파이프라인 구조로 리팩토링 필요** (새로운 룰즈 요구사항)
- ⚠️ 실제 AI 모델 연동 필요
- ⚠️ 페일오버 전략 구현 필요
