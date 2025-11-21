// 단계 B: Mapping AI - AI 기반 시술 매핑 (Google Gemini)
// Deno 형식

export interface UserProfile {
  age?: number
  skin_tone?: string
  gender?: string
  consent_for_research?: boolean
}

export interface MappingResult {
  treatment_candidates: Array<{
    id: string
    name: string
    score: number
    expected_improvement_pct: number
    notes: string[]
    // 추가 필드: 최신 레이저 시술 정보
    cost_range?: { min: number; max: number; currency: string }
    frequency?: string
    treatment_cycle?: string
    clinical_evidence?: string
    latest_technology?: boolean
  }>
  mapping_version: string
  applied_rules: string[]
  needs_medical_clearance?: boolean
}

export interface VisionAnalysisInput {
  skin_condition_scores: {
    pigmentation: number
    acne: number
    redness: number
    pores: number
    wrinkles: number
  }
  metrics: {
    area_pct_by_label: Record<string, number>
  }
  confidence: number
  uncertainty_estimate: number
}

// 안전성 규칙 (기본 필터링용)
interface SafetyRule {
  name: string
  check: (
    scores: VisionAnalysisInput["skin_condition_scores"],
    profile: UserProfile
  ) => boolean
  message: string
}

const SAFETY_RULES: SafetyRule[] = [
  {
    name: "pregnancy_check",
    check: (scores, profile) => {
      // 프로필에 임신 정보가 있으면 체크 (현재는 false)
      return false
    },
    message: "임신 중에는 일부 시술이 제한될 수 있습니다",
  },
]

export async function mapToTreatments(
  visionResult: VisionAnalysisInput,
  userProfile: UserProfile = {}
): Promise<MappingResult> {
  const apiKey = Deno.env.get("GOOGLE_GEMINI_API_KEY")
  if (!apiKey) {
    console.error("GOOGLE_GEMINI_API_KEY is not set for Mapping")
    throw new Error("GOOGLE_GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.")
  }

  const { skin_condition_scores, metrics, confidence, uncertainty_estimate } = visionResult
  const appliedRules: string[] = []

  // 안전성 규칙 적용
  for (const rule of SAFETY_RULES) {
    if (rule.check(skin_condition_scores, userProfile)) {
      appliedRules.push(rule.name)
    }
  }

  // 피부 상태 요약
  const topIssues = Object.entries(skin_condition_scores)
    .filter(([, value]) => value > 0.3)
    .sort(([, a], [, b]) => b - a)
    .map(([key, value]) => `${key}: ${(value * 100).toFixed(0)}%`)
    .join(', ')

  // AI 프롬프트 구성 (논문적 근거 포함)
  const prompt = `You are a dermatology treatment recommendation AI assistant (non-medical, informational only).

### Task
Based on the skin analysis results, recommend 3-5 cosmetic laser treatments with:
- Latest 2024-2025 laser technologies
- Clinical evidence and research-based information
- **Average price ranges based on actual Korean market research (2024-2025)**
- Treatment frequency and cycles
- Expected improvement percentages

IMPORTANT: For cost_range, you MUST search for and provide REAL average prices from Korean cosmetic clinics. Do NOT make up prices. Base your prices on actual market research data.

### Input Data
Skin Condition Scores (0.0-1.0):
- Pigmentation: ${skin_condition_scores.pigmentation.toFixed(2)}
- Acne: ${skin_condition_scores.acne.toFixed(2)}
- Redness: ${skin_condition_scores.redness.toFixed(2)}
- Pores: ${skin_condition_scores.pores.toFixed(2)}
- Wrinkles: ${skin_condition_scores.wrinkles.toFixed(2)}

Top Issues: ${topIssues || "None significant"}
Area Percentages: ${JSON.stringify(metrics.area_pct_by_label)}
Confidence: ${(confidence * 100).toFixed(0)}%
User Profile: Age ${userProfile.age || "unknown"}, Skin Tone ${userProfile.skin_tone || "unknown"}

### Output Format (JSON only)
{
  "treatment_candidates": [
    {
      "id": "pico_laser_ldm",
      "name": "피코 레이저 + LDM",
      "score": 0.75,
      "expected_improvement_pct": 0.30,
      "notes": [
        "모공 축소 및 피지 분비 조절에 효과적 (2024-2025 최신 기술)",
        "피코초 레이저는 1조분의 1초 단위 펄스로 색소 분해 및 콜라겐 재생 촉진",
        "LDM(Low Dynamic Microcurrent)과 병행 시 모공 개선 효과 증대"
      ],
      "cost_range": {
        "min": 100000,
        "max": 200000,
        "currency": "KRW"
      },
      "frequency": "주 1회",
      "treatment_cycle": "4주간 (총 4회)",
      "clinical_evidence": "Picosecond laser studies (2023-2024) show 60-80% pore size reduction in clinical trials",
      "latest_technology": true
    },
    {
      "id": "ipl_laser",
      "name": "IPL 레이저",
      "score": 0.65,
      "expected_improvement_pct": 0.25,
      "notes": [
        "색소 침착 및 잡티 제거에 효과적",
        "Intense Pulsed Light 기술로 멜라닌 분해"
      ],
      "cost_range": {
        "min": 70000,
        "max": 150000,
        "currency": "KRW"
      },
      "frequency": "2-3주 간격",
      "treatment_cycle": "6-8주간 (총 3-4회)",
      "clinical_evidence": "IPL efficacy studies (2024) demonstrate 70-85% pigmentation improvement",
      "latest_technology": false
    },
    {
      "id": "vbeam_laser",
      "name": "V-Beam 레이저",
      "score": 0.60,
      "expected_improvement_pct": 0.20,
      "notes": [
        "홍조 및 혈관성 병변 개선에 효과적",
        "Pulsed Dye Laser 기술로 혈관 수축 및 홍조 완화"
      ],
      "cost_range": {
        "min": 80000,
        "max": 150000,
        "currency": "KRW"
      },
      "frequency": "3-4주 간격",
      "treatment_cycle": "8-12주간 (총 3-4회)",
      "clinical_evidence": "V-Beam laser research (2024-2025) shows 75-90% redness reduction in rosacea patients",
      "latest_technology": true
    }
  ]
}

### Requirements
1. Recommend treatments based on HIGHEST skin condition scores (prioritize issues with score > 0.4)
2. Include ONLY latest 2024-2025 laser technologies when available
3. Provide clinical evidence references (research papers, studies from 2023-2025)
4. **Cost ranges MUST be based on actual Korean market research (2024-2025)**: Search for real average prices from Korean cosmetic clinics. Typical ranges:
   - Basic treatments (IPL, 토닝): ₩70,000 ~ ₩150,000 per session
   - Advanced treatments (피코, 프락셀): ₩100,000 ~ ₩250,000 per session
   - Premium treatments (리쥬란, 하이푸): ₩200,000 ~ ₩500,000 per session
   - Always provide realistic min/max ranges based on actual market data
5. Treatment cycles should be based on clinical protocols
6. Use Korean language for all text
7. Do NOT use medical diagnostic terms - use "informational", "commonly chosen", "may help"
8. If redness score > 0.5, prioritize vascular lasers (V-Beam, IPL)
9. If pigmentation score > 0.5, prioritize pigment lasers (Pico, IPL, Q-switched)
10. If pores score > 0.5, prioritize pore-reducing treatments (Pico + LDM, Fractional)

### Safety Rules
- Age restrictions: Minimum 18 years old for laser treatments
- Pregnancy: Avoid strong lasers during pregnancy
- Recent scars: Avoid fractional lasers if recent scars present

Output strictly JSON only (no markdown, no code blocks, no explanations).
`

  try {
    console.log("Calling Gemini API for treatment mapping...")
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
          generationConfig: {
            temperature: 0.3, // 낮은 온도로 일관성 있는 결과
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Gemini API error (${response.status}):`, errorText.substring(0, 1000))
      
      let errorMessage = `Gemini API error: ${response.status} ${response.statusText}`
      try {
        const errorJson = JSON.parse(errorText)
        if (errorJson.error?.message) {
          errorMessage = `Gemini API error: ${errorJson.error.message}`
        }
      } catch (e) {
        // JSON 파싱 실패 시 원본 사용
      }
      
      throw new Error(errorMessage)
    }

    const responseText = await response.text()
    console.log("Mapping API response length:", responseText.length, "bytes")

    let data: any
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error("Failed to parse mapping response as JSON:", parseError)
      throw new Error(`Mapping API 응답을 파싱할 수 없습니다: ${parseError instanceof Error ? parseError.message : String(parseError)}`)
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
    console.log("Mapping API response text length:", text.length, "characters")

    // JSON 추출
    let mappingResult: MappingResult
    try {
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/)
      const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text
      
      const parsed = JSON.parse(jsonText)
      console.log("Parsed mapping result:", JSON.stringify(parsed, null, 2))

      // 결과 검증 및 정규화
      const treatmentCandidates = (parsed.treatment_candidates || []).slice(0, 5).map((t: any) => ({
        id: t.id || `treatment_${Math.random().toString(36).substr(2, 9)}`,
        name: t.name || "Unknown Treatment",
        score: Math.max(0, Math.min(1, t.score || 0)),
        expected_improvement_pct: Math.max(0, Math.min(1, t.expected_improvement_pct || 0)),
        notes: Array.isArray(t.notes) ? t.notes : [t.notes || ""],
        // AI가 생성한 가격 정보 포함
        cost_range: t.cost_range ? {
          min: Math.round(t.cost_range.min || 0),
          max: Math.round(t.cost_range.max || 0),
          currency: t.cost_range.currency || "KRW",
        } : undefined,
        frequency: t.frequency || undefined,
        treatment_cycle: t.treatment_cycle || undefined,
        clinical_evidence: t.clinical_evidence || undefined,
        latest_technology: t.latest_technology || false,
      }))

      // 점수 기준 정렬
      treatmentCandidates.sort((a: any, b: any) => b.score - a.score)

      // 가격 정보 로깅
      treatmentCandidates.forEach((treatment) => {
        if (treatment.cost_range) {
          console.log(`Price for ${treatment.name}: ₩${treatment.cost_range.min} ~ ₩${treatment.cost_range.max}`)
        } else {
          console.warn(`No price information for ${treatment.name}`)
        }
      })

      mappingResult = {
        treatment_candidates: treatmentCandidates,
        mapping_version: "map-v2-ai-gemini-2.5-flash",
        applied_rules: appliedRules,
        needs_medical_clearance: uncertainty_estimate > 0.4 || confidence < 0.5,
      }
    } catch (parseError) {
      console.error("Failed to parse Gemini mapping response:", parseError)
      console.error("Response text:", text.substring(0, 500))
      throw new Error(`시술 매핑 결과를 파싱할 수 없습니다: ${parseError instanceof Error ? parseError.message : String(parseError)}`)
    }

    return mappingResult
  } catch (error) {
    console.error("Mapping AI error:", error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error(`시술 매핑 중 오류가 발생했습니다: ${String(error)}`)
  }
}

