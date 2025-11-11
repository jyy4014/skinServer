// 이미지 검증 유틸리티 테스트 (TDD)
// Deno 표준 테스트 프레임워크 사용

import { assertEquals } from "jsr:@std/assert@^1.0.0"
import { validateImageQuality } from "../stageA-vision.ts"

Deno.test("validateImageQuality: 유효한 JPG URL", () => {
  // Arrange
  const validUrl = "https://example.com/image.jpg"

  // Act
  const result = validateImageQuality(validUrl)

  // Assert
  assertEquals(result, true)
})

Deno.test("validateImageQuality: 유효한 PNG URL", () => {
  // Arrange
  const validUrl = "https://example.com/image.png"

  // Act
  const result = validateImageQuality(validUrl)

  // Assert
  assertEquals(result, true)
})

Deno.test("validateImageQuality: 유효한 WebP URL", () => {
  // Arrange
  const validUrl = "https://example.com/image.webp"

  // Act
  const result = validateImageQuality(validUrl)

  // Assert
  assertEquals(result, true)
})

Deno.test("validateImageQuality: 대문자 확장자", () => {
  // Arrange
  const validUrl = "https://example.com/image.JPG"

  // Act
  const result = validateImageQuality(validUrl)

  // Assert
  assertEquals(result, true)
})

Deno.test("validateImageQuality: 잘못된 확장자", () => {
  // Arrange
  const invalidUrl = "https://example.com/image.gif"

  // Act
  const result = validateImageQuality(invalidUrl)

  // Assert
  assertEquals(result, false)
})

Deno.test("validateImageQuality: 잘못된 URL 형식", () => {
  // Arrange
  const invalidUrl = "not-a-valid-url"

  // Act
  const result = validateImageQuality(invalidUrl)

  // Assert
  assertEquals(result, false)
})

