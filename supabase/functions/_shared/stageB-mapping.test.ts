// 단계 B: Mapping AI 테스트 (TDD)
// Deno 표준 테스트 프레임워크 사용

import { assertEquals } from "jsr:@std/assert@^1.0.0"
import { mapToTreatments, MappingResult } from "./stageB-mapping.ts"

Deno.test("mapToTreatments: 색소 침착이 높은 경우 토닝 레이저 추천", async () => {
  // Arrange
  const visionResult = {
    skin_condition_scores: {
      pigmentation: 0.7,
      acne: 0.1,
      redness: 0.05,
      pores: 0.3,
      wrinkles: 0.05,
    },
    metrics: {
      area_pct_by_label: { pigmentation: 0.11 },
    },
    confidence: 0.8,
    uncertainty_estimate: 0.2,
  }
  const userProfile = { age: 25 }

  // Act
  const result: MappingResult = await mapToTreatments(visionResult, userProfile)

  // Assert
  assertEquals(result.treatment_candidates.length > 0, true)
  const hasLaserToning = result.treatment_candidates.some(
    (t) => t.id === "laser_toning"
  )
  assertEquals(hasLaserToning, true)
})

Deno.test("mapToTreatments: 모공이 큰 경우 프락셀 레이저 추천", async () => {
  // Arrange
  // 프락셀 레이저 조건: pores >= 0.4, pigmentation >= 0.2, wrinkles >= 0.2
  const visionResult = {
    skin_condition_scores: {
      pigmentation: 0.3,
      acne: 0.1,
      redness: 0.05,
      pores: 0.6,
      wrinkles: 0.3, // 0.2 이상 필요
    },
    metrics: {
      area_pct_by_label: { pores: 0.15 },
    },
    confidence: 0.8,
    uncertainty_estimate: 0.2,
  }
  const userProfile = { age: 25 }

  // Act
  const result: MappingResult = await mapToTreatments(visionResult, userProfile)

  // Assert
  assertEquals(result.treatment_candidates.length > 0, true)
  const hasFractionalLaser = result.treatment_candidates.some(
    (t) => t.id === "fractional_laser"
  )
  assertEquals(hasFractionalLaser, true)
})

Deno.test("mapToTreatments: 모든 점수가 낮으면 추천 없음", async () => {
  // Arrange
  const visionResult = {
    skin_condition_scores: {
      pigmentation: 0.1,
      acne: 0.05,
      redness: 0.05,
      pores: 0.1,
      wrinkles: 0.05,
    },
    metrics: {
      area_pct_by_label: {},
    },
    confidence: 0.8,
    uncertainty_estimate: 0.2,
  }
  const userProfile = {}

  // Act
  const result: MappingResult = await mapToTreatments(visionResult, userProfile)

  // Assert
  assertEquals(result.treatment_candidates.length, 0)
})

Deno.test("mapToTreatments: 나이 제한 적용", async () => {
  // Arrange
  const visionResult = {
    skin_condition_scores: {
      pigmentation: 0.7,
      acne: 0.1,
      redness: 0.05,
      pores: 0.3,
      wrinkles: 0.05,
    },
    metrics: {
      area_pct_by_label: { pigmentation: 0.11 },
    },
    confidence: 0.8,
    uncertainty_estimate: 0.2,
  }
  const userProfile = { age: 15 } // 토닝 레이저는 18세 이상

  // Act
  const result: MappingResult = await mapToTreatments(visionResult, userProfile)

  // Assert
  const hasLaserToning = result.treatment_candidates.some(
    (t) => t.id === "laser_toning"
  )
  assertEquals(hasLaserToning, false) // 나이 제한으로 제외되어야 함
})

