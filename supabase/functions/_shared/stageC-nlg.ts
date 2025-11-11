// 단계 C: NLG AI - Google Gemini 1.5 Flash 연동
// Deno 형식으로 변환

export interface NLGResult {
  headline: string
  paragraphs: string[]
  cta: {
    label: string
    url: string
  }
  nlg_version?: string
}

export interface MappingResultInput {
  treatment_candidates: Array<{
    id: string
    name: string
    score: number
    expected_improvement_pct: number
    notes: string[]
  }>
}

export interface VisionAnalysisInput {
  skin_condition_scores: {
    pigmentation: number
    acne: number
    redness: number
    pores: number
    wrinkles: number
  }
  confidence: number
  uncertainty_estimate: number
}

export interface UserProfile {
  age?: number
  skin_tone?: string
  gender?: string
}

function generateSkinSummary(
  scores: VisionAnalysisInput["skin_condition_scores"]
): string {
  const issues: string[] = []

  if (scores.pigmentation > 0.5) {
    issues.push("색소 침착")
  }
  if (scores.acne > 0.4) {
    issues.push("여드름")
  }
  if (scores.redness > 0.3) {
    issues.push("홍조")
  }
  if (scores.pores > 0.5) {
    issues.push("모공")
  }
  if (scores.wrinkles > 0.3) {
    issues.push("주름")
  }

  if (issues.length === 0) {
    return "피부 상태가 전반적으로 양호합니다"
  }

  return `${issues.join(", ")}이(가) 상대적으로 뚜렷하게 나타났습니다`
}

export async function generateUserText(
  visionResult: VisionAnalysisInput,
  mappingResult: MappingResultInput,
  userProfile: UserProfile = {}
): Promise<NLGResult> {
  const apiKey = Deno.env.get("GOOGLE_GEMINI_API_KEY")
  if (!apiKey) {
    console.error("GOOGLE_GEMINI_API_KEY is not set for NLG")
    throw new Error("GOOGLE_GEMINI_API_KEY 환경 변수가 설정되지 않았습니다. 관리자에게 문의해주세요.")
  }
  
  console.log("NLG API Key found, length:", apiKey.length)

  const skinSummary = generateSkinSummary(visionResult.skin_condition_scores)
  const { confidence, uncertainty_estimate } = visionResult
  const { treatment_candidates } = mappingResult

  const prompt = `You are a friendly, concise medical-adjacent assistant for cosmetic guidance (non-medical).

Input JSON:
{
  "skin_summary": "${skinSummary}",
  "treatment_candidates": ${JSON.stringify(treatment_candidates)},
  "confidence": ${confidence},
  "uncertainty": ${uncertainty_estimate},
  "user_profile": ${JSON.stringify(userProfile)}
}

Generate a JSON output with the following structure:
{
  "headline": "한국어 헤드라인 (참고용 안내 포함)",
  "paragraphs": [
    "이미지 분석 결과 설명 (신뢰도 포함)",
    "비교적 자주 선택되는 옵션 설명",
    "주의사항 (의료 진단 아님 명시)"
  ],
  "cta": {
    "label": "전문가 상담 요청",
    "url": "/consult"
  }
}

Rules:
- Use NO words that sound like a medical prescription ("prescribe", "diagnose", "treat" used as command).
- Use "informational", "commonly chosen", "may help", "consider consulting" instead.
- Always include disclaimer: "본 설명은 의료 진단이 아니며, 시술 전 전문의 상담을 권장합니다."
- If uncertainty > 0.4, include "전문가 검토를 고려해보세요" and make reviewer CTA prominent.
- Use friendly, natural Korean language.
- Keep paragraphs concise (2-3 sentences each).

Output ONLY JSON, no markdown, no code blocks.`

  try {
    console.log("Calling Gemini API for NLG...")
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    )

    // 응답 본문 전체 로깅 (에러 여부와 관계없이)
    const responseText = await response.text()
    
    if (!response.ok) {
      console.error(`=== NLG Gemini API Error Response ===`)
      console.error(`Response status: ${response.status} ${response.statusText}`)
      console.error(`Response body length: ${responseText.length} bytes`)
      console.error(`Response body preview (first 1000 chars):`, responseText.substring(0, 1000))
      console.error(`Response body full:`, responseText)
      
      // 400 에러의 경우 상세 메시지 파싱 시도
      let errorMessage = `Gemini API error: ${response.status} ${response.statusText}`
      try {
        const errorJson = JSON.parse(responseText)
        console.error("Error JSON structure:", {
          hasError: !!errorJson.error,
          errorKeys: errorJson.error ? Object.keys(errorJson.error) : [],
          errorMessage: errorJson.error?.message,
          errorCode: errorJson.error?.code,
          errorStatus: errorJson.error?.status,
        })
        
        if (errorJson.error?.message) {
          errorMessage = `Gemini API error: ${errorJson.error.message}`
          console.error("Parsed error message:", errorJson.error.message)
        } else if (errorJson.message) {
          errorMessage = `Gemini API error: ${errorJson.message}`
          console.error("Parsed error message (root):", errorJson.message)
        }
      } catch (e) {
        // JSON 파싱 실패 시 원본 텍스트 사용
        console.error("Failed to parse error JSON:", e)
        if (responseText.length > 0) {
          errorMessage = `Gemini API error: ${responseText.substring(0, 500)}`
        }
      }
      
      throw new Error(errorMessage)
    }

    // 성공 응답 로깅
    console.log("=== NLG API Raw Response ===")
    console.log("Response status:", response.status, response.statusText)
    console.log("Response body length:", responseText.length, "bytes")
    console.log("Response body preview (first 1000 chars):", responseText.substring(0, 1000))
    
    // JSON 파싱
    let data: any
    try {
      data = JSON.parse(responseText)
      console.log("=== NLG API Parsed Response ===")
      console.log("Full response JSON:", JSON.stringify(data, null, 2))
    } catch (parseError) {
      console.error("Failed to parse NLG response as JSON:", parseError)
      console.error("Raw response text:", responseText)
      throw new Error(`NLG API 응답을 파싱할 수 없습니다: ${parseError instanceof Error ? parseError.message : String(parseError)}`)
    }
          
          console.log("NLG API response structure:", {
            hasCandidates: !!data.candidates,
            candidatesLength: data.candidates?.length || 0,
            hasContent: !!data.candidates?.[0]?.content,
            hasParts: !!data.candidates?.[0]?.content?.parts,
            finishReason: data.candidates?.[0]?.finishReason,
          })
          
          const text = data.candidates[0]?.content?.parts[0]?.text || ""
          console.log("=== NLG API Response Text ===")
          console.log("Response text length:", text.length, "characters")
          console.log("Response text preview (first 500 chars):", text.substring(0, 500))
          console.log("Response text full:", text)

          let nlgResult: NLGResult
          try {
            console.log("=== Extracting JSON from NLG Response Text ===")
            const jsonMatch =
              text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/)
            const jsonText = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text
            console.log("NLG extracted JSON text length:", jsonText.length, "characters")
            console.log("NLG extracted JSON text preview (first 500 chars):", jsonText.substring(0, 500))
            console.log("NLG extracted JSON text full:", jsonText)
            
            const parsed = JSON.parse(jsonText)
            console.log("=== Parsed NLG Result ===")
            console.log("Parsed JSON keys:", Object.keys(parsed))
            console.log("Full parsed JSON:", JSON.stringify(parsed, null, 2))

      nlgResult = {
        headline: parsed.headline || `${skinSummary} — 참고용 안내`,
        paragraphs: Array.isArray(parsed.paragraphs)
          ? parsed.paragraphs
          : [parsed.paragraphs || ""],
        cta: parsed.cta || {
          label: "전문가 상담 요청",
          url: "/consult",
        },
      }

      if (uncertainty_estimate > 0.4) {
        nlgResult.paragraphs.push(
          "전문가 검토를 고려해보세요. 본 분석 결과는 참고용이며, 정확한 진단을 위해서는 전문의 상담이 필요합니다."
        )
      }

      const hasDisclaimer = nlgResult.paragraphs.some(
        (p) =>
          p.includes("의료 진단") ||
          p.includes("전문의 상담") ||
          p.includes("참고용")
      )
      if (!hasDisclaimer) {
        nlgResult.paragraphs.push(
          "본 설명은 의료 진단이 아니며, 시술 전 전문의 상담을 권장합니다."
        )
      }
    } catch (parseError) {
      console.error("Failed to parse Gemini NLG response:", parseError)
      console.error("Response text:", text.substring(0, 500)) // 디버깅용
      throw new Error(`AI 텍스트 생성 결과를 파싱할 수 없습니다. 응답 형식이 올바르지 않습니다: ${parseError instanceof Error ? parseError.message : String(parseError)}`)
    }

    // nlg_version 추가
    return {
      ...nlgResult,
      nlg_version: "nlg-v1-gemini-2.5-flash",
    }
  } catch (error) {
    // 이미 에러인 경우 그대로 전달
    if (error instanceof Error) {
      console.error("Gemini NLG API error:", error.message)
      throw error
    }
    console.error("Gemini NLG API error:", error)
    console.error("Error details:", JSON.stringify(error, null, 2)) // 디버깅용
    throw new Error(`AI 텍스트 생성 중 오류가 발생했습니다: ${String(error)}`)
  }
}

function getTemplateNLGResult(
  visionResult: VisionAnalysisInput,
  mappingResult: MappingResultInput
): NLGResult {
  const skinSummary = generateSkinSummary(visionResult.skin_condition_scores)
  const { confidence, uncertainty_estimate } = visionResult
  const { treatment_candidates } = mappingResult

  const headline = `${skinSummary} — 참고용 안내`
  const paragraphs: string[] = []

  paragraphs.push(
    `이미지 분석 결과, ${skinSummary}. (신뢰도 ${Math.round(confidence * 100)}%)`
  )

  if (treatment_candidates.length > 0) {
    const topTreatment = treatment_candidates[0]
    paragraphs.push(
      `비교적 자주 선택되는 옵션: ${topTreatment.name} — ${topTreatment.notes.join(", ")}. (참고: 평균 개선 기대치 약 ${Math.round(topTreatment.expected_improvement_pct * 100)}%)`
    )
  } else {
    paragraphs.push(
      "현재 피부 상태가 전반적으로 양호하여 특별한 시술 추천이 없습니다."
    )
  }

  if (uncertainty_estimate > 0.4) {
    paragraphs.push(
      "전문가 검토를 고려해보세요. 본 분석 결과는 참고용이며, 정확한 진단을 위해서는 전문의 상담이 필요합니다."
    )
  }

  paragraphs.push("본 설명은 의료 진단이 아니며, 시술 전 전문의 상담을 권장합니다.")

  return {
    headline,
    paragraphs,
    cta: {
      label: "전문가 상담 요청",
      url: "/consult",
    },
    nlg_version: "nlg-v1-template",
  }
}

