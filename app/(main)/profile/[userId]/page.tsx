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
  let targetUserId: string = userId;
  let isOwnProfile = false;

  if (currentClerkUserId) {
    // 현재 사용자의 Supabase user ID 조회
    const { data: currentUserData } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", currentClerkUserId)
      .single();

    // userId가 Clerk ID인 경우 Supabase user ID로 변환
    const { data: targetUserData } = await supabase
      .from("users")
      .select("id")
      .or(`id.eq.${userId},clerk_id.eq.${userId}`)
      .single();

    if (targetUserData) {
      targetUserId = targetUserData.id;
      isOwnProfile = currentUserData?.id === targetUserId;
    }
  }

  return (
    <div className="w-full bg-[var(--instagram-background)] min-h-screen">
      <ProfileHeader userId={targetUserId} isOwnProfile={isOwnProfile} />
      <PostGrid userId={targetUserId} />
    </div>
  );
}

