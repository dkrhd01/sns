"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, MessageCircle } from "lucide-react";

/**
 * @file PostGrid.tsx
 * @description 프로필 페이지 게시물 그리드 컴포넌트
 *
 * 주요 기능:
 * 1. 3열 그리드 레이아웃 (반응형)
 * 2. 1:1 정사각형 썸네일
 * 3. Hover 시 좋아요/댓글 수 표시 (오버레이)
 * 4. 빈 상태 UI (게시물 없을 때)
 *
 * @dependencies
 * - Next.js Image 컴포넌트
 * - lucide-react 아이콘
 */

interface PostGridProps {
  userId: string;
}

interface PostThumbnail {
  id: string;
  image_url: string;
  like_count: number;
  comment_count: number;
}

export function PostGrid({ userId }: PostGridProps) {
  const [posts, setPosts] = useState<PostThumbnail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        setError(null);

        let response: Response;
        try {
          response = await fetch(`/api/posts?userId=${userId}&limit=100`);
        } catch {
          throw new Error("인터넷 연결을 확인해주세요.");
        }
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "게시물을 불러오는데 실패했습니다.");
        }

        const data = await response.json();
        setPosts(data.posts || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, [userId]);

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-1 md:gap-4 px-4 py-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-gray-200 dark:bg-gray-800 animate-pulse rounded"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12 px-4">
        <p className="text-[var(--instagram-text-secondary)]">{error}</p>
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
          게시물 없음
        </p>
        <p className="text-[var(--instagram-text-secondary)] text-center">
          아직 게시물이 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1 md:gap-4 px-4 py-4">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/post/${post.id}`}
          className="group relative aspect-square overflow-hidden bg-[var(--instagram-background)]"
        >
          <Image
            src={post.image_url}
            alt="게시물 이미지"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 33vw, 300px"
            loading="lazy"
          />
          {/* Hover 오버레이 */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-white">
              <Heart className="w-5 h-5 fill-white" />
              <span className="font-semibold">{post.like_count}</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <MessageCircle className="w-5 h-5 fill-white" />
              <span className="font-semibold">{post.comment_count}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

