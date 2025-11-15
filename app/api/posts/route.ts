import { NextRequest, NextResponse } from "next/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";
import type { PostWithDetails, CommentWithUser } from "@/lib/types";

interface PostWithComments extends PostWithDetails {
  previewComments: CommentWithUser[];
}

/**
 * @file route.ts
 * @description 게시물 목록 조회 API
 *
 * GET /api/posts?page=1&limit=10
 * - 페이지네이션 지원
 * - 시간 역순 정렬
 * - 사용자 정보 JOIN
 * - 좋아요/댓글 수 집계 (likes, comments 테이블이 없으면 0으로 처리)
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = (page - 1) * limit;

    const supabase = createClerkSupabaseClient();

    // 현재 사용자 ID 가져오기 (좋아요 여부 확인용)
    const { userId: clerkUserId } = await auth();
    let currentUserId: string | null = null;

    if (clerkUserId) {
      // Clerk user ID로 Supabase users 테이블에서 user id 찾기
      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", clerkUserId)
        .single();

      if (userData) {
        currentUserId = userData.id;
      }
    }

    // 게시물 조회 (users 테이블 JOIN)
    const { data: posts, error: postsError } = await supabase
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
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (postsError) {
      console.error("Posts fetch error:", postsError);
      return NextResponse.json(
        { error: "Failed to fetch posts", details: postsError.message },
        { status: 500 }
      );
    }

    if (!posts || posts.length === 0) {
      return NextResponse.json({
        posts: [],
        hasMore: false,
      });
    }

    // 각 게시물에 대해 좋아요 수, 댓글 수, 좋아요 여부 추가
    const postsWithDetails: PostWithDetails[] = await Promise.all(
      posts.map(async (post: any) => {
        const postId = post.id;

        // 좋아요 수 집계 (likes 테이블이 없으면 0)
        let likeCount = 0;
        try {
          const { count } = await supabase
            .from("likes")
            .select("*", { count: "exact", head: true })
            .eq("post_id", postId);
          likeCount = count || 0;
        } catch (error) {
          // likes 테이블이 없으면 0으로 처리
          console.warn("Likes table not found, using 0");
        }

        // 댓글 수 집계 (comments 테이블이 없으면 0)
        let commentCount = 0;
        try {
          const { count } = await supabase
            .from("comments")
            .select("*", { count: "exact", head: true })
            .eq("post_id", postId);
          commentCount = count || 0;
        } catch (error) {
          // comments 테이블이 없으면 0으로 처리
          console.warn("Comments table not found, using 0");
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
          } catch (error) {
            // likes 테이블이 없으면 false로 처리
            console.warn("Likes table not found, using false");
          }
        }

        return {
          id: post.id,
          user_id: post.user_id,
          image_url: post.image_url,
          caption: post.caption,
          created_at: post.created_at,
          updated_at: post.updated_at,
          user: {
            id: post.users.id,
            clerk_id: post.users.clerk_id,
            name: post.users.name,
            created_at: post.users.created_at,
          },
          like_count: likeCount,
          comment_count: commentCount,
          is_liked: isLiked,
        };
      })
    );

    // 각 게시물에 댓글 미리보기 추가 (comments 테이블이 있으면)
    const postsWithComments: PostWithComments[] = await Promise.all(
      postsWithDetails.map(async (post) => {
        let previewComments: any[] = [];
        try {
          const { data: comments } = await supabase
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
            .eq("post_id", post.id)
            .order("created_at", { ascending: false })
            .limit(2);

          if (comments) {
            previewComments = comments.map((comment: any) => ({
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
            }));
          }
        } catch (error) {
          // comments 테이블이 없으면 빈 배열로 처리
          console.warn("Comments table not found, using empty array");
        }

        return {
          ...post,
          previewComments,
        };
      })
    );

    // 더 불러올 데이터가 있는지 확인
    const { count: totalCount } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true });

    const hasMore = totalCount ? offset + limit < totalCount : false;

    return NextResponse.json({
      posts: postsWithComments,
      hasMore,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

