import { NextRequest, NextResponse } from "next/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";

/**
 * @file route.ts
 * @description 팔로우 API
 *
 * POST /api/follows
 * - 팔로우 추가
 */

export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { followingId } = body;

    if (!followingId) {
      return NextResponse.json(
        { error: "followingId가 필요합니다." },
        { status: 400 }
      );
    }

    const supabase = createClerkSupabaseClient();

    // Clerk user ID로 Supabase users 테이블에서 user_id 조회
    const { data: followerData, error: followerError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkUserId)
      .single();

    if (followerError || !followerData) {
      console.error("Follower lookup error:", followerError);
      return NextResponse.json(
        { error: "사용자 정보를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const followerId = followerData.id;

    // followingId가 Clerk ID인지 Supabase user ID인지 확인
    const { data: followingData, error: followingError } = await supabase
      .from("users")
      .select("id")
      .or(`id.eq.${followingId},clerk_id.eq.${followingId}`)
      .single();

    if (followingError || !followingData) {
      return NextResponse.json(
        { error: "팔로우할 사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const targetFollowingId = followingData.id;

    // 자기 자신 팔로우 방지
    if (followerId === targetFollowingId) {
      return NextResponse.json(
        { error: "자기 자신을 팔로우할 수 없습니다." },
        { status: 400 }
      );
    }

    // 중복 체크
    const { data: existingFollow } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", followerId)
      .eq("following_id", targetFollowingId)
      .single();

    if (existingFollow) {
      return NextResponse.json(
        { error: "이미 팔로우한 사용자입니다." },
        { status: 409 }
      );
    }

    // 팔로우 추가
    const { data: followData, error: followError } = await supabase
      .from("follows")
      .insert({
        follower_id: followerId,
        following_id: targetFollowingId,
      })
      .select()
      .single();

    if (followError) {
      console.error("Follow insert error:", followError);
      return NextResponse.json(
        { error: "팔로우에 실패했습니다.", details: followError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        follow: followData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/follows error:", error);
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

