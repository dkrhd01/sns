import { NextRequest, NextResponse } from "next/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import type { CommentWithUser } from "@/lib/types";

/**
 * @file route.ts
 * @description 댓글 API
 *
 * GET /api/comments?postId=xxx&limit=10
 * POST /api/comments
 */

/**
 * GET /api/comments
 * 댓글 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const postId = searchParams.get("postId");
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    if (!postId) {
      return NextResponse.json(
        { error: "postId 파라미터가 필요합니다." },
        { status: 400 }
      );
    }

    const supabase = createClerkSupabaseClient();

    // 댓글 조회 (users 테이블 JOIN)
    const { data: comments, error: commentsError } = await supabase
      .from("comments")
      .select(
        `
        id,
        post_id,
        user_id,
        content,
        created_at,
        users!inner (
          id,
          clerk_id,
          name,
          created_at
        )
      `
      )
      .eq("post_id", postId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (commentsError) {
      console.error("Comments fetch error:", commentsError);
      return NextResponse.json(
        { error: "댓글을 불러오는데 실패했습니다.", details: commentsError.message },
        { status: 500 }
      );
    }

    // CommentWithUser 형식으로 변환
    const commentsWithUser: CommentWithUser[] = (comments || []).map(
      (comment: any) => ({
        id: comment.id,
        post_id: comment.post_id,
        user_id: comment.user_id,
        content: comment.content,
        created_at: comment.created_at,
        user: {
          id: comment.users.id,
          clerk_id: comment.users.clerk_id,
          name: comment.users.name,
          created_at: comment.users.created_at,
        },
      })
    );

    return NextResponse.json({
      comments: commentsWithUser,
    });
  } catch (error) {
    console.error("GET /api/comments error:", error);
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

/**
 * POST /api/comments
 * 댓글 작성
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
    const { postId, content } = body;

    // 입력 검증
    if (!postId) {
      return NextResponse.json(
        { error: "postId가 필요합니다." },
        { status: 400 }
      );
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "댓글 내용을 입력해주세요." },
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

    // 댓글 저장
    const { data: commentData, error: commentError } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        user_id: userId,
        content: content.trim(),
      })
      .select()
      .single();

    if (commentError) {
      console.error("Comment insert error:", commentError);
      return NextResponse.json(
        { error: "댓글 작성에 실패했습니다.", details: commentError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        comment: commentData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/comments error:", error);
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

