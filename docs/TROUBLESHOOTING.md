# 문제 해결 가이드

이 문서는 SNS 프로젝트에서 발생할 수 있는 일반적인 문제와 해결 방법을 안내합니다.

## 데이터베이스 관련 에러

### "Could not find the table 'public.posts' in the schema cache"

**증상:**
- `/api/posts` 엔드포인트에서 500 에러 발생
- 브라우저 콘솔에 "Could not find the table" 에러 메시지

**원인:**
- Supabase 데이터베이스에 테이블이 생성되지 않음
- 마이그레이션이 실행되지 않음

**해결 방법:**

1. **Supabase Dashboard에서 마이그레이션 실행**

   Supabase Dashboard → **SQL Editor** 메뉴로 이동하여 다음 마이그레이션 파일들을 순서대로 실행:

   ```sql
   -- 1. setup_schema.sql
   -- 2. setup_storage.sql
   -- 3. 20250116033156_create_posts_table.sql
   -- 4. 20250116035251_create_likes_table.sql
   -- 5. 20250116040000_create_comments_table.sql
   -- 6. 20250116050000_create_follows_table.sql
   ```

2. **Supabase CLI 사용 (권장)**

   ```bash
   # Supabase CLI 설치
   npm install -g supabase

   # 프로젝트 연결
   supabase link --project-ref your-project-ref

   # 마이그레이션 실행
   supabase db push
   ```

3. **마이그레이션 파일 위치 확인**

   모든 마이그레이션 파일은 `supabase/migrations/` 디렉토리에 있습니다.

### "relation does not exist" 에러

**증상:**
- 특정 테이블을 찾을 수 없다는 에러

**해결 방법:**
- 위의 "Could not find the table" 해결 방법과 동일
- 해당 테이블의 마이그레이션 파일이 실행되었는지 확인

## 인증 관련 에러

### Clerk 개발 키 경고

**증상:**
- 브라우저 콘솔에 "Clerk has been loaded with development keys" 경고

**원인:**
- 프로덕션 환경에서 개발 키를 사용 중

**해결 방법:**
- Vercel 환경변수에서 프로덕션 Clerk 키로 교체
- Clerk Dashboard에서 프로덕션 키 확인

## 라우팅 관련 에러

### 404 에러 (explore, direct, activity)

**증상:**
- `/explore`, `/direct`, `/activity` 경로에서 404 에러

**원인:**
- 해당 페이지가 아직 구현되지 않음 (정상)

**해결 방법:**
- 현재는 정상적인 동작입니다
- 해당 기능이 필요하면 TODO.md를 참고하여 구현

## API 에러

### 500 Internal Server Error

**증상:**
- API 엔드포인트에서 500 에러 발생

**해결 방법:**

1. **서버 로그 확인**
   - Vercel Dashboard → Functions → Logs
   - 에러 메시지 확인

2. **환경변수 확인**
   - 모든 필수 환경변수가 설정되었는지 확인
   - `.env.example`과 비교

3. **데이터베이스 연결 확인**
   - Supabase Dashboard에서 연결 상태 확인
   - API 키가 올바른지 확인

## 빌드 에러

### TypeScript 타입 에러

**증상:**
- 빌드 시 타입 에러 발생

**해결 방법:**
```bash
# 타입 체크만 실행
pnpm tsc --noEmit

# 에러 메시지 확인 후 수정
```

### ESLint 경고

**증상:**
- 빌드 시 ESLint 경고 발생

**해결 방법:**
```bash
# ESLint 자동 수정
pnpm lint --fix
```

## 성능 문제

### 이미지 로딩 느림

**해결 방법:**
- Next.js Image 컴포넌트 사용 (이미 적용됨)
- Supabase Storage CDN 활용
- 이미지 최적화 (압축, WebP 변환)

### API 응답 느림

**해결 방법:**
- 데이터베이스 인덱스 확인
- 쿼리 최적화
- 페이지네이션 사용

## 추가 도움

문제가 지속되면:
1. GitHub Issues에 문제 보고
2. Supabase Discord 커뮤니티에 문의
3. Clerk Support에 문의

