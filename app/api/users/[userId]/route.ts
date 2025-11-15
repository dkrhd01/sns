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

    // 사용자 정보 조회
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, clerk_id, name, created_at")
      .eq("id", userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 게시물 수 집계
    let postCount = 0;
    try {
      const { count } = await supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);
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
        .eq("following_id", userId);
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
        .eq("follower_id", userId);
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
          .single();

        if (currentUserData && currentUserData.id !== userId) {
          // follows 테이블에서 팔로우 여부 확인
          try {
            const { data: followData } = await supabase
              .from("follows")
              .select("id")
              .eq("follower_id", currentUserData.id)
              .eq("following_id", userId)
              .single();
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

