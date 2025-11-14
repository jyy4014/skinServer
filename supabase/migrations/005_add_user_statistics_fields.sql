-- 사용자 통계 및 마케팅 분석 필드 추가 마이그레이션

-- users 테이블에 통계 필드 추가
ALTER TABLE public.users
-- 기본 활동 통계
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS analysis_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS signup_source TEXT, -- 'web', 'mobile', 'google', 'email'
ADD COLUMN IF NOT EXISTS skin_type TEXT, -- '건성', '지성', '복합성', '민감성', '정상'
ADD COLUMN IF NOT EXISTS main_concerns JSONB DEFAULT '[]'::jsonb, -- ['잡티', '주름', '모공', '색소', '홍조', '트러블']
ADD COLUMN IF NOT EXISTS preferred_treatments JSONB DEFAULT '[]'::jsonb, -- 관심 시술 배열
ADD COLUMN IF NOT EXISTS first_analysis_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_analysis_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS notification_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
-- 마케팅 분석: UTM 파라미터
ADD COLUMN IF NOT EXISTS utm_source TEXT, -- 'google', 'naver', 'facebook', 'direct'
ADD COLUMN IF NOT EXISTS utm_medium TEXT, -- 'cpc', 'email', 'social', 'organic'
ADD COLUMN IF NOT EXISTS utm_campaign TEXT, -- 캠페인명
ADD COLUMN IF NOT EXISTS utm_term TEXT, -- 키워드 (검색 광고용)
ADD COLUMN IF NOT EXISTS utm_content TEXT, -- 광고 콘텐츠 ID
-- 마케팅 분석: 유입 경로
ADD COLUMN IF NOT EXISTS referrer_url TEXT, -- 리퍼러 URL
ADD COLUMN IF NOT EXISTS landing_page TEXT, -- 첫 방문 페이지
-- 마케팅 분석: 디바이스 정보
ADD COLUMN IF NOT EXISTS device_type TEXT, -- 'mobile', 'tablet', 'desktop'
ADD COLUMN IF NOT EXISTS device_brand TEXT, -- 'iPhone', 'Samsung' 등
ADD COLUMN IF NOT EXISTS os_name TEXT, -- 'iOS', 'Android', 'Windows' 등
ADD COLUMN IF NOT EXISTS os_version TEXT, -- OS 버전
ADD COLUMN IF NOT EXISTS browser_name TEXT, -- 'Chrome', 'Safari' 등
ADD COLUMN IF NOT EXISTS browser_version TEXT, -- 브라우저 버전
ADD COLUMN IF NOT EXISTS screen_resolution TEXT, -- '1920x1080' 등
-- 마케팅 분석: 지역 정보 (선택사항)
ADD COLUMN IF NOT EXISTS country TEXT, -- 국가 코드 (KR, US 등)
ADD COLUMN IF NOT EXISTS region TEXT, -- 지역/도시 (서울, 부산 등)
ADD COLUMN IF NOT EXISTS timezone TEXT, -- 시간대 (Asia/Seoul 등)
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'ko', -- 언어 설정
-- 마케팅 분석: 사용자 행동
ADD COLUMN IF NOT EXISTS first_visit_at TIMESTAMP WITH TIME ZONE, -- 첫 방문 날짜
ADD COLUMN IF NOT EXISTS last_visit_at TIMESTAMP WITH TIME ZONE, -- 마지막 방문 날짜
ADD COLUMN IF NOT EXISTS session_count INTEGER DEFAULT 0, -- 총 세션 수
ADD COLUMN IF NOT EXISTS page_view_count INTEGER DEFAULT 0, -- 총 페이지뷰 수
ADD COLUMN IF NOT EXISTS total_time_spent INTEGER DEFAULT 0, -- 총 체류 시간 (초)
ADD COLUMN IF NOT EXISTS conversion_events JSONB DEFAULT '{}'::jsonb; -- 전환 이벤트 기록

-- 인덱스 추가 (통계 쿼리 성능 향상)
CREATE INDEX IF NOT EXISTS idx_users_last_login_at ON public.users(last_login_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_signup_source ON public.users(signup_source);
CREATE INDEX IF NOT EXISTS idx_users_skin_type ON public.users(skin_type);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at DESC);
-- 마케팅 분석 인덱스
CREATE INDEX IF NOT EXISTS idx_users_utm_source ON public.users(utm_source);
CREATE INDEX IF NOT EXISTS idx_users_utm_campaign ON public.users(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_users_device_type ON public.users(device_type);
CREATE INDEX IF NOT EXISTS idx_users_country ON public.users(country);
CREATE INDEX IF NOT EXISTS idx_users_first_visit_at ON public.users(first_visit_at DESC);

-- 코멘트 추가
COMMENT ON COLUMN public.users.last_login_at IS '마지막 로그인 시간 (DAU/MAU 계산용)';
COMMENT ON COLUMN public.users.login_count IS '총 로그인 횟수';
COMMENT ON COLUMN public.users.analysis_count IS '총 분석 횟수 (캐시용)';
COMMENT ON COLUMN public.users.signup_source IS '가입 경로 (web, mobile, google, email)';
COMMENT ON COLUMN public.users.skin_type IS '피부 타입 (건성, 지성, 복합성, 민감성, 정상)';
COMMENT ON COLUMN public.users.main_concerns IS '주요 피부 고민 배열 (JSONB)';
COMMENT ON COLUMN public.users.preferred_treatments IS '선호하는 시술 배열 (JSONB)';
COMMENT ON COLUMN public.users.first_analysis_at IS '첫 분석 날짜 (전환율 분석용)';
COMMENT ON COLUMN public.users.last_analysis_at IS '마지막 분석 날짜 (재방문율 분석용)';
COMMENT ON COLUMN public.users.marketing_consent IS '마케팅 수신 동의 여부';
COMMENT ON COLUMN public.users.notification_enabled IS '알림 설정 여부';
COMMENT ON COLUMN public.users.is_active IS '활성 사용자 여부';
-- 마케팅 분석 코멘트
COMMENT ON COLUMN public.users.utm_source IS 'UTM 소스 (google, naver, facebook, direct)';
COMMENT ON COLUMN public.users.utm_medium IS 'UTM 매체 (cpc, email, social, organic)';
COMMENT ON COLUMN public.users.utm_campaign IS 'UTM 캠페인명';
COMMENT ON COLUMN public.users.utm_term IS 'UTM 키워드 (검색 광고용)';
COMMENT ON COLUMN public.users.utm_content IS 'UTM 콘텐츠 ID (A/B 테스트용)';
COMMENT ON COLUMN public.users.referrer_url IS '리퍼러 URL (유입 경로)';
COMMENT ON COLUMN public.users.landing_page IS '첫 방문 페이지 (랜딩 페이지)';
COMMENT ON COLUMN public.users.device_type IS '기기 타입 (mobile, tablet, desktop)';
COMMENT ON COLUMN public.users.device_brand IS '기기 브랜드 (iPhone, Samsung 등)';
COMMENT ON COLUMN public.users.os_name IS 'OS 이름 (iOS, Android, Windows 등)';
COMMENT ON COLUMN public.users.os_version IS 'OS 버전';
COMMENT ON COLUMN public.users.browser_name IS '브라우저 이름 (Chrome, Safari 등)';
COMMENT ON COLUMN public.users.browser_version IS '브라우저 버전';
COMMENT ON COLUMN public.users.screen_resolution IS '화면 해상도 (1920x1080 등)';
COMMENT ON COLUMN public.users.country IS '국가 코드 (KR, US 등) - 선택사항';
COMMENT ON COLUMN public.users.region IS '지역/도시 (서울, 부산 등) - 선택사항';
COMMENT ON COLUMN public.users.timezone IS '시간대 (Asia/Seoul 등)';
COMMENT ON COLUMN public.users.language IS '언어 설정 (ko, en 등)';
COMMENT ON COLUMN public.users.first_visit_at IS '첫 방문 날짜 (신규 방문자 분석)';
COMMENT ON COLUMN public.users.last_visit_at IS '마지막 방문 날짜 (재방문율 분석)';
COMMENT ON COLUMN public.users.session_count IS '총 세션 수 (사용자 참여도)';
COMMENT ON COLUMN public.users.page_view_count IS '총 페이지뷰 수 (사용자 참여도)';
COMMENT ON COLUMN public.users.total_time_spent IS '총 체류 시간 (초)';
COMMENT ON COLUMN public.users.conversion_events IS '전환 이벤트 기록 (JSONB)';

