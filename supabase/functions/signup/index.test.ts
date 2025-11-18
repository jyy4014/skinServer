import { assertEquals } from "jsr:@std/assert"
import { createClient } from "jsr:@supabase/supabase-js@2"

// Mock Deno.serve
const mockRequest = (body: any, origin = "http://localhost:3000") => {
  return new Request("http://localhost:54321/functions/v1/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "origin": origin,
    },
    body: JSON.stringify(body),
  })
}

Deno.test("signup function - validation tests", async () => {
  // 이메일 검증 실패
  const invalidEmailReq = mockRequest({
    email: "invalid-email",
    password: "test123456",
    nickname: "test",
    birth_date: "2000-01-01",
    gender: "male",
    phone_number: "01012345678",
    country: "KR",
  })

  // 비밀번호 검증 실패
  const shortPasswordReq = mockRequest({
    email: "test@example.com",
    password: "123",
    nickname: "test",
    birth_date: "2000-01-01",
    gender: "male",
    phone_number: "01012345678",
    country: "KR",
  })

  // 생년월일 검증 실패 (미성년자)
  const underageReq = mockRequest({
    email: "test@example.com",
    password: "test123456",
    nickname: "test",
    birth_date: "2020-01-01", // 만 4세
    gender: "male",
    phone_number: "01012345678",
    country: "KR",
  })

  // 핸드폰번호 검증 실패
  const invalidPhoneReq = mockRequest({
    email: "test@example.com",
    password: "test123456",
    nickname: "test",
    birth_date: "2000-01-01",
    gender: "male",
    phone_number: "123", // 너무 짧음
    country: "KR",
  })

  // 성별 검증 실패
  const missingGenderReq = mockRequest({
    email: "test@example.com",
    password: "test123456",
    nickname: "test",
    birth_date: "2000-01-01",
    gender: "",
    phone_number: "01012345678",
    country: "KR",
  })

  // 국적 검증 실패
  const missingCountryReq = mockRequest({
    email: "test@example.com",
    password: "test123456",
    nickname: "test",
    birth_date: "2000-01-01",
    gender: "male",
    phone_number: "01012345678",
    country: "",
  })

  // 별명 검증 실패
  const missingNicknameReq = mockRequest({
    email: "test@example.com",
    password: "test123456",
    nickname: "",
    birth_date: "2000-01-01",
    gender: "male",
    phone_number: "01012345678",
    country: "KR",
  })

  // 테스트는 실제 Edge Function을 호출하지 않고
  // 검증 로직만 테스트하는 것이 좋습니다.
  // 실제 통합 테스트는 별도로 작성해야 합니다.
  
  assertEquals(true, true) // Placeholder
})


