"use client";

import { useState, useEffect, useRef } from "react";
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
 * - 무한 스크롤: Intersection Observer 사용
 */

interface PostFeedProps {
  refreshTrigger?: number;
}

export function PostFeed({ refreshTrigger }: PostFeedProps = {}) {
  const [posts, setPosts] = useState<PostWithComments[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchPosts = async (pageNum: number, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      let response: Response;
      try {
        response = await fetch(`/api/posts?page=${pageNum}&limit=10`);
      } catch {
        // 네트워크 에러 처리
        throw new Error("인터넷 연결을 확인해주세요.");
      }
      
      if (!response.ok) {
        // 에러 응답의 상세 정보 가져오기
        let errorDetails = "게시물을 불러오는데 실패했습니다.";
        try {
          const errorData = await response.json();
          console.error("API error response:", errorData);
          errorDetails = errorData.details || errorData.error || errorDetails;
        } catch {
          // JSON 파싱 실패 시 기본 메시지 사용
          const text = await response.text();
          console.error("API error response (text):", text);
        }
        throw new Error(errorDetails);
      }

      const data = await response.json();
      
      if (append) {
        setPosts((prev) => [...prev, ...(data.posts || [])]);
      } else {
        setPosts(data.posts || []);
      }
      
      setHasMore(data.hasMore || false);
    } catch (err) {
      console.error("PostFeed fetch error:", err);
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Intersection Observer로 무한 스크롤 구현
  useEffect(() => {
    if (!hasMore || loadingMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchPosts(nextPage, true);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loadingMore, loading, page]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchPosts(1, false);
  }, [refreshTrigger]);

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
    const isDatabaseError = error.includes("Could not find the table") || 
                           error.includes("Database tables not initialized");
    
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <p className="text-[var(--instagram-text-secondary)] text-center mb-2">
          {error}
        </p>
        {isDatabaseError && (
          <p className="text-sm text-[var(--instagram-text-secondary)] text-center mb-4 max-w-md">
            데이터베이스 테이블이 초기화되지 않았습니다. Supabase 마이그레이션을 실행해주세요.
            <br />
            자세한 내용은 <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">docs/DEPLOY.md</code>를 참고하세요.
          </p>
        )}
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
      
      {/* 무한 스크롤 감지용 요소 */}
      {hasMore && (
        <div ref={observerTarget} className="h-20 flex items-center justify-center">
          {loadingMore && (
            <div className="space-y-4 w-full">
              <PostCardSkeleton />
            </div>
          )}
        </div>
      )}
      
      {/* 더 이상 로드할 데이터가 없을 때 */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-8 text-[var(--instagram-text-secondary)] text-sm">
          모든 게시물을 불러왔습니다.
        </div>
      )}
    </div>
  );
}

