# Supabase 마이그레이션

이 폴더는 Supabase 데이터베이스 마이그레이션 파일을 포함합니다.

## 📁 구조

```
supabase/
└── migrations/
    ├── 001_initial_schema.sql      # 초기 스키마 (테이블, RLS 정책)
    └── 002_storage_and_triggers.sql # Storage 및 트리거 설정
```

## 🚀 사용 방법

### Supabase 대시보드에서 실행

1. [Supabase 대시보드](https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. SQL Editor 메뉴 클릭
4. 각 마이그레이션 파일의 내용을 순서대로 실행

### 마이그레이션 순서

1. **001_initial_schema.sql** 먼저 실행
   - 테이블 생성 (users, treatments, skin_analysis)
   - RLS 정책 설정
   - 샘플 데이터 삽입

2. **002_storage_and_triggers.sql** 그 다음 실행
   - Storage 버킷 생성
   - Storage 정책 설정
   - 트리거 함수 생성

## 📝 마이그레이션 파일 설명

### 001_initial_schema.sql
- 데이터베이스 스키마 초기화
- 테이블 생성 및 관계 설정
- Row Level Security (RLS) 정책
- 샘플 시술 데이터

### 002_storage_and_triggers.sql
- Storage 버킷 생성 (`skin-images`)
- Storage 접근 정책
- 사용자 프로필 자동 생성 트리거
- updated_at 자동 업데이트 트리거

## ⚠️ 주의사항

- 마이그레이션은 순서대로 실행해야 합니다
- 프로덕션 환경에서는 백업 후 실행하세요
- 이미 실행된 마이그레이션은 다시 실행하지 마세요

