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
  let { data: targetUserData } = await supabase
    .from("users")
    .select("id, clerk_id")
    .or(`id.eq.${userId},clerk_id.eq.${userId}`)
    .maybeSingle();

  // 사용자를 찾을 수 없고, 현재 사용자의 프로필인 경우 동기화 시도
  if (!targetUserData && currentClerkUserId === userId) {
    try {
      // 서버 사이드에서 직접 동기화 처리
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(userId);
      
      if (clerkUser) {
        const supabaseService = getServiceRoleClient();
        const { data: syncedUser } = await supabaseService
          .from("users")
          .upsert(
            {
              clerk_id: clerkUser.id,
              name:
                clerkUser.fullName ||
                clerkUser.username ||
                clerkUser.emailAddresses[0]?.emailAddress ||
                "Unknown",
            },
            {
              onConflict: "clerk_id",
            }
          )
          .select("id, clerk_id")
          .single();
        
        if (syncedUser) {
          targetUserData = syncedUser;
        }
      }
    } catch (syncError) {
      console.error("Failed to sync user in profile page:", syncError);
    }
  }

  if (!targetUserData) {
    // 사용자를 찾을 수 없음
    // 디버깅 정보 로깅
    console.error("Profile page - User not found:", {
      userId,
      currentClerkUserId,
      error: "User not found in Supabase users table",
    });

    return (
      <div className="w-full bg-[var(--instagram-background)] min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-[var(--instagram-text-secondary)] text-lg mb-2 font-semibold">
            사용자를 찾을 수 없습니다.
          </p>
          <p className="text-[var(--instagram-text-secondary)] text-sm mb-4">
            프로필이 존재하지 않거나 삭제되었을 수 있습니다.
          </p>
          {currentClerkUserId === userId && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                💡 내 프로필을 찾을 수 없습니다.
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-3">
                사용자 동기화가 완료되지 않았을 수 있습니다.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-[var(--instagram-blue)] text-white rounded-lg hover:opacity-90 transition-opacity text-sm"
              >
                새로고침
              </button>
            </div>
          )}
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

