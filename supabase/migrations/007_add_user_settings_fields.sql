-- 사용자 설정 필드 추가 마이그레이션

-- users 테이블에 설정 필드 추가
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS auto_delete_images BOOLEAN DEFAULT false;

-- 코멘트 추가
COMMENT ON COLUMN public.users.auto_delete_images IS '원본 사진 자동 삭제 설정';



