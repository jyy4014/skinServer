-- 트렌드 점수 및 인기도 필드 추가
ALTER TABLE public.treatments 
ADD COLUMN IF NOT EXISTS trend_score DECIMAL(5,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS popularity_score DECIMAL(5,2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS search_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS click_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_trend_update TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 트렌드 점수 인덱스 추가 (정렬 성능 향상)
CREATE INDEX IF NOT EXISTS idx_treatments_trend_score ON public.treatments(trend_score DESC);
CREATE INDEX IF NOT EXISTS idx_treatments_popularity_score ON public.treatments(popularity_score DESC);

-- 초기 트렌드 점수 설정 (2025년 인기 시술 기준)
UPDATE public.treatments SET 
  trend_score = CASE 
    WHEN name LIKE '%리쥬란%' THEN 9.5
    WHEN name LIKE '%프락셀%' THEN 9.0
    WHEN name LIKE '%하이푸%' OR name LIKE '%HIFU%' THEN 8.5
    WHEN name LIKE '%IPL%' OR name LIKE '%토닝%' THEN 8.0
    WHEN name LIKE '%MTS%' OR name LIKE '%마이크로니들%' THEN 7.5
    WHEN name LIKE '%울쎄라%' THEN 7.0
    ELSE 5.0
  END,
  popularity_score = trend_score * 0.9,
  last_trend_update = NOW()
WHERE trend_score = 0.0;

