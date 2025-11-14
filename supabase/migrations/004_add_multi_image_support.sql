-- 다각도 이미지 지원을 위한 마이그레이션
-- image_urls, image_angles 컬럼 추가

-- skin_analysis 테이블에 image_urls, image_angles 컬럼 추가
ALTER TABLE public.skin_analysis 
ADD COLUMN IF NOT EXISTS image_urls JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS image_angles JSONB DEFAULT '[]'::jsonb;

-- 기존 데이터 마이그레이션 (image_url → image_urls)
UPDATE public.skin_analysis 
SET 
  image_urls = CASE 
    WHEN image_url IS NOT NULL THEN jsonb_build_array(image_url)
    ELSE '[]'::jsonb
  END,
  image_angles = CASE 
    WHEN image_url IS NOT NULL THEN jsonb_build_array('front')
    ELSE '[]'::jsonb
  END
WHERE image_urls IS NULL OR image_urls = '[]'::jsonb;

-- 인덱스 추가 (선택사항, 성능 최적화)
CREATE INDEX IF NOT EXISTS idx_skin_analysis_image_urls 
ON public.skin_analysis USING GIN (image_urls);

-- 코멘트 추가
COMMENT ON COLUMN public.skin_analysis.image_urls IS '분석에 사용된 이미지 URL 배열 (정면, 좌측, 우측)';
COMMENT ON COLUMN public.skin_analysis.image_angles IS '각 이미지의 촬영 각도 배열 (front, left, right)';

