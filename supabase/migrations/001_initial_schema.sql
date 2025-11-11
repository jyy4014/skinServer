-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  birth_date DATE,
  gender TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Treatments table
CREATE TABLE IF NOT EXISTS public.treatments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  benefits TEXT,
  cost NUMERIC(10, 2),
  recovery_time TEXT,
  risk_level TEXT,
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Skin analysis table
CREATE TABLE IF NOT EXISTS public.skin_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  result_summary TEXT,
  analysis_data JSONB,
  recommended_treatments JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_skin_analysis_user_id ON public.skin_analysis(user_id);
CREATE INDEX IF NOT EXISTS idx_skin_analysis_created_at ON public.skin_analysis(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skin_analysis ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users (성능 최적화)
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING ((select auth.uid()) = id);

-- RLS Policies for treatments (public read)
CREATE POLICY "Treatments are viewable by everyone"
  ON public.treatments FOR SELECT
  USING (true);

-- RLS Policies for skin_analysis (성능 최적화)
CREATE POLICY "Users can view own analysis"
  ON public.skin_analysis FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own analysis"
  ON public.skin_analysis FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own analysis"
  ON public.skin_analysis FOR UPDATE
  USING ((select auth.uid()) = user_id);

-- Insert sample treatments
INSERT INTO public.treatments (name, description, benefits, cost, recovery_time, risk_level, duration_minutes) VALUES
('프락셀 레이저', '레이저를 이용한 모공 및 잡티 개선 시술', '모공 축소, 잡티 제거, 피부결 개선', 200000, '3-7일', '중', 30),
('토닝 레이저', '피부톤 균일화를 위한 레이저 시술', '색소 침착 개선, 피부톤 균일화', 150000, '1-3일', '낮음', 20),
('리쥬란 힐러', '주름 개선 및 피부 탄력 향상', '주름 개선, 탄력 증진, 윤기 개선', 300000, '1-2일', '낮음', 30),
('아쿠아필', '수분 공급 및 피부 진정', '수분 공급, 진정 효과, 피부 장벽 강화', 80000, '없음', '낮음', 60),
('화학 필링', '각질 제거 및 피부 재생', '각질 제거, 모공 정리, 피부 재생', 100000, '3-5일', '중', 20)
ON CONFLICT DO NOTHING;

