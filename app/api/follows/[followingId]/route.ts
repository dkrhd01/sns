import { NextRequest, NextResponse } from "next/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";

/**
 * @file route.ts
 * @description 언팔로우 API
 *
 * DELETE /api/follows/[followingId]
 * - 언팔로우
 */

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ followingId: string }> }
) {
  try {
    // 인증 확인
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const { followingId } = await params;

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
        { error: "언팔로우할 사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const targetFollowingId = followingData.id;

    // 팔로우 관계 확인
    const { data: followData, error: followCheckError } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", followerId)
      .eq("following_id", targetFollowingId)
      .single();

    if (followCheckError || !followData) {
      return NextResponse.json(
        { error: "팔로우 관계를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 언팔로우
    const { error: deleteError } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", followerId)
      .eq("following_id", targetFollowingId);

    if (deleteError) {
      console.error("Follow delete error:", deleteError);
      return NextResponse.json(
        { error: "언팔로우에 실패했습니다.", details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("DELETE /api/follows/[followingId] error:", error);
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

