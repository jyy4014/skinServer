import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
}

interface SignupRequest {
  email: string
  password: string
  nickname: string
  birth_date: string
  gender: string
  phone_number: string
  country: string
}

/**
 * 생년월일 검증 (만 13세 이상)
 */
function validateAge(birthDate: string): boolean {
  if (!birthDate) return false
  const birth = new Date(birthDate)
  const today = new Date()
  const age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return age - 1 >= 13
  }
  return age >= 13
}

/**
 * 핸드폰번호 검증 (최소 10자리)
 */
function validatePhoneNumber(phoneNumber: string): boolean {
  const numbers = phoneNumber.replace(/\D/g, '')
  return numbers.length >= 10
}

/**
 * 이메일 검증
 */
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 비밀번호 검증 (최소 6자)
 */
function validatePassword(password: string): boolean {
  return password.length >= 6
}

Deno.serve(async (req) => {
  // CORS preflight 처리
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const {
      email,
      password,
      nickname,
      birth_date,
      gender,
      phone_number,
      country,
    }: SignupRequest = await req.json()

    // 서버에서 검증 (보안)
    if (!email || !validateEmail(email)) {
      return new Response(
        JSON.stringify({ error: "유효한 이메일 주소를 입력해주세요." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    if (!password || !validatePassword(password)) {
      return new Response(
        JSON.stringify({ error: "비밀번호는 최소 6자 이상이어야 합니다." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    if (!birth_date || !validateAge(birth_date)) {
      return new Response(
        JSON.stringify({ error: "만 13세 이상만 가입할 수 있습니다." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    if (!gender) {
      return new Response(
        JSON.stringify({ error: "성별을 선택해주세요." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // 핸드폰번호 정규화 (숫자만)
    const phoneNumbers = phone_number.replace(/\D/g, '')
    if (!validatePhoneNumber(phoneNumbers)) {
      return new Response(
        JSON.stringify({ error: "올바른 핸드폰번호를 입력해주세요." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    if (!country) {
      return new Response(
        JSON.stringify({ error: "국적을 선택해주세요." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    if (!nickname || !nickname.trim()) {
      return new Response(
        JSON.stringify({ error: "별명을 입력해주세요." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    if (nickname.length > 20) {
      return new Response(
        JSON.stringify({ error: "별명은 20자 이내로 입력해주세요." }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // Supabase 클라이언트 생성 (service role로 생성하여 관리자 권한 사용)
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Supabase Auth 회원가입
    const origin = req.headers.get("origin") || ""
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        data: {
          nickname: nickname.trim(),
          birth_date,
          gender,
          phone_number: phoneNumbers,
          country,
        },
      },
    })

    if (authError) {
      console.error("Sign up error:", authError)
      
      // 에러 메시지 분류
      let errorMessage = "회원가입 중 오류가 발생했습니다."
      if (authError.message.includes("Email address") && authError.message.includes("invalid")) {
        errorMessage = "이메일 주소가 유효하지 않습니다. 실제 이메일 주소를 사용해주세요."
      } else if (authError.message.includes("already registered")) {
        errorMessage = "이미 가입된 이메일입니다."
      } else {
        errorMessage = authError.message || errorMessage
      }

      return new Response(
        JSON.stringify({ error: errorMessage }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({ error: "회원가입에 실패했습니다." }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // 2. 트리거(handle_new_user)가 자동으로 public.users에 모든 필드를 저장합니다.
    // user_meta_data에 전달한 데이터가 트리거를 통해 자동으로 저장되므로
    // 별도의 upsert 작업이 필요 없습니다.

    // 3. 응답 반환
    return new Response(
      JSON.stringify({
        status: "success",
        user: {
          id: authData.user.id,
          email: authData.user.email,
          requires_email_confirmation: !authData.session,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  } catch (error) {
    console.error("Signup function error:", error)
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})


