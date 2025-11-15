-- 개발용 RLS 정책 (Development Policies)
-- 
-- ⚠️ 주의: 이 정책들은 개발 환경에서만 사용해야 합니다.
-- 프로덕션 환경에서는 적절한 RLS 정책을 작성하여 보안을 유지해야 합니다.
--
-- 이 SQL은 Supabase SQL Editor 또는 CLI(supabase db push)를 통해 실행해야 합니다.
-- 
-- 실행 방법:
-- 1. Supabase Dashboard → SQL Editor → 새 쿼리 작성 → 이 SQL 붙여넣기 → 실행
-- 2. 또는 터미널에서: supabase db push (로컬 개발 환경인 경우)

-- RLS 활성화 (정책을 적용하기 위해 필요)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 기존 정책이 있다면 삭제 (선택사항, 개발 중 재실행 시 충돌 방지)
DROP POLICY IF EXISTS "dev_allow_all_select" ON public.users;
DROP POLICY IF EXISTS "dev_allow_all_insert" ON public.users;
DROP POLICY IF EXISTS "dev_allow_all_update" ON public.users;
DROP POLICY IF EXISTS "dev_allow_all_delete" ON public.users;

-- SELECT 정책: 모든 사용자가 모든 데이터 조회 가능
CREATE POLICY "dev_allow_all_select"
ON public.users
FOR SELECT
USING (true);

-- INSERT 정책: 모든 사용자가 데이터 삽입 가능
CREATE POLICY "dev_allow_all_insert"
ON public.users
FOR INSERT
WITH CHECK (true);

-- UPDATE 정책: 모든 사용자가 모든 데이터 수정 가능
CREATE POLICY "dev_allow_all_update"
ON public.users
FOR UPDATE
USING (true)
WITH CHECK (true);

-- DELETE 정책: 모든 사용자가 모든 데이터 삭제 가능
CREATE POLICY "dev_allow_all_delete"
ON public.users
FOR DELETE
USING (true);

