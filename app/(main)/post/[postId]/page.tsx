"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Heart, MessageCircle, Send, Bookmark } from "lucide-react";
import { CommentList } from "@/components/comment/CommentList";
import { CommentForm } from "@/components/comment/CommentForm";
import { useUser } from "@clerk/nextjs";
import type { PostWithDetails } from "@/lib/types";

/**
 * @file page.tsx
 * @description 게시물 상세 페이지 (Mobile용)
 *
 * Mobile에서 게시물 상세를 보는 전체 페이지
 * Desktop에서는 PostModal 사용
 */

interface PostPageProps {
  params: Promise<{ postId: string }>;
}

export default function PostPage({ params }: PostPageProps) {
  const router = useRouter();
  const { user } = useUser();
  const [post, setPost] = useState<PostWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [postId, setPostId] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setPostId(p.postId));
  }, [params]);

  useEffect(() => {
    if (!postId) return;

    async function fetchPost() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/posts/${postId}`);
        
        if (!response.ok) {
          throw new Error("게시물을 불러오는데 실패했습니다.");
        }

        const data = await response.json();
        setPost(data.post);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [postId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--instagram-text-primary)]" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <p className="text-[var(--instagram-text-secondary)] mb-4">
          {error || "게시물을 불러올 수 없습니다."}
        </p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-[var(--instagram-blue)] text-white rounded-lg"
        >
          뒤로가기
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-[var(--instagram-background)] min-h-screen">
      {/* 헤더 */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-[var(--instagram-border)] bg-[var(--instagram-card-background)] sticky top-0 z-10">
        <button
          onClick={() => router.back()}
          className="p-1 hover:opacity-70 transition-opacity"
          aria-label="뒤로가기"
        >
          <ArrowLeft className="w-6 h-6 text-[var(--instagram-text-primary)]" />
        </button>
        <h1 className="font-semibold text-[var(--instagram-text-primary)]">
          게시물
        </h1>
      </div>

      {/* 이미지 */}
      <div className="w-full aspect-square bg-black relative">
        <Image
          src={post.image_url}
          alt={post.caption || "게시물 이미지"}
          fill
          className="object-contain"
          sizes="100vw"
        />
      </div>

      {/* 컨텐츠 */}
      <div className="bg-[var(--instagram-card-background)]">
        {/* 액션 버튼 */}
        <div className="flex items-center gap-4 px-4 py-2 border-b border-[var(--instagram-border)]">
          <Heart className="w-6 h-6 text-[var(--instagram-text-primary)]" />
          <MessageCircle className="w-6 h-6 text-[var(--instagram-text-primary)]" />
          <Send className="w-6 h-6 text-[var(--instagram-text-primary)]" />
          <div className="flex-1" />
          <Bookmark className="w-6 h-6 text-[var(--instagram-text-primary)]" />
        </div>

        {/* 좋아요 수 및 캡션 */}
        <div className="px-4 py-2 space-y-2 border-b border-[var(--instagram-border)]">
          {post.like_count > 0 && (
            <div className="font-bold text-[var(--instagram-text-primary)]">
              좋아요 {post.like_count.toLocaleString()}개
            </div>
          )}
          {post.caption && (
            <div className="text-[var(--instagram-text-primary)]">
              <span className="font-bold">{post.user.name}</span>{" "}
              <span>{post.caption}</span>
            </div>
          )}
        </div>

        {/* 댓글 목록 */}
        <div className="px-4 py-4 max-h-[400px] overflow-y-auto">
          <CommentList
            postId={postId!}
            preview={false}
            currentUserId={user?.id}
            onCommentDeleted={() => {
              // 댓글 삭제 후 새로고침
              window.location.reload();
            }}
          />
        </div>

        {/* 댓글 작성 폼 */}
        {user && (
          <div className="border-t border-[var(--instagram-border)] px-4 py-3">
            <CommentForm
              postId={postId!}
              onCommentAdded={() => {
                // 댓글 작성 후 새로고침
                window.location.reload();
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

