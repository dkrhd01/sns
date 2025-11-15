import { NextRequest, NextResponse } from "next/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import type { PostWithDetails } from "@/lib/types";

/**
 * @file route.ts
 * @description 게시물 단일 조회 API
 *
 * GET /api/posts/[postId]
 * - 특정 게시물 조회
 * - 사용자 정보 JOIN
 * - 좋아요/댓글 수 집계
 * - 현재 사용자 좋아요 여부 확인
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const supabase = createClerkSupabaseClient();

    // 현재 사용자 ID 가져오기 (좋아요 여부 확인용)
    let currentUserId: string | null = null;
    try {
      const { userId: clerkUserId } = await auth();
      
      if (clerkUserId) {
        const { data: userData } = await supabase
          .from("users")
          .select("id")
          .eq("clerk_id", clerkUserId)
          .maybeSingle();

        if (userData) {
          currentUserId = userData.id;
        }
      }
    } catch {
      // 인증 에러는 치명적이지 않음
    }

    // 게시물 조회
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select(
        `
        id,
        user_id,
        image_url,
        caption,
        created_at,
        updated_at,
        users!inner (
          id,
          clerk_id,
          name,
          created_at
        )
      `
      )
      .eq("id", postId)
      .single();

    if (postError || !post) {
      return NextResponse.json(
        { error: "게시물을 찾을 수 없습니다." },
        { status: 404 }
      );
    }


    // 좋아요 수 집계
    let likeCount = 0;
    try {
      const { count } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("post_id", postId);
      likeCount = count || 0;
    } catch {
      // likes 테이블이 없으면 0으로 처리
    }

    // 댓글 수 집계
    let commentCount = 0;
    try {
      const { count } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
        .eq("post_id", postId);
      commentCount = count || 0;
    } catch {
      // comments 테이블이 없으면 0으로 처리
    }

    // 현재 사용자 좋아요 여부 확인
    let isLiked = false;
    if (currentUserId) {
      try {
        const { data: likeData } = await supabase
          .from("likes")
          .select("id")
          .eq("post_id", postId)
          .eq("user_id", currentUserId)
          .single();
        isLiked = !!likeData;
      } catch {
        // likes 테이블이 없으면 false로 처리
      }
    }

    // users가 단일 객체인지 확인 (타입 가드)
    const userData = Array.isArray(post.users) ? post.users[0] : post.users;
    
    if (!userData) {
      return NextResponse.json(
        { error: "사용자 정보를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const postWithDetails: PostWithDetails = {
      id: post.id,
      user_id: post.user_id,
      image_url: post.image_url,
      caption: post.caption,
      created_at: post.created_at,
      updated_at: post.updated_at,
      user: {
        id: userData.id,
        clerk_id: userData.clerk_id,
        name: userData.name,
        created_at: userData.created_at,
      },
      like_count: likeCount,
      comment_count: commentCount,
      is_liked: isLiked,
    };

    return NextResponse.json({
      post: postWithDetails,
    });
  } catch (error) {
    console.error("GET /api/posts/[postId] error:", error);
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

