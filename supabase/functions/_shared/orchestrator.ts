// 오케스트레이터: 3단계 파이프라인 순차 호출
// A → B → C

import { analyzeVision, VisionAnalysis } from "./stageA-vision.ts"
import { mapToTreatments, MappingResult, UserProfile } from "./stageB-mapping.ts"
import { generateUserText, NLGResult } from "./stageC-nlg.ts"

export interface OrchestrationResult {
  result_id: string
  analysis: VisionAnalysis
  mapping: MappingResult
  nlg: NLGResult
  review_needed: boolean
  heatmap_signed_url?: string
  // 각 단계별 메타데이터
  stage_metadata: {
    stage_a: {
      duration_ms: number
      error?: string
      model_version?: string
    }
    stage_b: {
      duration_ms: number
      error?: string
      mapping_version?: string
    }
    stage_c: {
      duration_ms: number
      error?: string
      nlg_version?: string
    }
  }
}

export interface OrchestrationInput {
  image_url: string
  user_id: string
  user_profile?: UserProfile
  meta?: { camera?: string; orientation?: number }
}

export async function orchestrateAnalysis(
  input: OrchestrationInput
): Promise<OrchestrationResult> {
  const { image_url, user_id, user_profile = {}, meta } = input

  const stageMetadata = {
    stage_a: { duration_ms: 0, error: undefined as string | undefined, model_version: undefined as string | undefined },
    stage_b: { duration_ms: 0, error: undefined as string | undefined, mapping_version: undefined as string | undefined },
    stage_c: { duration_ms: 0, error: undefined as string | undefined, nlg_version: undefined as string | undefined },
  }

  let visionResult: VisionAnalysis | null = null
  let mappingResult: MappingResult | null = null
  let nlgResult: NLGResult | null = null

  try {
    // 단계 A: Vision AI 분석
    console.log("Step A: Starting vision analysis...")
    const stageAStart = Date.now()
         try {
             visionResult = await analyzeVision(image_url, user_id, meta)
             stageMetadata.stage_a.duration_ms = Date.now() - stageAStart
             stageMetadata.stage_a.model_version = visionResult.model_version || "unknown"
             console.log(`Step A: Completed in ${stageMetadata.stage_a.duration_ms}ms`)
             console.log(`Step A: Confidence = ${(visionResult.confidence * 100).toFixed(1)}%`)
           } catch (error: any) {
             stageMetadata.stage_a.duration_ms = Date.now() - stageAStart
             stageMetadata.stage_a.error = error.message || String(error)
             console.error("Step A: Error:", error)
             // Vision 실패 시 전체 중단 (에러 전파)
             throw new Error(`피부 이미지 분석 실패: ${error.message || String(error)}`)
           }

    // Confidence 체크: 70% 이하이면 사진 촬영 가이드 템플릿 반환
    const confidenceThreshold = 0.7
    if (visionResult && visionResult.confidence < confidenceThreshold) {
      console.log(`Confidence ${(visionResult.confidence * 100).toFixed(1)}% is below threshold ${(confidenceThreshold * 100)}%. Returning photo guide template.`)
      
      // 빈 Mapping 결과 생성
      mappingResult = {
        treatment_candidates: [],
        mapping_version: "map-v1-skipped",
        applied_rules: [],
        needs_medical_clearance: false,
      }
      stageMetadata.stage_b.duration_ms = 0
      stageMetadata.stage_b.mapping_version = "skipped"

      // 사진 촬영 가이드 템플릿 생성
      const confidencePercent = Math.round(visionResult.confidence * 100)
      nlgResult = {
        headline: "사진 품질 개선이 필요합니다",
        paragraphs: [
          `현재 사진의 분석 정확도가 ${confidencePercent}%로 정확한 분석을 위해 사진 품질을 개선해주세요.`,
          "다음 가이드를 따라 다시 촬영해주세요:",
          "• 밝은 자연광 또는 충분한 조명 환경에서 촬영",
          "• 얼굴이 화면 중앙에 위치하도록 정면 촬영",
          "• 화장을 지우고 깨끗한 얼굴 상태로 촬영",
          "• 카메라와 얼굴 사이 거리는 30-50cm 유지",
          "• 초점이 선명하게 맞춰진 상태로 촬영",
          "• 그림자나 반사가 얼굴에 생기지 않도록 주의",
        ],
        cta: {
          label: "다시 촬영하기",
          url: "/analyze",
        },
        nlg_version: "nlg-v1-photo-guide-template",
      }
      stageMetadata.stage_c.duration_ms = 0
      stageMetadata.stage_c.nlg_version = "template"
    } else {
      // 단계 B: Mapping AI - 문제 → 시술 매핑
      console.log("Step B: Starting treatment mapping...")
      const stageBStart = Date.now()
             try {
               if (!visionResult) throw new Error("Vision result is required for mapping")
               mappingResult = await mapToTreatments(visionResult, user_profile)
               stageMetadata.stage_b.duration_ms = Date.now() - stageBStart
               stageMetadata.stage_b.mapping_version = mappingResult.mapping_version || "unknown"
               console.log(`Step B: Completed in ${stageMetadata.stage_b.duration_ms}ms`)
             } catch (error: any) {
               stageMetadata.stage_b.duration_ms = Date.now() - stageBStart
               stageMetadata.stage_b.error = error.message || String(error)
               console.error("Step B: Error:", error)
               // Mapping 실패 시 에러 전파
               throw new Error(`시술 매핑 실패: ${error.message || String(error)}`)
             }

      // 단계 C: NLG AI - 사용자 친화 문구 생성
      console.log("Step C: Starting text generation...")
      const stageCStart = Date.now()
             try {
               if (!visionResult || !mappingResult) {
                 throw new Error("Vision and mapping results are required for NLG")
               }
               nlgResult = await generateUserText(
                 visionResult,
                 mappingResult,
                 user_profile
               )
               stageMetadata.stage_c.duration_ms = Date.now() - stageCStart
               stageMetadata.stage_c.nlg_version = nlgResult.nlg_version || "unknown"
               console.log(`Step C: Completed in ${stageMetadata.stage_c.duration_ms}ms`)
             } catch (error: any) {
               stageMetadata.stage_c.duration_ms = Date.now() - stageCStart
               stageMetadata.stage_c.error = error.message || String(error)
               console.error("Step C: Error:", error)
               // NLG 실패 시 에러 전파
               throw new Error(`사용자 친화 문구 생성 실패: ${error.message || String(error)}`)
             }
    }

    // Review 필요 여부 확인
    const reviewNeeded =
      (visionResult?.confidence ?? 0) < 0.3 ||
      (visionResult?.uncertainty_estimate ?? 1) > 0.5 ||
      mappingResult?.needs_medical_clearance === true ||
      !!stageMetadata.stage_a.error ||
      !!stageMetadata.stage_b.error ||
      !!stageMetadata.stage_c.error

    const resultId = `result_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`

    if (!visionResult || !mappingResult || !nlgResult) {
      throw new Error("One or more stages failed")
    }

    return {
      result_id: resultId,
      analysis: visionResult,
      mapping: mappingResult,
      nlg: nlgResult,
      review_needed: reviewNeeded,
      stage_metadata: stageMetadata,
    }
  } catch (error) {
    console.error("Orchestration error:", error)
    // 모든 에러는 전파 (fallback 없음)
    const errorMessage = error instanceof Error ? error.message : String(error)
    throw new Error(`AI 분석 파이프라인 실패: ${errorMessage}`)
  }
}
