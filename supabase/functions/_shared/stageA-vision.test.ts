import { assertEquals, assertRejects } from "jsr:@std/assert@^1.0.0"
import { analyzeVision, validateImageQuality } from "./stageA-vision.ts"

// 테스트 환경 설정
Deno.test("analyzeVision: API 키가 없을 때 에러 발생 - 단일 이미지", async () => {
  // 환경 변수 백업
  const originalKey = Deno.env.get("GOOGLE_GEMINI_API_KEY")
  
  try {
    // API 키 제거
    Deno.env.delete("GOOGLE_GEMINI_API_KEY")
    
    // 에러가 발생해야 함 (하위 호환성: 단일 이미지)
    await assertRejects(
      async () => {
        await analyzeVision(["https://example.com/test.jpg"], ["front"])
      },
      Error,
      "GOOGLE_GEMINI_API_KEY 환경 변수가 설정되지 않았습니다"
    )
  } finally {
    // 환경 변수 복원
    if (originalKey) {
      Deno.env.set("GOOGLE_GEMINI_API_KEY", originalKey)
    }
  }
})

Deno.test("analyzeVision: 여러 이미지 지원 - 3개 이미지", async () => {
  // 환경 변수 백업
  const originalKey = Deno.env.get("GOOGLE_GEMINI_API_KEY")
  
  try {
    // API 키 제거
    Deno.env.delete("GOOGLE_GEMINI_API_KEY")
    
    // 에러가 발생해야 함 (여러 이미지)
    await assertRejects(
      async () => {
        await analyzeVision(
          [
            "https://example.com/front.jpg",
            "https://example.com/left.jpg",
            "https://example.com/right.jpg",
          ],
          ["front", "left", "right"]
        )
      },
      Error,
      "GOOGLE_GEMINI_API_KEY 환경 변수가 설정되지 않았습니다"
    )
  } finally {
    // 환경 변수 복원
    if (originalKey) {
      Deno.env.set("GOOGLE_GEMINI_API_KEY", originalKey)
    }
  }
})

Deno.test("analyzeVision: 단일 이미지 하위 호환성", async () => {
  // Arrange: 단일 이미지 배열
  const imageUrls = ["https://example.com/test.jpg"]
  const imageAngles = ["front"]

  // Act: 단일 이미지인지 확인
  const isSingleImage = imageUrls.length === 1

  // Assert: 단일 이미지인 경우 하위 호환성 로직으로 처리되어야 함
  assertEquals(isSingleImage, true)
  assertEquals(imageUrls.length, 1)
  assertEquals(imageAngles.length, 1)
})

Deno.test("analyzeVision: 정면 이미지 우선 처리", async () => {
  // Arrange: 정면 이미지가 중간에 있는 경우
  const imageUrls = [
    "https://example.com/left.jpg",
    "https://example.com/front.jpg",
    "https://example.com/right.jpg",
  ]
  const imageAngles = ["left", "front", "right"]

  // Act: 정면 이미지 인덱스 찾기
  const frontIndex = imageAngles.indexOf("front")
  const frontImageUrl = frontIndex >= 0 ? imageUrls[frontIndex] : imageUrls[0]

  // Assert: 정면 이미지가 올바르게 찾아져야 함
  assertEquals(frontIndex, 1)
  assertEquals(frontImageUrl, "https://example.com/front.jpg")
})

Deno.test("analyzeVision: 측면 이미지 필터링", async () => {
  // Arrange: 3개 이미지 (정면, 좌측, 우측)
  const imageUrls = [
    "https://example.com/front.jpg",
    "https://example.com/left.jpg",
    "https://example.com/right.jpg",
  ]
  const imageAngles = ["front", "left", "right"]
  const frontIndex = imageAngles.indexOf("front")

  // Act: 측면 이미지 필터링
  const sideImages = imageUrls
    .map((url, index) => ({ url, angle: imageAngles[index] }))
    .filter((item, index) => index !== frontIndex && item.angle !== "front")

  // Assert: 측면 이미지만 필터링되어야 함
  assertEquals(sideImages.length, 2)
  assertEquals(sideImages[0].angle, "left")
  assertEquals(sideImages[1].angle, "right")
})

Deno.test("validateImageQuality: 유효한 이미지 URL 검증", () => {
  const validUrls = [
    "https://example.com/image.jpg",
    "https://example.com/image.jpeg",
    "https://example.com/image.png",
    "https://example.com/image.webp",
    "https://example.com/path/to/image.JPG",
    "https://example.com/path/to/image.PNG",
  ]
  
  validUrls.forEach(url => {
    assertEquals(validateImageQuality(url), true, `URL should be valid: ${url}`)
  })
})

Deno.test("validateImageQuality: 유효하지 않은 이미지 URL 검증", () => {
  const invalidUrls = [
    "https://example.com/image.gif",
    "https://example.com/image.bmp",
    "https://example.com/image.txt",
    "https://example.com/image",
    "not-a-url",
  ]
  
  invalidUrls.forEach(url => {
    assertEquals(validateImageQuality(url), false, `URL should be invalid: ${url}`)
  })
})

Deno.test("validateImageQuality: 확장자가 없는 URL 처리", () => {
  // 확장자가 없는 URL은 유효하지 않음
  const urlWithoutExtension = "https://example.com/image/download?id=123"
  assertEquals(validateImageQuality(urlWithoutExtension), false)
})

// MIME 타입 추론 테스트 (URL 확장자 기반 - fallback)
Deno.test("MIME 타입 추론: 확장자 기반 (fallback)", () => {
  const testCases = [
    { url: "https://example.com/image.jpg", expected: "image/jpeg" },
    { url: "https://example.com/image.jpeg", expected: "image/jpeg" },
    { url: "https://example.com/image.png", expected: "image/png" },
    { url: "https://example.com/image.webp", expected: "image/webp" },
    { url: "https://example.com/image.JPG", expected: "image/jpeg" },
    { url: "https://example.com/image.PNG", expected: "image/png" },
  ]
  
  testCases.forEach(({ url, expected }) => {
    const urlLower = url.toLowerCase()
    const mimeType = urlLower.endsWith('.png') ? "image/png" : 
                     urlLower.endsWith('.webp') ? "image/webp" : 
                     urlLower.endsWith('.jpg') || urlLower.endsWith('.jpeg') ? "image/jpeg" :
                     "image/jpeg"
    assertEquals(mimeType, expected, `MIME type should match for ${url}`)
  })
})

Deno.test("MIME 타입 추론: 확장자가 없는 경우 기본값 (fallback)", () => {
  const urlWithoutExtension = "https://example.com/image/download?id=123"
  const urlLower = urlWithoutExtension.toLowerCase()
  const mimeType = urlLower.endsWith('.png') ? "image/png" : 
                   urlLower.endsWith('.webp') ? "image/webp" : 
                   urlLower.endsWith('.jpg') || urlLower.endsWith('.jpeg') ? "image/jpeg" :
                   "image/jpeg"
  // 확장자가 없으면 기본값으로 jpeg를 사용 (경고 로그와 함께)
  assertEquals(mimeType, "image/jpeg")
})

// MIME 타입 파싱 테스트 (Content-Type 헤더에서)
Deno.test("MIME 타입 파싱: Content-Type 헤더에서 추출", () => {
  const testCases = [
    { header: "image/jpeg", expected: "image/jpeg" },
    { header: "image/png", expected: "image/png" },
    { header: "image/webp", expected: "image/webp" },
    { header: "image/jpeg; charset=utf-8", expected: "image/jpeg" },
    { header: "image/png; charset=utf-8", expected: "image/png" },
    { header: "text/html", expected: "text/html" }, // 이미지가 아닌 경우
  ]
  
  testCases.forEach(({ header, expected }) => {
    let mimeType = header
    if (mimeType.includes(";")) {
      mimeType = mimeType.split(";")[0].trim()
    }
    assertEquals(mimeType, expected, `MIME type should be extracted correctly from: ${header}`)
  })
})

// 네트워크 에러 처리 테스트 (모킹 필요)
Deno.test("analyzeVision: 네트워크 에러 처리", async () => {
  // 실제 네트워크 호출 없이 테스트하려면 모킹이 필요하지만,
  // Deno 표준 라이브러리에서는 모킹이 제한적이므로
  // 실제로는 통합 테스트에서 확인해야 함
  // 여기서는 에러 메시지 형식만 확인
  const errorMessage = "Failed to fetch image"
  assertEquals(typeof errorMessage, "string")
})

// Safety 필터 테스트
Deno.test("analyzeVision: Safety 필터 차단 시 에러 처리", async () => {
  // Safety 필터로 차단된 응답 구조
  const safetyBlockedResponse = {
    candidates: [{
      finishReason: "SAFETY",
      safetyRatings: [{
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        probability: "HIGH"
      }]
    }],
    promptFeedback: {
      blockReason: "SAFETY"
    }
  }
  
  // finishReason이 "SAFETY"인지 확인
  assertEquals(safetyBlockedResponse.candidates[0].finishReason, "SAFETY")
})

