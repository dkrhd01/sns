/**
 * @file types.ts
 * @description TypeScript 타입 정의
 *
 * SNS 프로젝트에서 사용하는 모든 타입 정의
 */

export interface User {
  id: string;
  clerk_id: string;
  name: string;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostWithUser extends Post {
  user: User;
}

export interface PostWithDetails extends PostWithUser {
  like_count: number;
  comment_count: number;
  is_liked: boolean;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface CommentWithUser extends Comment {
  user: User;
}

export interface Like {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

