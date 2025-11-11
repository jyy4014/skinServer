// Base64 인코딩 유틸리티 테스트 (TDD)
// Deno 표준 테스트 프레임워크 사용

import { assertEquals, assertThrows } from "jsr:@std/assert@^1.0.0"
import { encodeToBase64, validateBase64 } from "./base64.ts"

Deno.test("encodeToBase64: 작은 이미지 (2MB 이하) 인코딩", async () => {
  // Arrange: 작은 테스트 데이터 생성 (1KB)
  const testData = new Uint8Array(1024)
  for (let i = 0; i < testData.length; i++) {
    testData[i] = i % 256
  }

  // Act
  const result = await encodeToBase64(testData)

  // Assert
  assertEquals(typeof result, "string")
  assertEquals(result.length > 0, true)
  assertEquals(validateBase64(result), true)
})

Deno.test("encodeToBase64: 큰 이미지 (2MB 초과) 인코딩", async () => {
  // Arrange: 큰 테스트 데이터 생성 (3MB)
  const testData = new Uint8Array(3 * 1024 * 1024)
  for (let i = 0; i < testData.length; i++) {
    testData[i] = i % 256
  }

  // Act
  const result = await encodeToBase64(testData)

  // Assert
  assertEquals(typeof result, "string")
  assertEquals(result.length > 0, true)
  assertEquals(validateBase64(result), true)
})

Deno.test("encodeToBase64: 빈 배열 처리", async () => {
  // Arrange
  const testData = new Uint8Array(0)

  // Act & Assert
  let errorThrown = false
  try {
    await encodeToBase64(testData)
  } catch (error) {
    errorThrown = true
    assertEquals(error instanceof Error, true)
    if (error instanceof Error) {
      assertEquals(
        error.message.includes("Base64 인코딩 결과가 비어있습니다"),
        true
      )
    }
  }
  assertEquals(errorThrown, true)
})

Deno.test("validateBase64: 유효한 Base64 문자열", () => {
  // Arrange
  const validBase64 = "SGVsbG8gV29ybGQ=" // "Hello World"

  // Act
  const result = validateBase64(validBase64)

  // Assert
  assertEquals(result, true)
})

Deno.test("validateBase64: 잘못된 문자 포함", () => {
  // Arrange
  const invalidBase64 = "SGVsbG8gV29ybGQ!@#"

  // Act & Assert
  assertEquals(validateBase64(invalidBase64), false)
})

Deno.test("validateBase64: 길이가 4의 배수가 아님", () => {
  // Arrange
  const invalidBase64 = "SGVsbG8gV29ybG" // 길이 15 (4의 배수 아님)

  // Act & Assert
  assertEquals(validateBase64(invalidBase64), false)
})

Deno.test("validateBase64: 패딩이 중간에 위치", () => {
  // Arrange
  const invalidBase64 = "SGVsbG8=V29ybGQ=" // 패딩이 중간에

  // Act & Assert
  assertEquals(validateBase64(invalidBase64), false)
})

Deno.test("encodeToBase64: Base64 인코딩 결과가 올바른 형식", async () => {
  // Arrange: 알려진 입력과 출력
  const testData = new TextEncoder().encode("Hello World")
  const expectedBase64 = "SGVsbG8gV29ybGQ="

  // Act
  const result = await encodeToBase64(testData)

  // Assert
  assertEquals(result, expectedBase64)
  assertEquals(validateBase64(result), true)
})

Deno.test("encodeToBase64: 다양한 크기의 데이터 처리", async () => {
  const sizes = [1, 100, 1024, 64 * 1024, 2 * 1024 * 1024, 3 * 1024 * 1024]

  for (const size of sizes) {
    // Arrange
    const testData = new Uint8Array(size)
    for (let i = 0; i < testData.length; i++) {
      testData[i] = i % 256
    }

    // Act
    const result = await encodeToBase64(testData)

    // Assert
    assertEquals(typeof result, "string")
    assertEquals(result.length > 0, true)
    assertEquals(validateBase64(result), true)
  }
})

