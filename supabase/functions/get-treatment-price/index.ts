// 가격 조회 Edge Function
// Google Search API를 통해 시술별 평균 가격 조회

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PriceSearchResult {
  treatment_name: string
  cost_range?: {
    min: number
    max: number
    currency: string
  }
  source?: string
  confidence?: number
}

serve(async (req) => {
  // CORS preflight 처리
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { treatment_name } = await req.json()

    if (!treatment_name) {
      return new Response(
        JSON.stringify({ error: 'treatment_name is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Google Gemini API를 사용하여 가격 정보 검색
    const geminiApiKey = Deno.env.get('GOOGLE_GEMINI_API_KEY')
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: 'GOOGLE_GEMINI_API_KEY is not set' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // 검색 프롬프트 구성
    const searchPrompt = `You are a price research assistant. Search for the average price range of "${treatment_name}" cosmetic laser treatment in South Korea (2024-2025).

Return ONLY a JSON object with this format:
{
  "cost_range": {
    "min": 100000,
    "max": 200000,
    "currency": "KRW"
  },
  "source": "brief description of where this price range comes from",
  "confidence": 0.8
}

Requirements:
- Price should be in Korean Won (KRW)
- Price range should reflect 2024-2025 Korean market average
- Min and max should be realistic based on actual clinic prices
- Confidence should be 0.0-1.0 based on how reliable the information is
- If you cannot find reliable information, set confidence to 0.0 and return null for cost_range

Output strictly JSON only (no markdown, no code blocks, no explanations).`

    console.log(`Searching price for: ${treatment_name}`)

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: searchPrompt }],
            },
          ],
          generationConfig: {
            temperature: 0.1, // 매우 낮은 온도로 일관성 있는 결과
            topK: 20,
            topP: 0.8,
            maxOutputTokens: 256,
          },
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Gemini API error: ${response.status}`, errorText)
      throw new Error(`Price search API error: ${response.status}`)
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    // JSON 추출
    let priceResult: PriceSearchResult = {
      treatment_name,
      confidence: 0,
    }

    try {
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/)
      const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text
      const parsed = JSON.parse(jsonText)

      if (parsed.cost_range && parsed.confidence > 0) {
        priceResult = {
          treatment_name,
          cost_range: {
            min: Math.round(parsed.cost_range.min),
            max: Math.round(parsed.cost_range.max),
            currency: parsed.cost_range.currency || 'KRW',
          },
          source: parsed.source || 'AI search',
          confidence: Math.max(0, Math.min(1, parsed.confidence || 0)),
        }
      }
    } catch (parseError) {
      console.error('Failed to parse price search result:', parseError)
      // 파싱 실패 시 기본값 반환
    }

    return new Response(JSON.stringify(priceResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Price search error:', error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

