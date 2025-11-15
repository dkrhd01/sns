import { PostFeed } from "@/components/post/PostFeed";

/**
 * @file page.tsx
 * @description 홈 피드 페이지
 *
 * 게시물 목록을 표시하는 메인 피드 페이지
 */

export default function HomePage() {
  return (
    <div className="w-full bg-[var(--instagram-background)] min-h-screen">
      <PostFeed />
    </div>
  );
}

