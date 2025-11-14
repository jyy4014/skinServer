// 단계 A: Vision AI - Google Gemini 1.5 Pro 연동
// Deno 형식으로 변환

import { encodeToBase64 } from "./utils/base64.ts"

export interface VisionAnalysis {
  skin_condition_scores: {
    pigmentation: number
    acne: number
    redness: number
    pores: number
    wrinkles: number
  }
  masks: Array<{
    label: string
    x: number
    y: number
    w: number
    h: number
  }>
  metrics: {
    area_pct_by_label: Record<string, number>
    color_deltaE?: number
  }
  confidence: number
  uncertainty_estimate: number
  model_version: string
  heatmap_url?: string
}

// 이미지 URL에서 이미지 데이터 가져오기 (Deno)
async function fetchImageAsBase64(imageUrl: string): Promise<{ base64: string; mimeType: string }> {
  try {
    console.log("Fetching image from URL:", imageUrl.substring(0, 100))
    const response = await fetch(imageUrl)
    if (!response.ok) {
      console.error(`Failed to fetch image: ${response.status} ${response.statusText}`)
      throw new Error(`Failed to fetch image: ${response.statusText}`)
    }
    
    // MIME 타입을 Response 헤더에서 읽기 (우선순위 1)
    let mimeType = response.headers.get("content-type") || ""
    // Content-Type에서 실제 MIME 타입만 추출 (예: "image/jpeg; charset=utf-8" -> "image/jpeg")
    if (mimeType.includes(";")) {
      mimeType = mimeType.split(";")[0].trim()
    }
    
    // 헤더에 MIME 타입이 없으면 URL 확장자로 추론 (우선순위 2)
    if (!mimeType || !mimeType.startsWith("image/")) {
      console.log("Content-Type header not found or invalid, inferring from URL extension")
      const urlLower = imageUrl.toLowerCase()
      if (urlLower.endsWith('.png')) {
        mimeType = "image/png"
      } else if (urlLower.endsWith('.webp')) {
        mimeType = "image/webp"
      } else if (urlLower.endsWith('.jpg') || urlLower.endsWith('.jpeg')) {
        mimeType = "image/jpeg"
      } else {
        // 기본값: JPEG (하지만 경고 로그 출력)
        console.warn(`Could not determine MIME type from URL or headers, defaulting to image/jpeg. URL: ${imageUrl.substring(0, 100)}`)
        mimeType = "image/jpeg"
      }
    }
    
    console.log("Detected MIME type:", mimeType)
    
    const arrayBuffer = await response.arrayBuffer()
    console.log("Image fetched, size:", arrayBuffer.byteLength, "bytes")
    
    // Deno에서 안전한 base64 인코딩
    // 큰 이미지도 안전하게 처리하기 위해 항상 청크 단위로 처리
    const uint8Array = new Uint8Array(arrayBuffer)
    
    // 이미지 크기 확인 (원본 이미지 10MB 제한)
    const maxImageSize = 10 * 1024 * 1024 // 10MB
    if (arrayBuffer.byteLength > maxImageSize) {
      throw new Error(`이미지가 너무 큽니다. (${Math.round(arrayBuffer.byteLength / 1024 / 1024)}MB) 최대 10MB까지 지원합니다.`)
    }
    
    // Gemini API 제한 확인 (Gemini 1.5 Pro는 최대 20MB base64 인코딩된 이미지 지원)
    // 원본 이미지 크기 확인 (base64는 약 33% 더 큼)
    const estimatedBase64Size = arrayBuffer.byteLength * 1.33
    const maxGeminiSize = 20 * 1024 * 1024 // 20MB (Gemini 1.5 Pro 제한)
    if (estimatedBase64Size > maxGeminiSize) {
      throw new Error(`이미지가 너무 큽니다. (예상 크기: ${Math.round(estimatedBase64Size / 1024 / 1024)}MB) Gemini API는 20MB 이하의 이미지만 지원합니다.`)
    }
    
    console.log(`Processing image: ${Math.round(arrayBuffer.byteLength / 1024 / 1024 * 100) / 100}MB (estimated base64: ${Math.round(estimatedBase64Size / 1024 / 1024 * 100) / 100}MB)`)
    
      // 표준 라이브러리 사용: Base64 인코딩 유틸리티 호출
      console.log(`Starting base64 encoding for ${uint8Array.length} bytes`)
      const base64 = await encodeToBase64(uint8Array)
      
      console.log("Image converted to base64, length:", base64.length, "bytes", `(${Math.round(base64.length / 1024 / 1024 * 100) / 100}MB)`)
      console.log("Base64 preview (first 100 chars):", base64.substring(0, 100))
      console.log("Base64 preview (last 100 chars):", base64.substring(base64.length - 100))
      console.log("Base64 encoding completed successfully")
      
      return { base64, mimeType }
  } catch (error) {
    console.error("Error fetching image:", error)
    throw new Error(`Error fetching image: ${error}`)
  }
}

// 이미지 품질 검증 (표준 라이브러리 사용)
export function validateImageQuality(imageUrl: string): boolean {
  try {
    const url = new URL(imageUrl)
    const validExtensions = [".jpg", ".jpeg", ".png", ".webp"]
    const pathname = url.pathname.toLowerCase()
    return validExtensions.some((ext) => pathname.endsWith(ext))
  } catch {
    return false
  }
}

// 이미지 품질 점수 계산 (0.0-1.0)
// 이미지 크기와 해상도를 기반으로 품질 점수 산출
function calculateImageQualityScore(imageSizeBytes: number, base64Length: number): number {
  // 최소 권장 크기: 100KB (너무 작으면 품질 낮음)
  const minSize = 100 * 1024 // 100KB
  // 이상적 크기: 1MB 이상
  const idealSize = 1024 * 1024 // 1MB
  
  if (imageSizeBytes < minSize) {
    // 100KB 미만: 매우 낮은 점수 (0.3-0.5)
    return Math.max(0.3, imageSizeBytes / minSize * 0.2)
  } else if (imageSizeBytes < idealSize) {
    // 100KB ~ 1MB: 선형 증가 (0.5-0.8)
    return 0.5 + ((imageSizeBytes - minSize) / (idealSize - minSize)) * 0.3
  } else {
    // 1MB 이상: 높은 점수 (0.8-1.0), 최대 5MB까지 완전 점수
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (imageSizeBytes >= maxSize) {
      return 1.0
    }
    return 0.8 + ((imageSizeBytes - idealSize) / (maxSize - idealSize)) * 0.2
  }
}

// 얼굴 감지 점수 계산 (0.0-1.0)
// masks와 area_pct_by_label을 기반으로 얼굴이 제대로 감지되었는지 판단
function calculateFaceDetectionScore(
  masks: Array<{ label: string; x: number; y: number; w: number; h: number }>,
  areaPctByLabel: Record<string, number>
): number {
  // masks가 비어있으면 얼굴 감지 실패
  if (!masks || masks.length === 0) {
    console.warn("No masks detected - face may not be visible")
    return 0.2 // 매우 낮은 점수
  }
  
  // 얼굴 영역이 너무 작으면 감지 실패
  const totalArea = masks.reduce((sum, mask) => sum + (mask.w * mask.h), 0)
  // 최소 얼굴 영역: 100x100 픽셀 (가정)
  const minFaceArea = 100 * 100
  if (totalArea < minFaceArea) {
    console.warn(`Face area too small: ${totalArea} pixels (minimum: ${minFaceArea})`)
    return 0.3
  }
  

  
  // area_pct_by_label이 비어있거나 합이 너무 작으면 문제
  const totalAreaPct = Object.values(areaPctByLabel).reduce((sum, val) => sum + val, 0)
  if (totalAreaPct < 0.01) { // 1% 미만
    console.warn(`Total detected area too small: ${(totalAreaPct * 100).toFixed(2)}%`)
    return 0.4
  }
  
  // 정상적인 얼굴 감지: 높은 점수
  // masks 개수와 영역 비율을 종합
  const maskCountScore = Math.min(1.0, masks.length / 3) // 최소 3개 이상 masks 권장
  const areaScore = Math.min(1.0, totalAreaPct * 10) // 10% 이상이면 만점
  
  return 0.5 + (maskCountScore * 0.25) + (areaScore * 0.25)
}

// 최종 confidence 계산
// 이미지 품질, 얼굴 감지, Gemini API confidence를 종합
function calculateFinalConfidence(
  imageQualityScore: number,
  faceDetectionScore: number,
  geminiConfidence: number | undefined,
  imageSizeBytes: number
): number {
  // 가중치 설정
  const weightImageQuality = 0.3 // 이미지 품질 30%
  const weightFaceDetection = 0.4 // 얼굴 감지 40% (가장 중요)
  const weightGeminiConfidence = 0.3 // Gemini API confidence 30%
  
  // Gemini confidence가 없으면 기본값 사용 (하지만 낮게 설정)
  const geminiConf = geminiConfidence ?? 0.6
  
  // 최종 confidence 계산
  let finalConfidence = 
    (imageQualityScore * weightImageQuality) +
    (faceDetectionScore * weightFaceDetection) +
    (geminiConf * weightGeminiConfidence)
  
  // 이미지가 너무 작으면 추가 페널티
  if (imageSizeBytes < 50 * 1024) { // 50KB 미만
    finalConfidence *= 0.7
    console.warn("Image too small, applying penalty to confidence")
  }
  
  // 최소값 보장 (너무 낮으면 0.2)
  finalConfidence = Math.max(0.2, finalConfidence)
  // 최대값 제한
  finalConfidence = Math.min(1.0, finalConfidence)
  
  console.log("=== Confidence Calculation ===")
  console.log(`Image Quality Score: ${(imageQualityScore * 100).toFixed(1)}%`)
  console.log(`Face Detection Score: ${(faceDetectionScore * 100).toFixed(1)}%`)
  console.log(`Gemini API Confidence: ${(geminiConf * 100).toFixed(1)}%`)
  console.log(`Final Confidence: ${(finalConfidence * 100).toFixed(1)}%`)
  
  return finalConfidence
}

// 단계 A: Vision AI 분석 (여러 이미지 지원)
export async function analyzeVision(
  imageUrls: string[],
  imageAngles: ('front' | 'left' | 'right')[],
  userId?: string,
  meta?: { camera?: string; orientation?: number }
): Promise<VisionAnalysis> {
  // 하위 호환성: 단일 이미지인 경우
  if (imageUrls.length === 1) {
    return analyzeVisionLegacy(imageUrls[0], userId, meta)
  }

  // 여러 이미지 분석 전략: 정면 이미지를 메인으로, 좌/우측은 보조 정보로 활용
  const frontIndex = imageAngles.indexOf('front')
  const frontImageUrl = frontIndex >= 0 ? imageUrls[frontIndex] : imageUrls[0]

  console.log(`Analyzing ${imageUrls.length} images. Main image: ${frontImageUrl} (angle: ${imageAngles[frontIndex] || 'front'})`)

  // 정면 이미지를 메인으로 분석
  const mainAnalysis = await analyzeVisionLegacy(frontImageUrl, userId, meta)

  // 좌/우측 이미지가 있으면 보조 분석 (선택적)
  const sideImages = imageUrls
    .map((url, index) => ({ url, angle: imageAngles[index] }))
    .filter((item, index) => index !== frontIndex && item.angle !== 'front')

  // 측면 이미지 분석 (병렬 처리, 선택적)
  if (sideImages.length > 0) {
    console.log(`Analyzing ${sideImages.length} side images for additional context`)
    try {
      const sideAnalyses = await Promise.all(
        sideImages.map(({ url, angle }) => 
          analyzeVisionLegacy(url, userId, meta).catch(err => {
            console.warn(`Side image analysis failed for ${angle}:`, err)
            return null
          })
        )
      )

      // 측면 분석 결과를 보조 정보로 활용 (예: 측면 주름, 색소 등)
      const validSideAnalyses = sideAnalyses.filter(a => a !== null) as VisionAnalysis[]
      
      if (validSideAnalyses.length > 0) {
        // 측면 분석 결과를 메인 분석에 통합 (가중 평균 또는 최대값)
        mainAnalysis.skin_condition_scores = {
          pigmentation: Math.max(
            mainAnalysis.skin_condition_scores.pigmentation,
            ...validSideAnalyses.map(a => a.skin_condition_scores.pigmentation)
          ),
          acne: Math.max(
            mainAnalysis.skin_condition_scores.acne,
            ...validSideAnalyses.map(a => a.skin_condition_scores.acne)
          ),
          redness: Math.max(
            mainAnalysis.skin_condition_scores.redness,
            ...validSideAnalyses.map(a => a.skin_condition_scores.redness)
          ),
          pores: Math.max(
            mainAnalysis.skin_condition_scores.pores,
            ...validSideAnalyses.map(a => a.skin_condition_scores.pores)
          ),
          wrinkles: Math.max(
            mainAnalysis.skin_condition_scores.wrinkles,
            ...validSideAnalyses.map(a => a.skin_condition_scores.wrinkles)
          ),
        }

        // Confidence는 메인 분석과 측면 분석의 평균 (측면 정보로 신뢰도 향상)
        const avgConfidence = (
          mainAnalysis.confidence + 
          validSideAnalyses.reduce((sum, a) => sum + a.confidence, 0) / validSideAnalyses.length
        ) / 2
        mainAnalysis.confidence = Math.min(1.0, avgConfidence * 1.1) // 측면 정보로 약간 향상

        // Masks 통합 (모든 이미지의 masks 합치기)
        mainAnalysis.masks = [
          ...mainAnalysis.masks,
          ...validSideAnalyses.flatMap(a => a.masks)
        ]

        console.log(`Integrated ${validSideAnalyses.length} side image analyses. Final confidence: ${(mainAnalysis.confidence * 100).toFixed(1)}%`)
      }
    } catch (err) {
      console.warn("Side image analysis failed, using main analysis only:", err)
    }
  }

  return mainAnalysis
}

// 레거시 함수 (단일 이미지 분석, 내부 사용)
async function analyzeVisionLegacy(
  imageUrl: string,
  userId?: string,
  meta?: { camera?: string; orientation?: number }
): Promise<VisionAnalysis> {
  // 환경 변수 확인
  const apiKey = Deno.env.get("GOOGLE_GEMINI_API_KEY")
  if (!apiKey) {
    console.error("GOOGLE_GEMINI_API_KEY is not set")
    throw new Error("GOOGLE_GEMINI_API_KEY 환경 변수가 설정되지 않았습니다. 관리자에게 문의해주세요.")
  }
  
  console.log("API Key found, length:", apiKey.length)

  // 이미지 품질 검증
  if (!validateImageQuality(imageUrl)) {
    throw new Error("Invalid image format or URL")
  }

  // Google Gemini API 호출 (REST API 직접 사용)
  let imageData: { base64: string; mimeType: string }
  let imageSizeBytes: number = 0
  try {
    imageData = await fetchImageAsBase64(imageUrl)
    // Base64 길이로 원본 이미지 크기 추정 (Base64는 약 33% 더 큼)
    imageSizeBytes = Math.round(imageData.base64.length / 1.33)
    console.log(`Image size estimated: ${Math.round(imageSizeBytes / 1024)}KB (from base64 length: ${imageData.base64.length})`)
  } catch (error) {
    console.error("Failed to fetch image:", error)
    throw new Error(`이미지를 가져올 수 없습니다: ${error instanceof Error ? error.message : String(error)}`)
  }

  // 프롬프트 구성
  const prompt = `You are an AI vision model for cosmetic skin analysis (non-medical).

### Task
1. Detect if the image has **exactly one clear human face**.
   Reject if:
   - No or multiple faces
   - Blurred, cartoon, or filtered image
   - Poor lighting or <50% visible face

If rejected, return:
{
  "status": "rejected",
  "reason": "no_valid_face_detected",
  "message_ko": "분석 가능한 얼굴이 감지되지 않았습니다. 밝은 곳에서 정면으로 다시 촬영해 주세요.",
  "confidence": 0.0
}

2. If valid, analyze:
   - pigmentation, acne, redness, pores, wrinkles  
   Each has score 0.0–1.0 and confidence 0.0–1.0.

### Output (JSON only)
{
  "status": "success",
  "face_detected": true,
  "skin_condition_scores": {
    "pigmentation": {"score":0.4,"confidence":0.8},
    "acne": {"score":0.2,"confidence":0.7},
    "redness": {"score":0.5,"confidence":0.8},
    "pores": {"score":0.4,"confidence":0.8},
    "wrinkles": {"score":0.3,"confidence":0.9}
  },
  "metrics": {
    "lighting_quality":"normal",
    "area_pct_by_label":{"pigmentation":0.12,"acne":0.03}
  },
  "confidence":0.83,
  "uncertainty_estimate":0.12
}

Do not include treatment or medical advice.

`

  try {
    // Gemini REST API 호출 (표준 라이브러리 사용)
    console.log("Calling Gemini API for vision analysis...")
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: imageData.mimeType,
                    data: imageData.base64,
                  },
                },
              ],
            },
          ],
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Gemini API error (${response.status}):`, errorText.substring(0, 2000))
      console.error("Request details:", {
        imageUrl: imageUrl.substring(0, 100),
        base64Length: imageData.base64.length,
        base64SizeMB: Math.round(imageData.base64.length / 1024 / 1024 * 100) / 100,
        base64Preview: imageData.base64.substring(0, 50) + "...",
        mimeType: imageData.mimeType,
        requestBodySize: JSON.stringify({
          contents: [{
            parts: [{
              inlineData: {
                data: imageData.base64.substring(0, 100) + "...",
                mimeType: imageData.mimeType,
              },
            }, { text: prompt }],
          }],
        }).length,
      })
      
      // 400 에러의 경우 상세 메시지 파싱 시도
      let errorMessage = `Gemini API error: ${response.status} ${response.statusText}`
      try {
        const errorJson = JSON.parse(errorText)
        console.error("Error JSON structure:", {
          hasError: !!errorJson.error,
          errorKeys: errorJson.error ? Object.keys(errorJson.error) : [],
          errorMessage: errorJson.error?.message,
          errorCode: errorJson.error?.code,
          errorStatus: errorJson.error?.status,
        })
        
        if (errorJson.error?.message) {
          errorMessage = `Gemini API error: ${errorJson.error.message}`
          console.error("Parsed error message:", errorJson.error.message)
        } else if (errorJson.message) {
          errorMessage = `Gemini API error: ${errorJson.message}`
          console.error("Parsed error message (root):", errorJson.message)
        }
      } catch (e) {
        // JSON 파싱 실패 시 원본 텍스트 사용
        console.error("Failed to parse error JSON:", e)
        if (errorText.length > 0) {
          errorMessage = `Gemini API error: ${errorText.substring(0, 500)}`
        }
      }
      
      throw new Error(errorMessage)
    }

    // 응답 본문 전체 로깅
    const responseText = await response.text()
    console.log("=== Gemini API Raw Response ===")
    console.log("Response status:", response.status, response.statusText)
    console.log("Response headers:", Object.fromEntries(response.headers.entries()))
    console.log("Response body length:", responseText.length, "bytes")
    console.log("Response body preview (first 1000 chars):", responseText.substring(0, 1000))
    
    // JSON 파싱
    let data: any
    try {
      data = JSON.parse(responseText)
      console.log("=== Gemini API Parsed Response ===")
      console.log("Full response JSON:", JSON.stringify(data, null, 2))
    } catch (parseError) {
      console.error("Failed to parse response as JSON:", parseError)
      console.error("Raw response text:", responseText)
      throw new Error(`Gemini API 응답을 파싱할 수 없습니다: ${parseError instanceof Error ? parseError.message : String(parseError)}`)
    }
    
    console.log("Gemini API response structure:", {
      hasCandidates: !!data.candidates,
      candidatesLength: data.candidates?.length || 0,
      hasContent: !!data.candidates?.[0]?.content,
      hasParts: !!data.candidates?.[0]?.content?.parts,
      partsLength: data.candidates?.[0]?.content?.parts?.length || 0,
      hasFinishReason: !!data.candidates?.[0]?.finishReason,
      finishReason: data.candidates?.[0]?.finishReason,
      hasSafetyRatings: !!data.candidates?.[0]?.safetyRatings,
      safetyRatings: data.candidates?.[0]?.safetyRatings,
      promptFeedback: data.promptFeedback,
    })
    
    // Safety check
    if (data.candidates?.[0]?.finishReason === "SAFETY") {
      console.error("Gemini API blocked due to safety concerns")
      console.error("Safety ratings:", JSON.stringify(data.candidates?.[0]?.safetyRatings, null, 2))
      console.error("Prompt feedback:", JSON.stringify(data.promptFeedback, null, 2))
      throw new Error("Gemini API blocked the request due to safety concerns")
    }
    
    const text = data.candidates[0]?.content?.parts[0]?.text || ""
    console.log("=== Gemini API Response Text ===")
    console.log("Response text length:", text.length, "characters")
    console.log("Response text preview (first 500 chars):", text.substring(0, 500))
    console.log("Response text full:", text)
    
    if (text.length === 0) {
      console.error("Gemini API returned empty text")
      console.error("Full response:", JSON.stringify(data, null, 2))
      throw new Error("Gemini API returned empty response")
    }

           // JSON 파싱
           let analysis: VisionAnalysis
           try {
             console.log("=== Extracting JSON from Response Text ===")
             const jsonMatch =
               text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/)
             const jsonText = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text
             console.log("Extracted JSON text length:", jsonText.length, "characters")
             console.log("Extracted JSON text preview (first 500 chars):", jsonText.substring(0, 500))
             console.log("Extracted JSON text full:", jsonText)
             
             const parsed = JSON.parse(jsonText)
             console.log("=== Parsed Analysis Result ===")
             console.log("Parsed JSON keys:", Object.keys(parsed))
             console.log("Full parsed JSON:", JSON.stringify(parsed, null, 2))

      // 이미지 품질 점수 계산
      const imageQualityScore = calculateImageQualityScore(imageSizeBytes, imageData.base64.length)
      
      // 얼굴 감지 점수 계산
      const masks = parsed.masks || []
      const areaPctByLabel = parsed.metrics?.area_pct_by_label || {}
      const faceDetectionScore = calculateFaceDetectionScore(masks, areaPctByLabel)
      
      // Gemini API confidence (있는 경우)
      const geminiConfidence = parsed.confidence
      
      // 최종 confidence 계산
      const finalConfidence = calculateFinalConfidence(
        imageQualityScore,
        faceDetectionScore,
        geminiConfidence,
        imageSizeBytes
      )
      
      // Uncertainty는 confidence의 반대 개념으로 계산 (confidence가 낮으면 uncertainty 높음)
      const finalUncertainty = Math.max(0.0, Math.min(1.0, 1.0 - finalConfidence))
      
      analysis = {
        skin_condition_scores: {
          pigmentation: parsed.skin_condition_scores?.pigmentation ?? 0,
          acne: parsed.skin_condition_scores?.acne ?? 0,
          redness: parsed.skin_condition_scores?.redness ?? 0,
          pores: parsed.skin_condition_scores?.pores ?? 0,
          wrinkles: parsed.skin_condition_scores?.wrinkles ?? 0,
        },
        masks: masks,
        metrics: {
          area_pct_by_label: areaPctByLabel,
          color_deltaE: parsed.metrics?.color_deltaE,
        },
        confidence: finalConfidence,
        uncertainty_estimate: finalUncertainty,
        model_version: "vision-v1-gemini-2.5-pro",
      }
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError)
      console.error("Response text:", text.substring(0, 500)) // 디버깅용
      throw new Error(`AI 분석 결과를 파싱할 수 없습니다. 응답 형식이 올바르지 않습니다: ${parseError instanceof Error ? parseError.message : String(parseError)}`)
    }

    return analysis
  } catch (error) {
    // 이미 에러인 경우 그대로 전달
    if (error instanceof Error) {
      console.error("Gemini API error:", error.message)
      throw error
    }
    console.error("Gemini API error:", error)
    console.error("Error details:", JSON.stringify(error, null, 2)) // 디버깅용
    throw new Error(`AI 분석 중 오류가 발생했습니다: ${String(error)}`)
  }
}

// 결정적(deterministic) 해시 함수 (이미지 URL 기반)
function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

// 결정적 랜덤 생성기 (seed 기반)
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

// 모의 데이터 (이미지 URL 기반으로 결정적 생성)
function getMockVisionAnalysis(imageUrl?: string): VisionAnalysis {
  // 이미지 URL이 있으면 해시하여 결정적 값 생성, 없으면 랜덤
  const seed = imageUrl ? simpleHash(imageUrl) : Date.now()
  
  const pigmentation = seededRandom(seed) * 0.5 + 0.3
  const acne = seededRandom(seed * 2) * 0.3 + 0.1
  const redness = seededRandom(seed * 3) * 0.2 + 0.05
  const pores = seededRandom(seed * 4) * 0.4 + 0.3
  const wrinkles = seededRandom(seed * 5) * 0.2 + 0.05

  return {
    skin_condition_scores: {
      pigmentation,
      acne,
      redness,
      pores,
      wrinkles,
    },
    masks: [
      {
        label: "pigmentation",
        x: Math.floor(seededRandom(seed * 6) * 100),
        y: Math.floor(seededRandom(seed * 7) * 100),
        w: Math.floor(seededRandom(seed * 8) * 50) + 30,
        h: Math.floor(seededRandom(seed * 9) * 50) + 30,
      },
    ],
    metrics: {
      area_pct_by_label: {
        pigmentation: pigmentation * 0.15,
        acne: acne * 0.1,
        redness: redness * 0.08,
        pores: pores * 0.12,
        wrinkles: wrinkles * 0.05,
      },
      color_deltaE: seededRandom(seed * 10) * 5 + 3,
    },
    confidence: seededRandom(seed * 11) * 0.2 + 0.7,
    uncertainty_estimate: seededRandom(seed * 12) * 0.2 + 0.1,
    model_version: "vision-v1-mock",
  }
}

