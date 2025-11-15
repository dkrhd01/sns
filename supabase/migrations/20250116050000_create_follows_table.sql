-- follows 테이블 생성
-- 사용자 간 팔로우 관계를 저장하는 테이블

CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(follower_id, following_id) -- 중복 팔로우 방지
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_created_at ON follows(created_at DESC);

-- 자기 자신 팔로우 방지 체크 제약 조건
ALTER TABLE follows ADD CONSTRAINT check_no_self_follow 
  CHECK (follower_id != following_id);

-- RLS 비활성화 (개발 단계)
-- ALTER TABLE follows DISABLE ROW LEVEL SECURITY;

-- 권한 부여
GRANT ALL ON follows TO anon;
GRANT ALL ON follows TO authenticated;
GRANT ALL ON follows TO service_role;

