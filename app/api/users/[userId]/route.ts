import { NextRequest, NextResponse } from "next/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";

/**
 * @file route.ts
 * @description 사용자 정보 조회 API
 *
 * GET /api/users/[userId]
 * - 사용자 정보 조회
 * - 통계 정보 포함 (게시물 수, 팔로워, 팔로잉)
 * - 현재 사용자 팔로우 여부 확인
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const supabase = createClerkSupabaseClient();

    // userId가 Clerk ID인지 Supabase user ID인지 확인
    // 먼저 id로 조회, 없으면 clerk_id로 조회
    let userData = null;
    let userError = null;

    // Supabase user ID로 조회 시도
    const { data: userById, error: errorById } = await supabase
      .from("users")
      .select("id, clerk_id, name, created_at")
      .eq("id", userId)
      .maybeSingle();

    if (userById) {
      userData = userById;
    } else {
      // Clerk ID로 조회 시도
      const { data: userByClerkId, error: errorByClerkId } = await supabase
        .from("users")
        .select("id, clerk_id, name, created_at")
        .eq("clerk_id", userId)
        .maybeSingle();

      if (userByClerkId) {
        userData = userByClerkId;
      } else {
        userError = errorByClerkId || errorById;
      }
    }

    if (userError || !userData) {
      // 디버깅 정보 로깅
      console.error("GET /api/users/[userId] - User not found:", {
        userId,
        errorById: errorById?.message,
        errorByClerkId: userError?.message,
        userError: userError?.code,
      });

      return NextResponse.json(
        { 
          error: "사용자를 찾을 수 없습니다.",
          details: "Supabase users 테이블에 사용자가 없거나 동기화되지 않았을 수 있습니다."
        },
        { status: 404 }
      );
    }

    // 실제 Supabase user ID 사용
    const actualUserId = userData.id;

    // 게시물 수 집계
    let postCount = 0;
    try {
      const { count } = await supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", actualUserId);
      postCount = count || 0;
    } catch {
      // posts 테이블이 없으면 0으로 처리
    }

    // 팔로워 수 집계 (follows 테이블이 있으면)
    let followerCount = 0;
    try {
      const { count } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", actualUserId);
      followerCount = count || 0;
    } catch {
      // follows 테이블이 없으면 0으로 처리
    }

    // 팔로잉 수 집계 (follows 테이블이 있으면)
    let followingCount = 0;
    try {
      const { count } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", actualUserId);
      followingCount = count || 0;
    } catch {
      // follows 테이블이 없으면 0으로 처리
    }

    // 현재 사용자 팔로우 여부 확인
    let isFollowing = false;
    try {
      const { userId: currentClerkUserId } = await auth();
      if (currentClerkUserId) {
        // 현재 사용자의 Supabase user_id 조회
        const { data: currentUserData } = await supabase
          .from("users")
          .select("id")
          .eq("clerk_id", currentClerkUserId)
          .maybeSingle();

        if (currentUserData && currentUserData.id !== actualUserId) {
          // follows 테이블에서 팔로우 여부 확인
          try {
            const { data: followData } = await supabase
              .from("follows")
              .select("id")
              .eq("follower_id", currentUserData.id)
              .eq("following_id", actualUserId)
              .maybeSingle();
            isFollowing = !!followData;
          } catch {
            // follows 테이블이 없으면 false로 처리
          }
        }
      }
    } catch {
      // 인증 에러는 치명적이지 않음
    }

    return NextResponse.json({
      user: userData,
      stats: {
        posts: postCount,
        followers: followerCount,
        following: followingCount,
      },
      isFollowing,
    });
  } catch (error) {
    console.error("GET /api/users/[userId] error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        error: "Internal server error",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

