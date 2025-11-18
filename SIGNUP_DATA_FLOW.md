# 회원가입 데이터 저장 흐름 분석

## 현재 데이터 저장 방식

### ✅ **클라이언트에서 Supabase로 직접 저장** (서버 없음)

회원가입 시 데이터는 **별도의 백엔드 서버를 거치지 않고**, 클라이언트에서 **Supabase로 직접 저장**됩니다.

---

## 저장 흐름

### Step 1: Supabase Auth에 사용자 생성
```typescript
// SignupForm.tsx:164
await supabase.auth.signUp({
  email: formData.email,
  password: formData.password,
  options: {
    data: {
      nickname: formData.nickname,
      birth_date: formData.birthDate,
      gender: formData.gender,
      phone_number: phoneNumbers,
      country: formData.country,
    },
  },
})
```

**저장 위치**: `auth.users` 테이블 (Supabase Auth 서버)
- 이메일, 비밀번호는 `auth.users`에 저장
- `user_metadata`에 추가 정보 저장 (nickname, birth_date 등)

---

### Step 2: 트리거로 자동 프로필 생성
```sql
-- 002_storage_and_triggers.sql:40-56
CREATE OR REPLACE FUNCTION public.handle_new_user()
-- auth.users에 INSERT되면 자동으로 public.users에 기본 레코드 생성
```

**저장 위치**: `public.users` 테이블 (Supabase Database)
- 트리거가 자동으로 `public.users`에 기본 레코드 생성
- `id`, `email`, `name`만 저장 (기본값)

---

### Step 3: 클라이언트에서 추가 정보 저장
```typescript
// SignupForm.tsx:199-217
await supabase
  .from('users')
  .upsert({
    id: authData.user.id,
    email: formData.email,
    nickname: formData.nickname,
    birth_date: formData.birthDate,
    gender: formData.gender,
    phone_number: phoneNumbers,
    country: formData.country,
    signup_source: 'web',
    first_visit_at: new Date().toISOString(),
    last_visit_at: new Date().toISOString(),
    language: 'ko',
    is_active: true,
  })
```

**저장 위치**: `public.users` 테이블 (Supabase Database)
- 트리거로 생성된 레코드를 `upsert`로 업데이트
- 추가 필드들 (nickname, birth_date, gender, phone_number, country 등) 저장

---

## 아키텍처 다이어그램

```
[클라이언트 브라우저]
    │
    ├─ 1. supabase.auth.signUp()
    │   └─▶ [Supabase Auth 서버]
    │       └─▶ auth.users 테이블에 저장
    │
    ├─ 2. 트리거 자동 실행
    │   └─▶ [Supabase Database]
    │       └─▶ public.users 테이블에 기본 레코드 생성
    │
    └─ 3. supabase.from('users').upsert()
        └─▶ [Supabase Database]
            └─▶ public.users 테이블 업데이트 (추가 정보)
```

---

## 보안 및 권한

### RLS (Row Level Security) 정책
```sql
-- 사용자는 자신의 프로필만 조회/수정 가능
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);
```

**보안**:
- ✅ 클라이언트는 `anon` 키만 사용 (제한된 권한)
- ✅ RLS로 사용자는 자신의 데이터만 접근 가능
- ✅ 인증 토큰이 자동으로 포함되어 권한 검증

---

## 문제점 및 개선 사항

### 현재 문제
1. **이중 저장**: 트리거로 기본 레코드 생성 → 클라이언트에서 upsert
2. **트리거와 클라이언트 로직 중복**: 트리거가 기본 레코드를 만들지만, 클라이언트에서 다시 upsert

### 개선 방안

#### 옵션 1: 트리거 활용 (권장)
트리거에서 모든 필드를 저장하도록 수정:
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id, email, name,
    nickname, birth_date, gender, phone_number, country,
    signup_source, first_visit_at, last_visit_at, language, is_active
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'nickname',
    (NEW.raw_user_meta_data->>'birth_date')::DATE,
    NEW.raw_user_meta_data->>'gender',
    NEW.raw_user_meta_data->>'phone_number',
    NEW.raw_user_meta_data->>'country',
    'web',
    NOW(),
    NOW(),
    'ko',
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    nickname = EXCLUDED.nickname,
    birth_date = EXCLUDED.birth_date,
    gender = EXCLUDED.gender,
    phone_number = EXCLUDED.phone_number,
    country = EXCLUDED.country;
  RETURN NEW;
END;
$$;
```

그러면 클라이언트에서 `upsert` 호출 불필요:
```typescript
// Step 2 제거 가능
// 트리거가 모든 정보를 자동으로 저장
```

#### 옵션 2: 클라이언트에서만 저장
트리거를 제거하고 클라이언트에서만 저장:
- 트리거 제거
- 클라이언트에서 `upsert`만 사용

---

## 결론

**현재 상태**: 
- ✅ 클라이언트에서 Supabase로 직접 저장 (서버 없음)
- ⚠️ 이중 저장 (트리거 + 클라이언트 upsert)

**권장 개선**:
- 트리거를 활용하여 모든 필드를 자동 저장
- 클라이언트에서 `upsert` 호출 제거 (트리거가 처리)

---

**참고**: Supabase는 서버리스 아키텍처이므로, 별도의 Express.js 서버 없이도 클라이언트에서 직접 데이터베이스에 접근할 수 있습니다. RLS 정책으로 보안이 보장됩니다.


