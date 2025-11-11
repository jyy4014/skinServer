// Base64 인코딩 유틸리티 (표준 라이브러리 사용)
// Deno 표준 라이브러리 및 TDD 기반 구현

/**
 * Uint8Array를 Base64 문자열로 인코딩
 * @param data - 인코딩할 바이너리 데이터
 * @returns Base64 인코딩된 문자열
 * @throws {Error} 인코딩 실패 시
 */
export async function encodeToBase64(data: Uint8Array): Promise<string> {
  if (data.length === 0) {
    throw new Error("Base64 인코딩 결과가 비어있습니다.")
  }

  const maxGeminiSize = 20 * 1024 * 1024 // 20MB (Gemini API 제한)
  const safeChunkSize = 64 * 1024 // 64KB씩 처리 (메모리 안전)
  let binaryString = ""

  try {
    if (data.length <= 2 * 1024 * 1024) {
      // 2MB 이하: 직접 변환 (빠름)
      try {
        const array = Array.from(data)
        binaryString = String.fromCharCode.apply(null, array as any)
      } catch (error: any) {
        // apply 실패 시 반복문 사용 (스택 오버플로우 방지)
        for (let i = 0; i < data.length; i++) {
          binaryString += String.fromCharCode(data[i])
        }
      }
    } else {
      // 2MB 초과: 청크 단위로 문자열 생성 (메모리 안전)
      for (let i = 0; i < data.length; i += safeChunkSize) {
        const chunk = data.slice(i, i + safeChunkSize)
        for (let j = 0; j < chunk.length; j++) {
          binaryString += String.fromCharCode(chunk[j])
        }
      }
    }

    // 전체 바이너리 문자열을 한 번에 Base64로 인코딩 (올바른 패딩 보장)
    const base64 = btoa(binaryString)

    // 유효성 검증
    if (!validateBase64(base64)) {
      throw new Error("Base64 인코딩 결과가 유효하지 않습니다.")
    }

    // 크기 확인
    if (base64.length > maxGeminiSize) {
      throw new Error(
        `이미지가 너무 큽니다. (${Math.round(base64.length / 1024 / 1024)}MB) Gemini API는 20MB 이하의 이미지만 지원합니다.`
      )
    }

    return base64
  } catch (error: any) {
    throw new Error(
      `이미지 인코딩 실패: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

/**
 * Base64 문자열 유효성 검증
 * @param base64 - 검증할 Base64 문자열
 * @returns 유효하면 true, 그렇지 않으면 false
 */
export function validateBase64(base64: string): boolean {
  if (base64.length === 0) {
    return false
  }

  // Base64 문자열 유효성 검증 (알파벳, 숫자, +, /, = 만 포함)
  const invalidChars = base64.match(/[^A-Za-z0-9+/=]/g)
  if (invalidChars) {
    return false
  }

  // 패딩 위치 검증 (=는 끝에만 올 수 있음, 최대 2개)
  // 패딩은 문자열 끝에만 있어야 하며, 중간에 있으면 안 됨
  const paddingMatch = base64.match(/=+$/)
  const paddingCount = paddingMatch ? paddingMatch[0].length : 0
  if (paddingCount > 2) {
    return false
  }
  
  // 패딩이 중간에 있는지 확인 (=가 끝이 아닌 곳에 있으면 안 됨)
  const paddingIndex = base64.indexOf("=")
  if (paddingIndex !== -1 && paddingIndex < base64.length - paddingCount) {
    return false
  }

  // Base64 길이 검증 (전체 길이는 4의 배수여야 함)
  // Base64는 항상 4의 배수 길이를 가지며, 패딩을 포함한 전체 길이를 확인
  if (base64.length % 4 !== 0) {
    return false
  }

  return true
}

