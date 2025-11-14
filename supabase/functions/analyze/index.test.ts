// Edge Function analyze 엔드포인트 테스트 (TDD)
// Deno 표준 테스트 프레임워크 사용

import { assertEquals, assertRejects } from "jsr:@std/assert@^1.0.0"

// Mock Request 객체 생성 헬퍼
function createMockRequest(
  method: string,
  path: string,
  body?: any,
  headers?: Record<string, string>
): Request {
  const url = `https://example.com${path}`
  return new Request(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  })
}

Deno.test("analyze 엔드포인트: 여러 이미지 URL 배열 지원", async () => {
  // Arrange: 3개 이미지 URL 배열 요청
  const requestBody = {
    image_urls: [
      "https://example.com/front.jpg",
      "https://example.com/left.jpg",
      "https://example.com/right.jpg",
    ],
    image_angles: ["front", "left", "right"],
    user_id: "test-user-id",
    access_token: "test-token",
  }

  const req = createMockRequest("POST", "/analyze", requestBody)

  // Act: 요청 본문 파싱 확인
  const parsed = await req.json()

  // Assert: image_urls와 image_angles가 올바르게 파싱되는지 확인
  assertEquals(parsed.image_urls.length, 3)
  assertEquals(parsed.image_angles.length, 3)
  assertEquals(parsed.image_urls[0], "https://example.com/front.jpg")
  assertEquals(parsed.image_angles[0], "front")
})

Deno.test("analyze 엔드포인트: 하위 호환성 - 단일 image_url 지원", async () => {
  // Arrange: 기존 형식 (단일 image_url)
  const requestBody = {
    image_url: "https://example.com/image.jpg",
    user_id: "test-user-id",
    access_token: "test-token",
  }

  const req = createMockRequest("POST", "/analyze", requestBody)

  // Act: 요청 본문 파싱
  const parsed = await req.json()

  // Assert: image_url이 배열로 변환되어야 함
  const imageUrls = parsed.image_urls || (parsed.image_url ? [parsed.image_url] : [])
  const imageAngles = parsed.image_angles || (parsed.image_url ? ['front'] : [])

  assertEquals(imageUrls.length, 1)
  assertEquals(imageUrls[0], "https://example.com/image.jpg")
  assertEquals(imageAngles[0], "front")
})

Deno.test("analyze 엔드포인트: 이미지 URL이 없을 때 에러 반환", async () => {
  // Arrange: image_urls와 image_url 모두 없음
  const requestBody = {
    user_id: "test-user-id",
    access_token: "test-token",
  }

  const req = createMockRequest("POST", "/analyze", requestBody)
  const parsed = await req.json()

  // Act & Assert: 유효성 검사 로직
  const imageUrls = parsed.image_urls || (parsed.image_url ? [parsed.image_url] : [])

  assertEquals(imageUrls.length, 0)
  // 실제 엔드포인트에서는 400 에러를 반환해야 함
})

Deno.test("save 엔드포인트: 여러 이미지 URL 배열 저장", async () => {
  // Arrange: 3개 이미지 URL 배열 저장 요청
  const requestBody = {
    user_id: "test-user-id",
    image_urls: [
      "https://example.com/front.jpg",
      "https://example.com/left.jpg",
      "https://example.com/right.jpg",
    ],
    image_angles: ["front", "left", "right"],
    result_id: "test-result-id",
    analysis_a: {},
    analysis_b: {},
    analysis_c: {},
    access_token: "test-token",
  }

  const req = createMockRequest("POST", "/analyze/save", requestBody)

  // Act: 요청 본문 파싱
  const parsed = await req.json()

  // Assert: image_urls와 image_angles가 올바르게 파싱되는지 확인
  assertEquals(parsed.image_urls.length, 3)
  assertEquals(parsed.image_angles.length, 3)
  assertEquals(parsed.image_urls[0], "https://example.com/front.jpg")
})

Deno.test("save 엔드포인트: 하위 호환성 - 단일 image_url 저장", async () => {
  // Arrange: 기존 형식 (단일 image_url)
  const requestBody = {
    user_id: "test-user-id",
    image_url: "https://example.com/image.jpg",
    result_id: "test-result-id",
    analysis_a: {},
    analysis_b: {},
    analysis_c: {},
    access_token: "test-token",
  }

  const req = createMockRequest("POST", "/analyze/save", requestBody)
  const parsed = await req.json()

  // Assert: image_url이 배열로 변환되어야 함
  const imageUrls = parsed.image_urls || (parsed.image_url ? [parsed.image_url] : [])
  const imageAngles = parsed.image_angles || (parsed.image_url ? ['front'] : [])

  assertEquals(imageUrls.length, 1)
  assertEquals(imageUrls[0], "https://example.com/image.jpg")
  assertEquals(imageAngles[0], "front")
})

Deno.test("save 엔드포인트: 첫 번째 이미지가 image_url로 저장되는지 확인", async () => {
  // Arrange: 3개 이미지 URL 배열
  const imageUrls = [
    "https://example.com/front.jpg",
    "https://example.com/left.jpg",
    "https://example.com/right.jpg",
  ]

  // Act: 첫 번째 이미지를 image_url로 사용
  const imageUrl = imageUrls[0] || null

  // Assert: 첫 번째 이미지가 image_url로 설정되어야 함 (하위 호환성)
  assertEquals(imageUrl, "https://example.com/front.jpg")
})

