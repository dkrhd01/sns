# 배포 가이드

이 문서는 SNS 프로젝트를 Vercel에 배포하는 방법을 안내합니다.

## 사전 준비사항

1. **Vercel 계정**: https://vercel.com 에서 계정 생성
2. **GitHub/GitLab/Bitbucket 저장소**: 프로젝트 코드가 푸시된 저장소 필요
3. **Clerk 프로젝트**: 인증 설정 완료
4. **Supabase 프로젝트**: 데이터베이스 및 Storage 설정 완료

## 1. 환경변수 설정

Vercel 대시보드에서 다음 환경변수를 설정해야 합니다:

### Clerk 환경변수

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
```

### Supabase 환경변수

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_STORAGE_BUCKET=uploads
```

> **⚠️ 주의**: `SUPABASE_SERVICE_ROLE_KEY`는 절대 공개되지 않도록 주의하세요!

## 2. Vercel 배포

### 2-1. Vercel 대시보드에서 배포

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. **"Add New..."** → **"Project"** 클릭
3. GitHub/GitLab/Bitbucket 저장소 선택
4. 프로젝트 설정:
   - **Framework Preset**: Next.js (자동 감지)
   - **Root Directory**: `./` (기본값)
   - **Build Command**: `pnpm build` (또는 `npm run build`)
   - **Output Directory**: `.next` (기본값)
   - **Install Command**: `pnpm install` (또는 `npm install`)
5. **Environment Variables** 섹션에서 위의 환경변수 모두 추가
6. **"Deploy"** 클릭

### 2-2. CLI를 통한 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 디렉토리에서 실행
vercel

# 프로덕션 배포
vercel --prod
```

## 3. Supabase 마이그레이션 실행

배포 후 Supabase 마이그레이션을 실행해야 합니다:

### 3-1. Supabase Dashboard에서 실행

1. Supabase Dashboard → **SQL Editor** 메뉴
2. 다음 마이그레이션 파일들을 순서대로 실행:
   - `supabase/migrations/setup_schema.sql`
   - `supabase/migrations/setup_storage.sql`
   - `supabase/migrations/20250116033156_create_posts_table.sql`
   - `supabase/migrations/20250116035251_create_likes_table.sql`
   - `supabase/migrations/20250116040000_create_comments_table.sql`
   - `supabase/migrations/20250116050000_create_follows_table.sql`

### 3-2. Supabase CLI를 통한 실행

```bash
# Supabase CLI 설치
npm install -g supabase

# Supabase 프로젝트 연결
supabase link --project-ref your-project-ref

# 마이그레이션 실행
supabase db push
```

## 4. 배포 후 확인사항

### 4-1. 빌드 성공 확인

- Vercel 대시보드에서 빌드 로그 확인
- 에러가 없으면 성공

### 4-2. 기능 테스트

1. **인증 테스트**
   - 로그인/회원가입 동작 확인
   - Clerk 인증 정상 작동 확인

2. **게시물 기능 테스트**
   - 게시물 작성
   - 이미지 업로드
   - 게시물 목록 조회

3. **댓글 기능 테스트**
   - 댓글 작성
   - 댓글 삭제

4. **좋아요 기능 테스트**
   - 좋아요 추가/삭제
   - 더블탭 좋아요

5. **프로필 기능 테스트**
   - 프로필 페이지 조회
   - 팔로우/언팔로우

### 4-3. 반응형 테스트

- Mobile (< 768px): Bottom Navigation, Header 표시 확인
- Tablet (768px ~ 1023px): Icon-only Sidebar 확인
- Desktop (1024px+): Full Sidebar 확인

## 5. 문제 해결

### 빌드 실패

- 환경변수 확인: 모든 필수 환경변수가 설정되었는지 확인
- 빌드 로그 확인: Vercel 대시보드에서 상세 에러 확인
- 로컬 빌드 테스트: `pnpm build` 실행하여 로컬에서 빌드 확인

### 런타임 에러

- 브라우저 콘솔 확인: 클라이언트 사이드 에러 확인
- Vercel Function Logs 확인: 서버 사이드 에러 확인
- Supabase 연결 확인: Supabase Dashboard에서 연결 상태 확인

### 데이터베이스 에러

- 마이그레이션 실행 확인: 모든 마이그레이션이 실행되었는지 확인
- RLS 정책 확인: 개발 환경에서는 RLS가 비활성화되어 있는지 확인
- 테이블 존재 확인: Supabase Dashboard에서 테이블 목록 확인

## 6. 프로덕션 최적화

### 6-1. 이미지 최적화

- Next.js Image 컴포넌트 사용 (이미 적용됨)
- Supabase Storage CDN 활용

### 6-2. 성능 모니터링

- Vercel Analytics 활성화 (선택사항)
- Web Vitals 모니터링

### 6-3. 보안

- 환경변수 보안: `SUPABASE_SERVICE_ROLE_KEY` 절대 공개 금지
- RLS 정책: 프로덕션에서는 적절한 RLS 정책 적용 고려

## 참고 자료

- [Vercel 배포 가이드](https://vercel.com/docs)
- [Next.js 배포](https://nextjs.org/docs/deployment)
- [Supabase 마이그레이션](https://supabase.com/docs/guides/cli/local-development#database-migrations)

