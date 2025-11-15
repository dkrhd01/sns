"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

/**
 * @file CommentForm.tsx
 * @description 댓글 작성 폼 컴포넌트
 *
 * 주요 기능:
 * 1. 댓글 입력 (Enter 키 또는 "게시" 버튼으로 제출)
 * 2. 로딩 상태 표시
 * 3. 빈 댓글 방지
 *
 * @dependencies
 * - shadcn/ui Button, Textarea
 * - lucide-react 아이콘
 */

interface CommentFormProps {
  postId: string;
  onCommentAdded?: () => void;
  placeholder?: string;
  className?: string;
}

export function CommentForm({
  postId,
  onCommentAdded,
  placeholder = "댓글 달기...",
  className,
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!content.trim()) {
      setError("댓글을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let response: Response;
      try {
        response = await fetch("/api/comments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            postId,
            content: content.trim(),
          }),
        });
      } catch {
        throw new Error("인터넷 연결을 확인해주세요.");
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "댓글 작성에 실패했습니다.");
      }

      // 성공 시 입력 초기화
      setContent("");
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "댓글 작성 중 오류가 발생했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="flex items-end gap-2">
        <Textarea
          placeholder={placeholder}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setError(null);
          }}
          onKeyDown={handleKeyDown}
          disabled={isSubmitting}
          rows={1}
          className="resize-none min-h-[40px] max-h-[100px]"
        />
        <Button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          size="sm"
          className="shrink-0"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
      {error && (
        <p className="text-sm text-red-500 mt-2">{error}</p>
      )}
    </form>
  );
}

