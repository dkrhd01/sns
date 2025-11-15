"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, MessageCircle, Send, Bookmark, MoreVertical } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { formatTimeAgo, truncateText } from "@/lib/utils";
import type { PostWithDetails, CommentWithUser } from "@/lib/types";

/**
 * @file PostCard.tsx
 * @description 게시물 카드 컴포넌트
 *
 * Instagram 스타일의 게시물 카드
 * - 헤더: 프로필 이미지, 사용자명, 시간, 메뉴
 * - 이미지: 1:1 정사각형
 * - 액션 버튼: 좋아요, 댓글, 공유, 북마크
 * - 컨텐츠: 좋아요 수, 캡션, 댓글 미리보기
 */

interface PostCardProps {
  post: PostWithDetails;
  comments?: CommentWithUser[];
}

export function PostCard({ post, comments = [] }: PostCardProps) {
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [isLoading, setIsLoading] = useState(false);
  const [showDoubleTapHeart, setShowDoubleTapHeart] = useState(false);
  const [heartScale, setHeartScale] = useState(1);

  const { truncated: truncatedCaption, isTruncated: isCaptionTruncated } =
    truncateText(post.caption || "", 2);

  const previewComments = comments.slice(0, 2);

  // 좋아요 버튼 클릭 핸들러
  const handleLikeClick = async () => {
    if (isLoading) return;

    const previousIsLiked = isLiked;
    const previousLikeCount = likeCount;

    // Optimistic update
    setIsLiked(!previousIsLiked);
    setLikeCount(previousIsLiked ? previousLikeCount - 1 : previousLikeCount + 1);
    setHeartScale(1.3);
    setIsLoading(true);

    try {
      if (previousIsLiked) {
        // 좋아요 삭제
        const response = await fetch(`/api/likes/${post.id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to unlike");
        }
      } else {
        // 좋아요 추가
        const response = await fetch("/api/likes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ postId: post.id }),
        });

        if (!response.ok) {
          if (response.status === 409) {
            // 이미 좋아요한 경우 (중복)
            setIsLiked(true);
            return;
          }
          throw new Error("Failed to like");
        }
      }
    } catch (error) {
      console.error("Like error:", error);
      // 롤백
      setIsLiked(previousIsLiked);
      setLikeCount(previousLikeCount);
    } finally {
      setIsLoading(false);
      setTimeout(() => setHeartScale(1), 150);
    }
  };

  // 더블탭 좋아요 핸들러
  const handleDoubleClick = async () => {
    if (isLiked || isLoading) return;

    setShowDoubleTapHeart(true);
    await handleLikeClick();

    setTimeout(() => {
      setShowDoubleTapHeart(false);
    }, 1000);
  };

  return (
    <article className="bg-[var(--instagram-card-background)] border border-[var(--instagram-border)] rounded-none mb-4">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-4 py-3 h-[60px]">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${post.user.id}`}>
            <Avatar src={null} alt={post.user.name} size="sm" />
          </Link>
          <div className="flex flex-col">
            <Link
              href={`/profile/${post.user.id}`}
              className="font-bold text-[var(--instagram-text-primary)] hover:opacity-70"
            >
              {post.user.name}
            </Link>
            <span className="text-xs text-[var(--instagram-text-secondary)]">
              {formatTimeAgo(post.created_at)}
            </span>
          </div>
        </div>
        <button
          className="p-2 hover:opacity-70 transition-opacity"
          aria-label="더 보기"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </header>

      {/* 이미지 영역 */}
      <div
        className="relative aspect-square w-full bg-gray-100 cursor-pointer select-none"
        onDoubleClick={handleDoubleClick}
      >
        <Image
          src={post.image_url}
          alt={post.caption || "게시물 이미지"}
          fill
          className="object-cover"
          unoptimized
          draggable={false}
        />
        {/* 더블탭 하트 애니메이션 */}
        {showDoubleTapHeart && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Heart
              className="w-24 h-24 fill-[var(--instagram-like)] text-[var(--instagram-like)] animate-[fadeInOut_1s_ease-in-out]"
              style={{
                animation: "fadeInOut 1s ease-in-out",
              }}
            />
          </div>
        )}
      </div>

      {/* 액션 버튼 */}
      <div className="flex items-center justify-between px-4 py-2 h-[48px]">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLikeClick}
            disabled={isLoading}
            className="p-1 hover:opacity-70 transition-opacity disabled:opacity-50"
            aria-label="좋아요"
          >
            <Heart
              className={`w-6 h-6 transition-transform duration-150 ${
                isLiked
                  ? "fill-[var(--instagram-like)] text-[var(--instagram-like)]"
                  : "text-[var(--instagram-text-primary)]"
              }`}
              style={{
                transform: `scale(${heartScale})`,
              }}
            />
          </button>
          <button
            className="p-1 hover:opacity-70 transition-opacity"
            aria-label="댓글"
          >
            <MessageCircle className="w-6 h-6 text-[var(--instagram-text-primary)]" />
          </button>
          <button
            className="p-1 hover:opacity-70 transition-opacity"
            aria-label="공유"
          >
            <Send className="w-6 h-6 text-[var(--instagram-text-primary)]" />
          </button>
        </div>
        <button
          className="p-1 hover:opacity-70 transition-opacity"
          aria-label="북마크"
        >
          <Bookmark className="w-6 h-6 text-[var(--instagram-text-primary)]" />
        </button>
      </div>

      {/* 컨텐츠 영역 */}
      <div className="px-4 pb-4 space-y-2">
        {/* 좋아요 수 */}
        {likeCount > 0 && (
          <div className="font-bold text-[var(--instagram-text-primary)]">
            좋아요 {likeCount.toLocaleString()}개
          </div>
        )}

        {/* 캡션 */}
        {post.caption && (
          <div className="text-[var(--instagram-text-primary)]">
            <Link
              href={`/profile/${post.user.id}`}
              className="font-bold hover:opacity-70"
            >
              {post.user.name}
            </Link>{" "}
            <span>
              {showFullCaption ? post.caption : truncatedCaption}
              {isCaptionTruncated && !showFullCaption && (
                <>
                  {" "}
                  <button
                    onClick={() => setShowFullCaption(true)}
                    className="text-[var(--instagram-text-secondary)] hover:opacity-70"
                  >
                    더 보기
                  </button>
                </>
              )}
            </span>
          </div>
        )}

        {/* 댓글 미리보기 */}
        {post.comment_count > 0 && (
          <div className="space-y-1">
            {previewComments.length > 0 && (
              <div className="space-y-1">
                {previewComments.map((comment) => (
                  <div key={comment.id} className="text-[var(--instagram-text-primary)]">
                    <Link
                      href={`/profile/${comment.user.id}`}
                      className="font-bold hover:opacity-70"
                    >
                      {comment.user.name}
                    </Link>{" "}
                    <span>{comment.content}</span>
                  </div>
                ))}
              </div>
            )}
            {post.comment_count > 2 && (
              <Link
                href={`/post/${post.id}`}
                className="text-[var(--instagram-text-secondary)] text-sm hover:opacity-70"
              >
                댓글 {post.comment_count}개 모두 보기
              </Link>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

