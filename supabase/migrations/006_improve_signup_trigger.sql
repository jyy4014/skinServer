-- 회원가입 트리거 개선: 모든 필드 자동 저장

-- 기존 함수 수정
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    name,
    nickname,
    birth_date,
    gender,
    phone_number,
    country,
    signup_source,
    first_visit_at,
    last_visit_at,
    language,
    is_active
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'nickname', NEW.email),
    NEW.raw_user_meta_data->>'nickname',
    CASE 
      WHEN NEW.raw_user_meta_data->>'birth_date' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'birth_date')::DATE 
      ELSE NULL 
    END,
    COALESCE(NEW.raw_user_meta_data->>'gender', 'prefer_not_to_say'), -- NOT NULL 제약 조건
    COALESCE(NEW.raw_user_meta_data->>'phone_number', ''), -- NOT NULL 제약 조건
    COALESCE(NEW.raw_user_meta_data->>'country', 'KR'), -- NOT NULL 제약 조건
    COALESCE(NEW.raw_user_meta_data->>'signup_source', 'web'),
    NOW(),
    NOW(),
    COALESCE(NEW.raw_user_meta_data->>'language', 'ko'),
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    nickname = COALESCE(EXCLUDED.nickname, users.nickname),
    birth_date = COALESCE(EXCLUDED.birth_date, users.birth_date),
    gender = COALESCE(EXCLUDED.gender, users.gender),
    phone_number = COALESCE(EXCLUDED.phone_number, users.phone_number),
    country = COALESCE(EXCLUDED.country, users.country),
    signup_source = COALESCE(EXCLUDED.signup_source, users.signup_source),
    language = COALESCE(EXCLUDED.language, users.language),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;

-- 트리거는 이미 존재하므로 재생성 불필요
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW
--   EXECUTE FUNCTION public.handle_new_user();


