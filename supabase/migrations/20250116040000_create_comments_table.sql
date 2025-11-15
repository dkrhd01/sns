-- comments 테이블 생성
-- 게시물 댓글을 저장하는 테이블

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

-- RLS 비활성화 (개발 단계)
-- ALTER TABLE comments DISABLE ROW LEVEL SECURITY;

-- 권한 부여
GRANT ALL ON comments TO anon;
GRANT ALL ON comments TO authenticated;
GRANT ALL ON comments TO service_role;

