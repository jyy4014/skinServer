'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Upload, Loader2, Camera } from 'lucide-react'
import Link from 'next/link'

export default function AnalyzePage() {
  const router = useRouter()
  const supabase = createClient()
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<any>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다.')
      return
    }

    setImage(file)
    setError(null)
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleAnalyze = async () => {
    if (!image) {
      setError('이미지를 선택해주세요.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // 1. 이미지 업로드
      const fileExt = image.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      const filePath = `skin-images/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('skin-images')
        .upload(filePath, image, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      // 2. 이미지 URL 가져오기
      const {
        data: { publicUrl },
      } = supabase.storage.from('skin-images').getPublicUrl(filePath)

      // 3. AI 분석 API 호출 (백엔드 서버)
      const { data: { session } } = await supabase.auth.getSession()
      const accessToken = session?.access_token

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: publicUrl,
          user_id: user.id,
          access_token: accessToken,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '분석 중 오류가 발생했습니다.')
      }

      const result = await response.json()

      // 4. 결과를 DB에 저장 (백엔드 서버)
      const saveResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/analyze/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          image_url: publicUrl,
          result_summary: result.summary,
          analysis_data: result.analysis,
          recommended_treatments: result.recommendations,
          access_token: accessToken,
        }),
      })

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json()
        throw new Error(errorData.error || '저장 중 오류가 발생했습니다.')
      }

      const saveResult = await saveResponse.json()

      setAnalysisResult({
        ...result,
        id: saveResult.data.id,
      })
    } catch (err: any) {
      setError(err.message || '분석 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/home"
          className="text-gray-600 hover:text-gray-900 mb-6 inline-block"
        >
          ← 뒤로가기
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          피부 분석하기
        </h1>

        {!analysisResult ? (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                {error}
              </div>
            )}

            {!preview ? (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-pink-500 transition-colors">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center">
                      <Camera className="w-8 h-8 text-pink-600" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900 mb-2">
                        사진을 업로드하세요
                      </p>
                      <p className="text-gray-600">
                        얼굴이 잘 보이는 사진을 선택해주세요
                      </p>
                    </div>
                    <button className="px-6 py-3 bg-pink-500 text-white rounded-lg font-semibold hover:bg-pink-600 transition-colors">
                      파일 선택
                    </button>
                  </div>
                </label>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative rounded-xl overflow-hidden bg-gray-100">
                  <img
                    src={preview}
                    alt="업로드된 이미지"
                    className="w-full h-auto max-h-96 object-contain mx-auto"
                  />
                </div>
                <div className="flex gap-4">
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <div className="border-2 border-gray-300 rounded-lg p-4 text-center hover:border-pink-500 transition-colors">
                      <Upload className="w-5 h-5 mx-auto mb-2 text-gray-600" />
                      <span className="text-sm text-gray-700">다른 사진 선택</span>
                    </div>
                  </label>
                  <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        분석 중...
                      </>
                    ) : (
                      '분석 시작하기'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                분석 완료!
              </h2>
              <p className="text-gray-600">당신의 피부 상태를 확인해보세요</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-xl overflow-hidden bg-gray-100">
                <img
                  src={preview || ''}
                  alt="분석 이미지"
                  className="w-full h-auto"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    분석 요약
                  </h3>
                  <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                    {analysisResult.summary}
                  </p>
                </div>

                {analysisResult.analysis && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      상세 분석
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(analysisResult.analysis).map(
                        ([key, value]: [string, any]) => (
                          <div
                            key={key}
                            className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"
                          >
                            <span className="text-gray-700 capitalize">
                              {key === 'pores'
                                ? '모공'
                                : key === 'acne'
                                  ? '여드름'
                                  : key === 'tone'
                                    ? '피부톤'
                                    : key === 'spots'
                                      ? '잡티'
                                      : key}
                            </span>
                            <span className="font-semibold text-gray-900">
                              {value}/100
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                추천 시술
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                {analysisResult.recommendations?.map(
                  (rec: any, idx: number) => (
                    <Link
                      key={idx}
                      href={`/treatments/${idx + 1}`}
                      className="border-2 border-gray-200 rounded-lg p-4 hover:border-pink-500 hover:shadow-md transition-all"
                    >
                      <h4 className="font-semibold text-gray-900 mb-2">
                        {rec.name}
                      </h4>
                      <p className="text-sm text-gray-600">{rec.reason}</p>
                    </Link>
                  )
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Link
                href="/home"
                className="flex-1 text-center py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                홈으로
              </Link>
              <Link
                href={`/analysis/${analysisResult.id}`}
                className="flex-1 text-center py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                자세히 보기
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

