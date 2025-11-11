// 단계 B: Mapping AI - 규칙 엔진 기반 시술 매핑
// Deno 형식 (변환 없음, 순수 TypeScript)

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

interface TreatmentDefinition {
  id: string
  name: string
  conditions: {
    pigmentation?: { min: number; weight: number }
    acne?: { min: number; weight: number }
    redness?: { min: number; weight: number }
    pores?: { min: number; weight: number }
    wrinkles?: { min: number; weight: number }
  }
  expected_improvement: {
    pigmentation?: number
    acne?: number
    redness?: number
    pores?: number
    wrinkles?: number
  }
  safety_notes: string[]
  age_restrictions?: { min?: number; max?: number }
  skin_tone_restrictions?: string[]
}

const TREATMENT_DEFINITIONS: TreatmentDefinition[] = [
  {
    id: "laser_toning",
    name: "토닝 레이저",
    conditions: {
      pigmentation: { min: 0.3, weight: 0.8 },
      pores: { min: 0.2, weight: 0.3 },
    },
    expected_improvement: {
      pigmentation: 0.25,
      pores: 0.15,
    },
    safety_notes: ["표면 색소 개선에 자주 사용됩니다"],
    age_restrictions: { min: 18 },
  },
  {
    id: "fractional_laser",
    name: "프락셀 레이저",
    conditions: {
      pores: { min: 0.4, weight: 0.9 },
      pigmentation: { min: 0.2, weight: 0.5 },
      wrinkles: { min: 0.2, weight: 0.4 },
    },
    expected_improvement: {
      pores: 0.3,
      pigmentation: 0.2,
      wrinkles: 0.15,
    },
    safety_notes: ["모공 및 잡티 개선에 자주 사용됩니다"],
    age_restrictions: { min: 20 },
  },
  {
    id: "chemical_peel",
    name: "화학 필링",
    conditions: {
      pigmentation: { min: 0.2, weight: 0.6 },
      pores: { min: 0.3, weight: 0.5 },
      acne: { min: 0.2, weight: 0.4 },
    },
    expected_improvement: {
      pigmentation: 0.15,
      pores: 0.2,
      acne: 0.1,
    },
    safety_notes: ["각질 제거 및 모공 정리에 자주 사용됩니다"],
  },
  {
    id: "aquapeel",
    name: "아쿠아필",
    conditions: {
      redness: { min: 0.1, weight: 0.7 },
      acne: { min: 0.2, weight: 0.6 },
      pores: { min: 0.2, weight: 0.4 },
    },
    expected_improvement: {
      redness: 0.2,
      acne: 0.15,
      pores: 0.1,
    },
    safety_notes: ["수분 공급 및 피부 진정에 자주 사용됩니다"],
  },
  {
    id: "rejuran_healer",
    name: "리쥬란 힐러",
    conditions: {
      wrinkles: { min: 0.2, weight: 0.8 },
      pores: { min: 0.2, weight: 0.3 },
    },
    expected_improvement: {
      wrinkles: 0.25,
      pores: 0.1,
    },
    safety_notes: ["주름 개선 및 피부 탄력 향상에 자주 사용됩니다"],
    age_restrictions: { min: 25 },
  },
]

interface SafetyRule {
  name: string
  check: (
    scores: VisionAnalysisInput["skin_condition_scores"],
    profile: UserProfile
  ) => boolean
  blockTreatments: string[]
  message: string
}

const SAFETY_RULES: SafetyRule[] = [
  {
    name: "no_heavy_laser_if_recent_scar",
    check: () => false,
    blockTreatments: ["fractional_laser"],
    message: "최근 상처나 흉터가 있는 경우 강한 레이저 시술은 피해야 합니다",
  },
  {
    name: "pregnancy_check",
    check: () => false,
    blockTreatments: ["fractional_laser", "chemical_peel"],
    message: "임신 중에는 일부 시술이 제한될 수 있습니다",
  },
]

export async function mapToTreatments(
  visionResult: VisionAnalysisInput,
  userProfile: UserProfile = {}
): Promise<MappingResult> {
  const { skin_condition_scores, metrics } = visionResult
  const appliedRules: string[] = []
  const blockedTreatments = new Set<string>()

  for (const rule of SAFETY_RULES) {
    if (rule.check(skin_condition_scores, userProfile)) {
      appliedRules.push(rule.name)
      rule.blockTreatments.forEach((id) => blockedTreatments.add(id))
    }
  }

  const treatmentScores: Array<{
    treatment: TreatmentDefinition
    score: number
    expectedImprovement: number
  }> = []

  for (const treatment of TREATMENT_DEFINITIONS) {
    if (blockedTreatments.has(treatment.id)) {
      continue
    }

    if (userProfile.age) {
      if (
        treatment.age_restrictions?.min &&
        userProfile.age < treatment.age_restrictions.min
      ) {
        continue
      }
      if (
        treatment.age_restrictions?.max &&
        userProfile.age > treatment.age_restrictions.max
      ) {
        continue
      }
    }

    if (treatment.skin_tone_restrictions && userProfile.skin_tone) {
      if (treatment.skin_tone_restrictions.includes(userProfile.skin_tone)) {
        continue
      }
    }

    let totalScore = 0
    let totalWeight = 0
    let expectedImprovement = 0

    for (const [condition, value] of Object.entries(skin_condition_scores)) {
      const conditionDef =
        treatment.conditions[condition as keyof typeof treatment.conditions]
      if (conditionDef) {
        if (value >= conditionDef.min) {
          const weightedScore = value * conditionDef.weight
          totalScore += weightedScore
          totalWeight += conditionDef.weight

          const improvement =
            treatment.expected_improvement[
              condition as keyof typeof treatment.expected_improvement
            ]
          if (improvement) {
            expectedImprovement += improvement * (value / 1.0)
          }
        }
      }
    }

    const finalScore = totalWeight > 0 ? totalScore / totalWeight : 0
    const finalImprovement = Math.min(expectedImprovement, 1.0)

    if (finalScore > 0.2) {
      treatmentScores.push({
        treatment,
        score: finalScore,
        expectedImprovement: finalImprovement,
      })
    }
  }

  treatmentScores.sort((a, b) => b.score - a.score)
  const topTreatments = treatmentScores.slice(0, 3)

  const treatmentCandidates = topTreatments.map(
    ({ treatment, score, expectedImprovement }) => ({
      id: treatment.id,
      name: treatment.name,
      score: Math.round(score * 100) / 100,
      expected_improvement_pct: Math.round(expectedImprovement * 100) / 100,
      notes: treatment.safety_notes,
    })
  )

  const totalSeverity = Object.values(skin_condition_scores).reduce(
    (sum, val) => sum + val,
    0
  )
  if (totalSeverity < 0.5 && treatmentCandidates.length === 0) {
    return {
      treatment_candidates: [],
      mapping_version: "map-v1",
      applied_rules: appliedRules,
    }
  }

  const needsMedicalClearance =
    blockedTreatments.size > 0 ||
    visionResult.uncertainty_estimate > 0.4 ||
    visionResult.confidence < 0.5

  return {
    treatment_candidates: treatmentCandidates,
    mapping_version: "map-v1",
    applied_rules: appliedRules,
    needs_medical_clearance: needsMedicalClearance,
  }
}

