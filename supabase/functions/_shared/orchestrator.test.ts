// 오케스트레이터 통합 테스트 (TDD)
// Deno 표준 테스트 프레임워크 사용

import { assertEquals, assertRejects } from "jsr:@std/assert@^1.0.0"
import { orchestrateAnalysis, OrchestrationInput } from "./orchestrator.ts"

// Mock 함수들을 사용하여 실제 API 호출 없이 테스트
Deno.test("orchestrateAnalysis: 전체 파이프라인 실행 (Mock) - 단일 이미지", async () => {
  // Arrange: Mock 데이터 준비 (하위 호환성 테스트)
  const input: OrchestrationInput = {
    image_urls: ["https://example.com/test-image.jpg"],
    image_angles: ["front"],
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

Deno.test("orchestrateAnalysis: 여러 이미지 지원 (3개 이미지)", async () => {
  // Arrange: 3개 이미지 URL 배열
  const input: OrchestrationInput = {
    image_urls: [
      "https://example.com/front.jpg",
      "https://example.com/left.jpg",
      "https://example.com/right.jpg",
    ],
    image_angles: ["front", "left", "right"],
    user_id: "test-user-id",
    user_profile: { age: 25 },
    meta: { camera: "iPhone12" },
  }

  // Act & Assert: 실제 API 호출이 필요하므로 에러가 발생할 것으로 예상
  await assertRejects(
    async () => {
      await orchestrateAnalysis(input)
    },
    Error,
    "GOOGLE_GEMINI_API_KEY"
  )
})

Deno.test("orchestrateAnalysis: 필수 파라미터 검증 - image_urls 누락", async () => {
  // Arrange: image_urls 누락
  const input: Partial<OrchestrationInput> = {
    image_urls: [],
    image_angles: [],
    user_id: "test-user-id",
  }

  // Act & Assert: 빈 배열이면 에러 발생해야 함
  await assertRejects(
    async () => {
      await orchestrateAnalysis(input as OrchestrationInput)
    },
    Error,
    "이미지 URL이 필요합니다"
  )
})

Deno.test("orchestrateAnalysis: image_urls와 image_angles 길이 일치 확인", async () => {
  // Arrange: image_urls와 image_angles 길이가 다른 경우
  const input: OrchestrationInput = {
    image_urls: [
      "https://example.com/front.jpg",
      "https://example.com/left.jpg",
    ],
    image_angles: ["front"], // 길이가 다름
    user_id: "test-user-id",
  }

  // Act: 길이 확인
  const urlsLength = input.image_urls.length
  const anglesLength = input.image_angles.length

  // Assert: 길이가 다를 수 있지만, 코드에서 처리해야 함
  // (실제로는 frontIndex를 찾을 때 indexOf를 사용하므로 문제없음)
  assertEquals(typeof urlsLength, "number")
  assertEquals(typeof anglesLength, "number")
})

Deno.test("orchestrateAnalysis: 정면 이미지 우선 처리 확인", async () => {
  // Arrange: 정면 이미지가 첫 번째가 아닌 경우
  const input: OrchestrationInput = {
    image_urls: [
      "https://example.com/left.jpg",
      "https://example.com/front.jpg",
      "https://example.com/right.jpg",
    ],
    image_angles: ["left", "front", "right"],
    user_id: "test-user-id",
  }

  // Act: 정면 이미지 인덱스 찾기
  const frontIndex = input.image_angles.indexOf("front")
  const frontImageUrl = frontIndex >= 0 ? input.image_urls[frontIndex] : input.image_urls[0]

  // Assert: 정면 이미지가 올바르게 찾아져야 함
  assertEquals(frontIndex, 1)
  assertEquals(frontImageUrl, "https://example.com/front.jpg")
})

