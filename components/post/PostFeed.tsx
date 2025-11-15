"use client";

import { useEffect, useState } from "react";
import { PostCard } from "./PostCard";
import { PostCardSkeleton } from "./PostCardSkeleton";
import type { PostWithDetails, CommentWithUser } from "@/lib/types";

interface PostWithComments extends PostWithDetails {
  previewComments?: CommentWithUser[];
}

/**
 * @file PostFeed.tsx
 * @description 게시물 피드 컴포넌트
 *
 * 게시물 목록을 표시하는 피드 컴포넌트
 * - 로딩 상태: Skeleton UI
 * - 빈 상태: 게시물 없을 때 UI
 * - 무한 스크롤: 2-4 단계에서 구현 예정
 */

export function PostFeed() {
  const [posts, setPosts] = useState<PostWithComments[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/posts?page=1&limit=10");
        
        if (!response.ok) {
          throw new Error("게시물을 불러오는데 실패했습니다.");
        }

        const data = await response.json();
        setPosts(data.posts);
        setHasMore(data.hasMore);
      } catch (err) {
        console.error("PostFeed fetch error:", err);
        setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <p className="text-[var(--instagram-text-secondary)] text-center">
          {error}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-[var(--instagram-blue)] text-white rounded-lg hover:opacity-90 transition-opacity"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <p className="text-[var(--instagram-text-primary)] font-semibold text-lg mb-2">
          아직 게시물이 없습니다
        </p>
        <p className="text-[var(--instagram-text-secondary)] text-center">
          첫 게시물을 작성해보세요!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} comments={post.previewComments || []} />
      ))}
    </div>
  );
}

