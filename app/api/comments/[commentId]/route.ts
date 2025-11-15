import { NextRequest, NextResponse } from "next/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";

/**
 * @file route.ts
 * @description 댓글 삭제 API
 *
 * DELETE /api/comments/[commentId]
 */

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
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

    const { commentId } = await params;

    if (!commentId) {
      return NextResponse.json(
        { error: "commentId가 필요합니다." },
        { status: 400 }
      );
    }

    const supabase = createClerkSupabaseClient();

    // Clerk user ID로 Supabase users 테이블에서 user_id 조회
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkUserId)
      .single();

    if (userError || !userData) {
      console.error("User lookup error:", userError);
      return NextResponse.json(
        { error: "사용자 정보를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const userId = userData.id;

    // 댓글 작성자 확인
    const { data: commentData, error: commentError } = await supabase
      .from("comments")
      .select("user_id")
      .eq("id", commentId)
      .single();

    if (commentError || !commentData) {
      return NextResponse.json(
        { error: "댓글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 권한 확인 (댓글 작성자만 삭제 가능)
    if (commentData.user_id !== userId) {
      return NextResponse.json(
        { error: "댓글을 삭제할 권한이 없습니다." },
        { status: 403 }
      );
    }

    // 댓글 삭제
    const { error: deleteError } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (deleteError) {
      console.error("Comment delete error:", deleteError);
      return NextResponse.json(
        { error: "댓글 삭제에 실패했습니다.", details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("DELETE /api/comments/[commentId] error:", error);
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

