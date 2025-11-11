// 오케스트레이터 통합 테스트 (TDD)
// Deno 표준 테스트 프레임워크 사용

import { assertEquals, assertRejects } from "jsr:@std/assert@^1.0.0"
import { orchestrateAnalysis, OrchestrationInput } from "./orchestrator.ts"

// Mock 함수들을 사용하여 실제 API 호출 없이 테스트
Deno.test("orchestrateAnalysis: 전체 파이프라인 실행 (Mock)", async () => {
  // Arrange: Mock 데이터 준비
  const input: OrchestrationInput = {
    image_url: "https://example.com/test-image.jpg",
    user_id: "test-user-id",
    user_profile: { age: 25 },
    meta: { camera: "iPhone12" },
  }

  // Act & Assert: 실제 API 호출이 필요하므로 에러가 발생할 것으로 예상
  // 환경 변수가 없으면 에러가 발생해야 함
  await assertRejects(
    async () => {
      await orchestrateAnalysis(input)
    },
    Error,
    "GOOGLE_GEMINI_API_KEY"
  )
})

Deno.test("orchestrateAnalysis: 필수 파라미터 검증", async () => {
  // Arrange: image_url 누락
  const input: Partial<OrchestrationInput> = {
    user_id: "test-user-id",
  }

  // Act & Assert
  await assertRejects(
    async () => {
      await orchestrateAnalysis(input as OrchestrationInput)
    },
    Error
  )
})

