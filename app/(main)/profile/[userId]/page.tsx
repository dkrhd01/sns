import { auth } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PostGrid } from "@/components/profile/PostGrid";

/**
 * @file page.tsx
 * @description 프로필 페이지
 *
 * 동적 라우트: /profile/[userId]
 * - 내 프로필: /profile (현재 사용자로 리다이렉트)
 * - 다른 사람 프로필: /profile/[userId]
 */

interface ProfilePageProps {
  params: Promise<{ userId: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { userId } = await params;
  const { userId: currentClerkUserId } = await auth();
  const supabase = createClerkSupabaseClient();

  // userId가 Clerk ID인지 Supabase user ID인지 확인
  let targetUserId: string | null = null;
  let isOwnProfile = false;

  // userId로 사용자 조회 (id 또는 clerk_id로)
  const { data: targetUserData } = await supabase
    .from("users")
    .select("id, clerk_id")
    .or(`id.eq.${userId},clerk_id.eq.${userId}`)
    .maybeSingle();

  if (!targetUserData) {
    // 사용자를 찾을 수 없음
    return (
      <div className="w-full bg-[var(--instagram-background)] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--instagram-text-secondary)] text-lg mb-2">
            사용자를 찾을 수 없습니다.
          </p>
          <p className="text-[var(--instagram-text-secondary)] text-sm">
            프로필이 존재하지 않거나 삭제되었을 수 있습니다.
          </p>
        </div>
      </div>
    );
  }

  targetUserId = targetUserData.id;

  // 현재 사용자와 비교
  if (currentClerkUserId) {
    const { data: currentUserData } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", currentClerkUserId)
      .maybeSingle();

    if (currentUserData) {
      isOwnProfile = currentUserData.id === targetUserId;
    }
  }

  return (
    <div className="w-full bg-[var(--instagram-background)] min-h-screen">
      <ProfileHeader userId={targetUserId} isOwnProfile={isOwnProfile} />
      <PostGrid userId={targetUserId} />
    </div>
  );
}

