"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

/**
 * @file ProfileHeader.tsx
 * @description 프로필 헤더 컴포넌트
 *
 * 주요 기능:
 * 1. 프로필 이미지 (150px Desktop / 90px Mobile, 원형)
 * 2. 사용자명 및 통계 표시
 * 3. 팔로우/언팔로우 버튼 (다른 사람 프로필)
 * 4. 프로필 편집 버튼 (내 프로필, 1차 제외)
 *
 * @dependencies
 * - Avatar 컴포넌트
 * - Button 컴포넌트
 */

interface ProfileHeaderProps {
  userId: string;
  isOwnProfile?: boolean;
}

interface UserStats {
  posts: number;
  followers: number;
  following: number;
}

interface ProfileData {
  user: {
    id: string;
    clerk_id: string;
    name: string;
    created_at: string;
  };
  stats: UserStats;
  isFollowing: boolean;
}

export function ProfileHeader({ userId, isOwnProfile = false }: ProfileHeaderProps) {
  const { user: clerkUser } = useUser();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        setError(null);

        let response: Response;
        try {
          response = await fetch(`/api/users/${userId}`);
        } catch (networkError) {
          throw new Error("인터넷 연결을 확인해주세요.");
        }
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "프로필을 불러오는데 실패했습니다.");
        }

        const data = await response.json();
        setProfileData(data);
        setIsFollowing(data.isFollowing || false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [userId]);

  const handleFollow = async () => {
    if (!clerkUser || isFollowLoading) return;

    setIsFollowLoading(true);
    const previousIsFollowing = isFollowing;

    // Optimistic update
    setIsFollowing(!previousIsFollowing);

    try {
      let response: Response;
      if (previousIsFollowing) {
        // 언팔로우
        try {
          response = await fetch(`/api/follows/${userId}`, {
            method: "DELETE",
          });
        } catch (networkError) {
          throw new Error("인터넷 연결을 확인해주세요.");
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "언팔로우에 실패했습니다.");
        }
      } else {
        // 팔로우
        try {
          response = await fetch("/api/follows", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ followingId: userId }),
          });
        } catch (networkError) {
          throw new Error("인터넷 연결을 확인해주세요.");
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "팔로우에 실패했습니다.");
        }
      }

      // 프로필 데이터 새로고침
      const response = await fetch(`/api/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
        setIsFollowing(data.isFollowing || false);
      }
    } catch (err) {
      // 롤백
      setIsFollowing(previousIsFollowing);
      alert(
        err instanceof Error ? err.message : "오류가 발생했습니다."
      );
    } finally {
      setIsFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 px-4 py-6">
        <div className="w-[90px] h-[90px] md:w-[150px] md:h-[150px] rounded-full bg-gray-200 animate-pulse mx-auto md:mx-0" />
        <div className="flex-1 space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse" />
          <div className="flex gap-6">
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
          </div>
          <div className="h-9 bg-gray-200 rounded w-24 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="flex items-center justify-center py-12 px-4">
        <p className="text-[var(--instagram-text-secondary)]">{error || "프로필을 불러올 수 없습니다."}</p>
      </div>
    );
  }

  const { user, stats } = profileData;

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 px-4 py-6 border-b border-[var(--instagram-border)]">
      {/* 프로필 이미지 */}
      <div className="flex justify-center md:justify-start">
        <Avatar
          src={clerkUser?.imageUrl}
          alt={user.name}
          size="lg"
          className="w-[90px] h-[90px] md:w-[150px] md:h-[150px]"
        />
      </div>

      {/* 프로필 정보 */}
      <div className="flex-1 space-y-4">
        {/* 사용자명 */}
        <div className="flex items-center gap-4">
          <h1 className="text-xl md:text-2xl font-light text-[var(--instagram-text-primary)]">
            {user.name}
          </h1>
          {!isOwnProfile && clerkUser && (
            <Button
              onClick={handleFollow}
              disabled={isFollowLoading}
              variant={isFollowing ? "outline" : "default"}
              className={`
                ${isFollowing 
                  ? "hover:border-red-500 hover:text-red-500" 
                  : "bg-[var(--instagram-blue)] text-white hover:opacity-90"
                }
              `}
            >
              {isFollowLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isFollowing ? (
                "팔로잉"
              ) : (
                "팔로우"
              )}
            </Button>
          )}
        </div>

        {/* 통계 */}
        <div className="flex gap-6 md:gap-8">
          <div className="text-center md:text-left">
            <span className="font-semibold text-[var(--instagram-text-primary)]">
              {stats.posts.toLocaleString()}
            </span>
            <span className="text-[var(--instagram-text-secondary)] ml-1">게시물</span>
          </div>
          <div className="text-center md:text-left">
            <span className="font-semibold text-[var(--instagram-text-primary)]">
              {stats.followers.toLocaleString()}
            </span>
            <span className="text-[var(--instagram-text-secondary)] ml-1">팔로워</span>
          </div>
          <div className="text-center md:text-left">
            <span className="font-semibold text-[var(--instagram-text-primary)]">
              {stats.following.toLocaleString()}
            </span>
            <span className="text-[var(--instagram-text-secondary)] ml-1">팔로잉</span>
          </div>
        </div>
      </div>
    </div>
  );
}

