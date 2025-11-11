# 설정 가이드

## Supabase 설정

### 1. 프로젝트 생성

1. [Supabase](https://supabase.com)에 로그인
2. "New Project" 클릭
3. 프로젝트 이름과 데이터베이스 비밀번호 설정
4. 리전 선택 (가장 가까운 리전 권장)
5. 프로젝트 생성 대기 (약 2분)

### 2. 데이터베이스 스키마 생성

**중요**: `supabase/` 폴더는 루트에 위치하며, 프론트엔드와 백엔드 모두에서 공유합니다.

1. Supabase 대시보드에서 "SQL Editor" 메뉴 클릭
2. `supabase/migrations/001_initial_schema.sql` 파일의 내용을 복사
3. SQL Editor에 붙여넣기
4. "Run" 버튼 클릭하여 실행
5. `supabase/migrations/002_storage_and_triggers.sql` 파일도 동일하게 실행

### 3. Storage 버킷 생성

1. Supabase 대시보드에서 "Storage" 메뉴 클릭
2. "Create a new bucket" 클릭
3. 버킷 이름: `skin-images`
4. Public bucket: **체크** (이미지 공개 접근 허용)
5. "Create bucket" 클릭

### 4. Storage 정책 설정

Storage 버킷 생성 후, 다음 정책을 설정하세요:

1. "Storage" > "Policies" 메뉴 클릭
2. `skin-images` 버킷 선택
3. "New Policy" 클릭
4. "For full customization" 선택
5. 다음 정책 추가:

**업로드 정책:**
```sql
CREATE POLICY "Users can upload own images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'skin-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

**조회 정책:**
```sql
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
USING (bucket_id = 'skin-images');
```

### 5. 환경 변수 가져오기

1. Supabase 대시보드에서 "Settings" > "API" 메뉴 클릭
2. 다음 값들을 복사:
   - **Project URL**: `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 6. 로컬 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Google OAuth 설정 (선택사항)

1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. "APIs & Services" > "Credentials" 메뉴
4. "Create Credentials" > "OAuth client ID" 선택
5. Application type: "Web application"
6. Authorized redirect URIs 추가:
   - `https://your-project-ref.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback` (개발용)
7. Client ID와 Client Secret 복사
8. Supabase 대시보드 > "Authentication" > "Providers" > "Google"에서 설정

## AI 모델 연동 (선택사항)

### OpenAI 설정

1. [OpenAI Platform](https://platform.openai.com) 접속
2. API Keys 메뉴에서 새 키 생성
3. `.env.local`에 추가:
   ```env
   OPENAI_API_KEY=sk-...
   ```

### Replicate 설정

1. [Replicate](https://replicate.com) 접속
2. Account Settings > API Tokens에서 토큰 생성
3. `.env.local`에 추가:
   ```env
   REPLICATE_API_TOKEN=r8_...
   ```

## 개발 서버 실행

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 문제 해결

### 이미지 업로드 오류

- Storage 버킷이 Public으로 설정되어 있는지 확인
- Storage 정책이 올바르게 설정되어 있는지 확인
- 파일 크기 제한 확인 (기본 50MB)

### 인증 오류

- 환경 변수가 올바르게 설정되어 있는지 확인
- Supabase 프로젝트 URL과 키가 정확한지 확인
- 브라우저 콘솔에서 에러 메시지 확인

### 이메일 인증코드 비용

⚠️ **주의**: Supabase의 이메일 인증코드(OTP) 발송은 비용이 발생할 수 있습니다.

- **Free 플랜**: 일정량의 이메일을 무료로 제공하지만, 그 이상 사용 시 비용 발생
- **개발 환경**: 비밀번호 방식 사용 권장 (기본값으로 설정됨)
- **프로덕션**: 실제 사용자에게만 이메일 인증코드 발송
- **비용 절감**: 개발/테스트 시에는 비밀번호 방식 사용

### 데이터베이스 오류

- SQL 마이그레이션이 성공적으로 실행되었는지 확인
- RLS 정책이 올바르게 설정되어 있는지 확인
- Supabase 대시보드의 "Table Editor"에서 테이블 확인

