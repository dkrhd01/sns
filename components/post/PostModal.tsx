"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, Heart, MessageCircle, Send, Bookmark, MoreVertical } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Avatar } from "@/components/ui/Avatar";
import { PostCard } from "./PostCard";
import { CommentList } from "@/components/comment/CommentList";
import { CommentForm } from "@/components/comment/CommentForm";
import { useUser } from "@clerk/nextjs";
import type { PostWithDetails, CommentWithUser } from "@/lib/types";

/**
 * @file PostModal.tsx
 * @description 게시물 상세 모달 컴포넌트
 *
 * 주요 기능:
 * 1. Desktop: 모달 형태 (이미지 50% + 댓글 50%)
 * 2. Mobile: 전체 페이지로 전환
 * 3. 게시물 상세 정보 표시
 * 4. 댓글 목록 및 작성
 *
 * @dependencies
 * - Dialog 컴포넌트
 * - PostCard, CommentList, CommentForm
 */

interface PostModalProps {
  postId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PostModal({ postId, open, onOpenChange }: PostModalProps) {
  const router = useRouter();
  const { user } = useUser();
  const [post, setPost] = useState<PostWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !postId) return;

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
  }, [open, postId]);

  const handleClose = () => {
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[90vw] md:max-w-[900px] max-h-[90vh] p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--instagram-text-primary)]" />
          </div>
        ) : error || !post ? (
          <div className="flex items-center justify-center p-12">
            <p className="text-[var(--instagram-text-secondary)]">
              {error || "게시물을 불러올 수 없습니다."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row h-[90vh] max-h-[600px]">
            {/* 이미지 영역 (Desktop: 50%, Mobile: 전체) */}
            <div className="w-full md:w-1/2 bg-black flex items-center justify-center">
              <img
                src={post.image_url}
                alt={post.caption || "게시물 이미지"}
                className="w-full h-full object-contain"
              />
            </div>

            {/* 댓글 영역 (Desktop: 50%, Mobile: 전체) */}
            <div className="w-full md:w-1/2 flex flex-col bg-[var(--instagram-card-background)]">
              {/* 게시물 헤더 */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--instagram-border)]">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={post.user.name}
                    alt={post.user.name}
                    size="sm"
                  />
                  <span className="font-semibold text-[var(--instagram-text-primary)]">
                    {post.user.name}
                  </span>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1 hover:opacity-70 transition-opacity"
                  aria-label="닫기"
                >
                  <X className="w-5 h-5 text-[var(--instagram-text-primary)]" />
                </button>
              </div>

              {/* 댓글 목록 (스크롤 가능) */}
              <div className="flex-1 overflow-y-auto px-4 py-4">
                <CommentList
                  postId={postId}
                  preview={false}
                  currentUserId={user?.id}
                  onCommentDeleted={() => {
                    // 댓글 삭제 후 새로고침
                    window.location.reload();
                  }}
                />
              </div>

              {/* 액션 버튼 및 좋아요 수 */}
              <div className="border-t border-[var(--instagram-border)] px-4 py-2 space-y-2">
                <div className="flex items-center gap-4">
                  <Heart className="w-6 h-6 text-[var(--instagram-text-primary)]" />
                  <MessageCircle className="w-6 h-6 text-[var(--instagram-text-primary)]" />
                  <Send className="w-6 h-6 text-[var(--instagram-text-primary)]" />
                  <div className="flex-1" />
                  <Bookmark className="w-6 h-6 text-[var(--instagram-text-primary)]" />
                </div>
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

              {/* 댓글 작성 폼 */}
              {user && (
                <div className="border-t border-[var(--instagram-border)] px-4 py-3">
                  <CommentForm
                    postId={postId}
                    onCommentAdded={() => {
                      // 댓글 작성 후 새로고침
                      window.location.reload();
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

