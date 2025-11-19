/**
 * 이미지 리사이즈 유틸리티 (Deno Edge Functions)
 * 
 * 참고: Deno Edge Functions에서는 Sharp 같은 네이티브 라이브러리를 사용할 수 없습니다.
 * 대신 Canvas API나 Web API를 사용하거나, 외부 서비스를 활용해야 합니다.
 * 
 * 현재는 이미지 크기 검증만 수행하고, 실제 리사이즈는 클라이언트에서 처리합니다.
 * 향후 필요시 Cloudinary나 Imgix 같은 이미지 CDN을 활용할 수 있습니다.
 */

export interface ImageResizeOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'jpeg' | 'webp' | 'png'
}

export interface ImageMetadata {
  width: number
  height: number
  size: number
  mimeType: string
}

/**
 * 이미지 메타데이터 추출 (크기, MIME 타입)
 * 실제 리사이즈는 하지 않고 메타데이터만 확인
 */
export async function getImageMetadata(
  imageUrl: string
): Promise<ImageMetadata> {
  try {
    const response = await fetch(imageUrl, { method: 'HEAD' })
    
    // Content-Length 헤더에서 크기 확인
    const contentLength = response.headers.get('content-length')
    const size = contentLength ? parseInt(contentLength, 10) : 0
    
    // Content-Type에서 MIME 타입 확인
    const contentType = response.headers.get('content-type') || ''
    const mimeType = contentType.split(';')[0].trim()
    
    // 실제 이미지 데이터를 가져와서 크기 확인 (필요시)
    // 주의: 이는 추가 네트워크 요청이므로 필요한 경우에만 사용
    if (!contentLength || mimeType === 'application/octet-stream') {
      const fullResponse = await fetch(imageUrl)
      const arrayBuffer = await fullResponse.arrayBuffer()
      const size = arrayBuffer.byteLength
      
      // MIME 타입이 없으면 URL 확장자로 추론
      let detectedMimeType = mimeType
      if (!detectedMimeType || detectedMimeType === 'application/octet-stream') {
        const urlLower = imageUrl.toLowerCase()
        if (urlLower.endsWith('.png')) {
          detectedMimeType = 'image/png'
        } else if (urlLower.endsWith('.webp')) {
          detectedMimeType = 'image/webp'
        } else if (urlLower.endsWith('.jpg') || urlLower.endsWith('.jpeg')) {
          detectedMimeType = 'image/jpeg'
        } else {
          detectedMimeType = 'image/jpeg' // 기본값
        }
      }
      
      return {
        width: 0, // 실제 크기는 이미지 파싱 필요 (복잡하므로 생략)
        height: 0,
        size,
        mimeType: detectedMimeType,
      }
    }
    
    return {
      width: 0,
      height: 0,
      size,
      mimeType,
    }
  } catch (error) {
    console.error('Failed to get image metadata:', error)
    throw new Error(`이미지 메타데이터를 가져올 수 없습니다: ${error}`)
  }
}

/**
 * 이미지 크기 검증 및 최적화 권장사항
 * 
 * Deno Edge Functions에서는 실제 리사이즈가 어려우므로,
 * 클라이언트에서 리사이즈된 이미지를 받는 것이 가장 효율적입니다.
 */
export function validateImageSize(
  size: number,
  maxSize: number = 10 * 1024 * 1024 // 10MB
): { valid: boolean; recommendation?: string } {
  if (size > maxSize) {
    return {
      valid: false,
      recommendation: `이미지가 너무 큽니다 (${Math.round(size / 1024 / 1024)}MB). 클라이언트에서 리사이즈 후 다시 업로드해주세요.`,
    }
  }
  
  // 권장 크기: 1-3MB
  const recommendedMaxSize = 3 * 1024 * 1024 // 3MB
  if (size > recommendedMaxSize) {
    return {
      valid: true,
      recommendation: `이미지 크기를 줄이면 처리 속도가 향상됩니다. (현재: ${Math.round(size / 1024 / 1024)}MB, 권장: 1-3MB)`,
    }
  }
  
  return { valid: true }
}

/**
 * Base64 인코딩 전 이미지 크기 최적화 체크
 * 
 * Gemini API는 최대 20MB base64 인코딩된 이미지를 지원하지만,
 * 작은 이미지일수록 빠르고 비용 효율적입니다.
 */
export function checkImageOptimization(
  originalSize: number,
  estimatedBase64Size: number
): {
  optimized: boolean
  recommendation?: string
  estimatedCost?: string
} {
  const maxGeminiSize = 20 * 1024 * 1024 // 20MB
  const optimalSize = 2 * 1024 * 1024 // 2MB (base64 기준)
  
  if (estimatedBase64Size > maxGeminiSize) {
    return {
      optimized: false,
      recommendation: `이미지가 너무 큽니다. 클라이언트에서 리사이즈 후 다시 업로드해주세요.`,
    }
  }
  
  if (estimatedBase64Size > optimalSize) {
    return {
      optimized: true,
      recommendation: `이미지 크기를 줄이면 처리 속도와 비용이 개선됩니다.`,
    }
  }
  
  return { optimized: true }
}

/**
 * 이미지 리사이즈 권장사항 생성
 * 
 * 실제 리사이즈는 클라이언트에서 수행하고,
 * Edge Function에서는 검증과 권장사항만 제공합니다.
 */
export function getResizeRecommendation(
  metadata: ImageMetadata,
  targetMaxWidth: number = 1024
): string | null {
  // 실제 width/height는 파싱이 필요하므로 생략
  // 클라이언트에서 이미 리사이즈했다고 가정
  
  if (metadata.size > 3 * 1024 * 1024) {
    return `이미지 크기를 ${targetMaxWidth}px 이하로 리사이즈하면 처리 속도가 향상됩니다.`
  }
  
  return null
}

