"use client";

import { useState, useEffect } from "react";
import { MoreVertical, Trash2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { formatTimeAgo } from "@/lib/utils";
import type { CommentWithUser } from "@/lib/types";

/**
 * @file CommentList.tsx
 * @description 댓글 목록 컴포넌트
 *
 * 주요 기능:
 * 1. 댓글 목록 표시
 * 2. 최신 2개만 미리보기 (PostCard용)
 * 3. 전체 댓글 표시 (상세 모달용)
 * 4. 댓글 삭제 버튼 (본인만 표시)
 *
 * @dependencies
 * - Avatar 컴포넌트
 * - formatTimeAgo 유틸리티
 */

interface CommentListProps {
  postId: string;
  preview?: boolean; // true면 최신 2개만 표시
  currentUserId?: string; // 현재 사용자 ID (삭제 버튼 표시용)
  onCommentDeleted?: () => void;
  className?: string;
}

export function CommentList({
  postId,
  preview = false,
  currentUserId,
  onCommentDeleted,
  className,
}: CommentListProps) {
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);

      const limit = preview ? 2 : 50; // 미리보기는 2개, 전체는 50개
      const response = await fetch(
        `/api/comments?postId=${postId}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error("댓글을 불러오는데 실패했습니다.");
      }

      const data = await response.json();
      setComments(data.comments || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId, preview]);

  const handleDelete = async (commentId: string) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("댓글 삭제에 실패했습니다.");
      }

      // 댓글 목록 새로고침
      fetchComments();
      if (onCommentDeleted) {
        onCommentDeleted();
      }
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "댓글 삭제 중 오류가 발생했습니다."
      );
    }
  };

  if (loading) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: preview ? 2 : 3 }).map((_, i) => (
          <div key={i} className="flex gap-2 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-1">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-sm text-red-500 ${className}`}>{error}</div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className={`text-sm text-[var(--instagram-text-secondary)] ${className}`}>
        댓글이 없습니다.
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {comments.map((comment) => {
        const isOwner = currentUserId === comment.user_id;

        return (
          <div key={comment.id} className="flex gap-2 group">
            <Avatar
              src={comment.user.name}
              alt={comment.user.name}
              size="sm"
              className="shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-[var(--instagram-text-primary)] mr-2">
                    {comment.user.name}
                  </span>
                  <span className="text-[var(--instagram-text-primary)]">
                    {comment.content}
                  </span>
                </div>
                {isOwner && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                    title="댓글 삭제"
                  >
                    <Trash2 className="w-4 h-4 text-[var(--instagram-text-secondary)]" />
                  </button>
                )}
              </div>
              <div className="text-xs text-[var(--instagram-text-secondary)] mt-1">
                {formatTimeAgo(comment.created_at)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

