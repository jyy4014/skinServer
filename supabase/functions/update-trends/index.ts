import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
}

// 2025년 인기 시술 트렌드 데이터 (주기적으로 업데이트 필요)
const TREND_DATA: Record<string, { trend: number; popularity: number }> = {
  "리쥬란 힐러": { trend: 9.5, popularity: 9.2 },
  "프락셀 레이저": { trend: 9.0, popularity: 8.8 },
  "하이푸": { trend: 8.5, popularity: 8.3 },
  "IPL 레이저": { trend: 8.0, popularity: 7.8 },
  "토닝 레이저": { trend: 8.0, popularity: 7.7 },
  "MTS": { trend: 7.5, popularity: 7.3 },
  "마이크로니들": { trend: 7.5, popularity: 7.3 },
  "울쎄라": { trend: 7.0, popularity: 6.8 },
  "화학 필링": { trend: 6.5, popularity: 6.3 },
  "스킨부스터": { trend: 6.0, popularity: 5.8 },
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    // 모든 시술 조회
    const { data: treatments, error: fetchError } = await supabase
      .from("treatments")
      .select("id, name")

    if (fetchError) throw fetchError

    // 트렌드 점수 업데이트
    const updates = treatments?.map((treatment) => {
      // 이름 매칭 (부분 일치)
      const matchedTrend = Object.entries(TREND_DATA).find(([key]) =>
        treatment.name.includes(key) || key.includes(treatment.name)
      )

      const trendScore = matchedTrend
        ? matchedTrend[1].trend
        : 5.0 // 기본값
      const popularityScore = matchedTrend
        ? matchedTrend[1].popularity
        : 4.5 // 기본값

      return supabase
        .from("treatments")
        .update({
          trend_score: trendScore,
          popularity_score: popularityScore,
          last_trend_update: new Date().toISOString(),
        })
        .eq("id", treatment.id)
    })

    if (updates) {
      await Promise.all(updates)
    }

    // 클릭/검색 데이터 기반 인기도 계산 (실제 사용자 행동 반영)
    const { data: analysisData } = await supabase
      .from("skin_analysis")
      .select("recommended_treatments")
      .not("recommended_treatments", "is", null)

    if (analysisData) {
      const treatmentCounts: Record<string, number> = {}
      analysisData.forEach((analysis) => {
        const treatments = analysis.recommended_treatments as Array<{
          id: string
          name: string
        }>
        treatments?.forEach((t) => {
          treatmentCounts[t.id] = (treatmentCounts[t.id] || 0) + 1
        })
      })

      // 클릭 카운트 업데이트
      for (const [treatmentId, count] of Object.entries(treatmentCounts)) {
        // 해당 시술의 트렌드 점수 가져오기
        const { data: treatmentData } = await supabase
          .from("treatments")
          .select("trend_score")
          .eq("id", treatmentId)
          .single()

        const currentTrendScore = treatmentData?.trend_score || 5.0

        await supabase
          .from("treatments")
          .update({
            click_count: count,
            popularity_score: Math.min(
              (count / 10) * 0.5 + currentTrendScore * 0.5,
              10.0
            ), // 클릭 데이터와 트렌드 점수 결합
          })
          .eq("id", treatmentId)
      }
    }

    return new Response(
      JSON.stringify({
        status: "success",
        message: "Trend scores updated",
        updated_count: treatments?.length || 0,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  } catch (error) {
    console.error("Error updating trends:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})

