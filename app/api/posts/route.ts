import { NextRequest, NextResponse } from "next/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
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
    const userId = searchParams.get("userId"); // 특정 사용자 게시물만 조회
    const offset = (page - 1) * limit;

    // Supabase 클라이언트 초기화 확인
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("⚠️ Supabase environment variables are missing");
      return NextResponse.json(
        { 
          error: "Server configuration error", 
          details: "Supabase URL or Anon Key is missing" 
        },
        { status: 500 }
      );
    }

    const supabase = createClerkSupabaseClient();

    // 현재 사용자 ID 가져오기 (좋아요 여부 확인용)
    let currentUserId: string | null = null;
    try {
      const { userId: clerkUserId } = await auth();
      
      if (clerkUserId) {
        // Clerk user ID로 Supabase users 테이블에서 user id 찾기
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("clerk_id", clerkUserId)
          .maybeSingle(); // single() 대신 maybeSingle() 사용 (에러 없이 null 반환)

        if (userError) {
          console.warn("User lookup error (non-critical):", userError);
        } else if (userData) {
          currentUserId = userData.id;
        }
      }
    } catch (authError) {
      // 인증 에러는 치명적이지 않음 (비로그인 사용자도 게시물 조회 가능)
      console.warn("Auth error (non-critical):", authError);
    }

    // 게시물 조회 (users 테이블 JOIN)
    // posts 테이블이 없을 수 있으므로 에러 처리 강화
    let posts: any[] = [];
    let postsError: any = null;

    try {
      let query = supabase
        .from("posts")
        .select(
          `
          id,
          user_id,
          image_url,
          caption,
          created_at,
          updated_at,
          users (
            id,
            clerk_id,
            name,
            created_at
          )
        `
        );

      // 특정 사용자 게시물만 조회 (userId 파라미터가 있으면)
      if (userId) {
        // userId가 Clerk ID인지 Supabase user ID인지 확인
        // 먼저 users 테이블에서 조회
        const { data: targetUser } = await supabase
          .from("users")
          .select("id")
          .or(`id.eq.${userId},clerk_id.eq.${userId}`)
          .single();

        if (targetUser) {
          query = query.eq("user_id", targetUser.id);
        } else {
          // 사용자를 찾을 수 없으면 빈 배열 반환
          return NextResponse.json({
            posts: [],
            hasMore: false,
          });
        }
      }

      const result = await query
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      posts = result.data || [];
      postsError = result.error;

      // users JOIN이 실패한 게시물 필터링 (null users 제거)
      if (posts && posts.length > 0) {
        posts = posts.filter((post: any) => post.users !== null);
      }
    } catch (err) {
      console.error("Posts query exception:", err);
      postsError = err;
    }

    // 테이블이 없거나 에러가 발생한 경우 (PGRST116 = relation does not exist)
    if (postsError) {
      const errorCode = (postsError as any)?.code;
      
      // 테이블이 없는 경우 빈 배열 반환 (치명적이지 않음)
      if (errorCode === "PGRST116" || errorCode === "42P01") {
        console.warn("Posts table does not exist yet, returning empty array");
        return NextResponse.json({
          posts: [],
          hasMore: false,
        });
      }

      console.error("Posts fetch error:", {
        message: (postsError as any)?.message,
        code: errorCode,
        details: (postsError as any)?.details,
        hint: (postsError as any)?.hint,
      });
      
      return NextResponse.json(
        { 
          error: "Failed to fetch posts", 
          details: (postsError as any)?.message || "Unknown error",
          code: errorCode,
        },
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
        } catch {
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
        } catch {
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
          } catch {
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
        } catch {
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
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: errorMessage,
        ...(process.env.NODE_ENV === "development" && { stack: errorStack }),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/posts
 * 게시물 생성 API
 * 
 * 요청:
 * - FormData: { image: File, caption?: string }
 * 
 * 응답:
 * - { success: true, post: Post }
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

    // FormData 파싱
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;
    const caption = (formData.get("caption") as string) || null;

    // 이미지 파일 검증
    if (!imageFile) {
      return NextResponse.json(
        { error: "이미지 파일이 필요합니다." },
        { status: 400 }
      );
    }

    // 파일 크기 검증 (5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (imageFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "파일 크기는 5MB 이하여야 합니다." },
        { status: 400 }
      );
    }

    // MIME 타입 검증
    const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
    if (!ALLOWED_MIME_TYPES.includes(imageFile.type)) {
      return NextResponse.json(
        { error: "JPEG, PNG, WebP 형식만 업로드 가능합니다." },
        { status: 400 }
      );
    }

    // Supabase 클라이언트 (Service Role - Storage 업로드용)
    const supabaseService = getServiceRoleClient();
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

    // 파일명 생성 (UUID + 타임스탬프)
    const fileExt = imageFile.name.split(".").pop() || "jpg";
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`;
    const filePath = `${clerkUserId}/${fileName}`;

    // Storage에 이미지 업로드 (uploads 버킷)
    const STORAGE_BUCKET = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "uploads";
    
    const { data: uploadData, error: uploadError } = await supabaseService.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, imageFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json(
        { error: "이미지 업로드에 실패했습니다.", details: uploadError.message },
        { status: 500 }
      );
    }

    // Public URL 생성 (Storage 버킷이 private이면 signed URL 필요)
    const { data: urlData } = supabaseService.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    const imageUrl = urlData.publicUrl;

    // DB에 게시물 정보 저장
    const { data: postData, error: postError } = await supabase
      .from("posts")
      .insert({
        user_id: userId,
        image_url: imageUrl,
        caption: caption,
      })
      .select()
      .single();

    if (postError) {
      console.error("Post insert error:", postError);
      // 업로드된 파일 삭제 시도 (롤백)
      await supabaseService.storage
        .from(STORAGE_BUCKET)
        .remove([filePath]);
      
      return NextResponse.json(
        { error: "게시물 저장에 실패했습니다.", details: postError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        post: postData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/posts error:", error);
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

