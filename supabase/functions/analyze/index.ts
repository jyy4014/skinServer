import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"
import { orchestrateAnalysis } from "../_shared/orchestrator.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
}

Deno.serve(async (req) => {
  // CORS preflight 처리
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const path = url.pathname.replace("/analyze", "")

    // Health check
    if (path === "/health" || (path === "" && req.method === "GET")) {
      return new Response(
        JSON.stringify({
          status: "ok",
          message: "Backend server is running",
          timestamp: new Date().toISOString(),
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // 피부 이미지 분석 (3단계 파이프라인)
    if (path === "" && req.method === "POST") {
      const { image_url, user_id, access_token, user_profile, meta } =
        await req.json()

      // Access token으로 사용자 인증 확인
      if (access_token) {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_ANON_KEY") ?? "",
          {
            global: {
              headers: { Authorization: `Bearer ${access_token}` },
            },
          }
        )
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser(access_token)
        if (authError || !user || user.id !== user_id) {
          return new Response(
            JSON.stringify({ error: "인증에 실패했습니다." }),
            {
              status: 401,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          )
        }
      }

             // 3단계 파이프라인 실행: A → B → C
             try {
               const result = await orchestrateAnalysis({
                 image_url,
                 user_id,
                 user_profile: user_profile || {},
                 meta: meta || {},
               })

               // 결과 반환 (표준화된 형식)
               return new Response(
                 JSON.stringify({
                   status: "success",
                   result_id: result.result_id,
                   analysis: result.analysis,
                   mapping: result.mapping,
                   nlg: result.nlg,
                   review_needed: result.review_needed,
                   heatmap_signed_url: result.heatmap_signed_url,
                   stage_metadata: result.stage_metadata, // 각 단계별 메타데이터 포함
                 }),
                 {
                   headers: { ...corsHeaders, "Content-Type": "application/json" },
                 }
               )
             } catch (orchestrationError: any) {
               // 오케스트레이션 에러는 명확한 에러 메시지로 반환
               console.error("Orchestration failed:", orchestrationError)
               return new Response(
                 JSON.stringify({
                   status: "error",
                   error: orchestrationError.message || "AI 분석 중 오류가 발생했습니다.",
                   error_type: "AI_PIPELINE_ERROR",
                 }),
                 {
                   status: 500,
                   headers: { ...corsHeaders, "Content-Type": "application/json" },
                 }
               )
             }
    }

    // 분석 결과를 DB에 저장 (3단계 파이프라인 결과)
    if (path === "/save" && req.method === "POST") {
      const {
        user_id,
        image_url,
        result_id,
        analysis_a,
        analysis_b,
        analysis_c,
        confidence,
        uncertainty_estimate,
        review_needed,
        stage_metadata,
        access_token,
      } = await req.json()

      // Access token으로 사용자 인증 확인
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_ANON_KEY") ?? "",
        {
          global: {
            headers: { Authorization: `Bearer ${access_token}` },
          },
        }
      )

      if (access_token) {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser(access_token)
        if (authError || !user || user.id !== user_id) {
          return new Response(
            JSON.stringify({ error: "인증에 실패했습니다." }),
            {
              status: 401,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          )
        }
      }

      // NLG 결과에서 summary 추출
      const result_summary = analysis_c?.headline || "분석 완료"
      const recommended_treatments = analysis_b?.treatment_candidates || []

      // 각 단계별 메타데이터 추출
      const stageMeta = stage_metadata || {}
      const stageA = stageMeta.stage_a || {}
      const stageB = stageMeta.stage_b || {}
      const stageC = stageMeta.stage_c || {}

      // Supabase 클라이언트에 토큰 설정하여 DB 저장
      const { data, error } = await supabase
        .from("skin_analysis")
        .insert({
          user_id,
          image_url,
          result_summary,
          // 각 단계별 결과를 별도 컬럼에 저장
          stage_a_vision_result: analysis_a || null,
          stage_b_mapping_result: analysis_b || null,
          stage_c_nlg_result: analysis_c || null,
          // 각 단계별 에러 저장
          stage_a_error: stageA.error || null,
          stage_b_error: stageB.error || null,
          stage_c_error: stageC.error || null,
          // 각 단계별 실행 시간 저장
          stage_a_duration_ms: stageA.duration_ms || null,
          stage_b_duration_ms: stageB.duration_ms || null,
          stage_c_duration_ms: stageC.duration_ms || null,
          // 각 단계별 모델 버전 저장
          model_version_a: stageA.model_version || analysis_a?.model_version || null,
          model_version_b: stageB.mapping_version || analysis_b?.mapping_version || null,
          model_version_c: stageC.nlg_version || analysis_c?.nlg_version || null,
          // 신뢰도 및 불확실성 저장
          confidence: confidence || analysis_a?.confidence || null,
          uncertainty_estimate: uncertainty_estimate || analysis_a?.uncertainty_estimate || null,
          review_needed: review_needed || false,
          // 기존 호환성을 위한 analysis_data (전체 결과)
          analysis_data: {
            analysis_a: analysis_a || {},
            analysis_b: analysis_b || {},
            analysis_c: analysis_c || {},
            confidence: confidence || analysis_a?.confidence || 0.8,
            uncertainty_estimate: uncertainty_estimate || analysis_a?.uncertainty_estimate || 0.2,
            review_needed: review_needed || false,
            model_version: analysis_a?.model_version || "unknown",
            mapping_version: analysis_b?.mapping_version || "unknown",
            stage_metadata: stageMeta,
          },
          recommended_treatments: recommended_treatments,
        })
        .select()
        .single()

      if (error) {
        console.error("DB save error:", error)
        throw error
      }

      return new Response(
        JSON.stringify({
          status: "success",
          data,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Unhandled error in analyze function:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return new Response(
      JSON.stringify({
        status: "error",
        error: errorMessage || "Internal server error",
        error_type: "UNKNOWN_ERROR",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})

