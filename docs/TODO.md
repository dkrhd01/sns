# 📋 SNS 프로젝트 개발 TODO

PRD 기반 개발 체크리스트

---

## 1. 홈 피드 페이지

### 1-1. 기본 세팅

- [x] Next.js + TypeScript 프로젝트 생성
- [x] Tailwind CSS 설정 (인스타 컬러 스키마)
  - [x] Instagram 컬러 변수 정의 (`--instagram-blue`, `--instagram-background`, `--instagram-card-background`, `--instagram-border`, `--instagram-text-primary`, `--instagram-text-secondary`, `--instagram-like`)
  - [x] 타이포그래피 설정 (폰트 스택, 텍스트 크기 변수)
- [x] Clerk 인증 연동 (한국어 설정)
  - [x] ClerkProvider 설정 확인 (`app/layout.tsx`)
  - [x] 로그인/회원가입 페이지 (`app/(auth)/sign-in/`, `app/(auth)/sign-up/`)
- [x] Supabase 프로젝트 생성 및 연동
  - [x] Supabase 클라이언트 설정 (`lib/supabase/clerk-client.ts`, `lib/supabase/server.ts`)
  - [x] 환경변수 설정 가이드 확인 (README.md)
- [x] 기본 데이터베이스 테이블 생성
  - [x] `users` 테이블 (Clerk 연동) - `setup_schema.sql`
    - [x] `id` (UUID, Primary Key)
    - [x] `clerk_id` (TEXT, UNIQUE, NOT NULL)
    - [x] `name` (TEXT, NOT NULL)
    - [x] `created_at` (TIMESTAMPTZ, DEFAULT now())
  - [x] `posts` 테이블 - `20250116033156_create_posts_table.sql`
    - [x] `id` (UUID, Primary Key)
    - [x] `user_id` (UUID, Foreign Key → users.id, ON DELETE CASCADE)
    - [x] `image_url` (TEXT, NOT NULL)
    - [x] `caption` (TEXT, nullable)
    - [x] `created_at` (TIMESTAMPTZ, DEFAULT now())
    - [x] `updated_at` (TIMESTAMPTZ, DEFAULT now(), 자동 업데이트 트리거)
    - [x] 인덱스: `idx_posts_user_id`, `idx_posts_created_at`

### 1-2. 레이아웃 구조

- [x] Sidebar 컴포넌트 (`components/layout/Sidebar.tsx`)
  - [x] Desktop: 244px 너비, 아이콘 + 텍스트
  - [x] Tablet: 72px 너비, 아이콘만
  - [x] Mobile: 숨김
  - [x] Hover 효과, Active 상태 스타일
  - [x] 메뉴 항목: 🏠 홈, 🔍 검색, ➕ 만들기, 👤 프로필
- [x] MobileHeader 컴포넌트 (`components/layout/Header.tsx`)
  - [x] 높이 60px
  - [x] 로고 (Instagram 텍스트 또는 아이콘)
  - [x] 우측 아이콘: 🤍 알림, ✈️ DM, 👤 프로필
- [x] BottomNav 컴포넌트 (`components/layout/BottomNav.tsx`)
  - [x] 높이 50px
  - [x] 5개 아이콘: 🏠 홈, 🔍 검색, ➕ 만들기, ❤️ 좋아요, 👤 프로필
  - [x] 고정 위치 (하단)
- [x] (main) Route Group 및 레이아웃 통합
  - [x] `app/(main)/layout.tsx` 생성
  - [x] Sidebar, Header, BottomNav 통합
  - [x] 반응형 레이아웃 적용 (Desktop/Tablet/Mobile)

### 1-3. 홈 피드 - 게시물 목록

#### 구현 순서

1. 타입 정의 생성 (`lib/types.ts`)
2. 유틸리티 함수 생성 (날짜 포맷팅, 텍스트 자르기)
3. Avatar 컴포넌트 생성 (`components/ui/Avatar.tsx`)
4. Skeleton 컴포넌트 생성 (`components/ui/Skeleton.tsx`)
5. `/api/posts` GET API 구현
6. PostCard 컴포넌트 생성
7. PostCardSkeleton 컴포넌트 생성
8. PostFeed 컴포넌트 생성
9. 홈 페이지에 PostFeed 통합

#### 상세 구현 계획

**1. 타입 정의 (`lib/types.ts`)**

- [x] `User` 타입: `id`, `clerk_id`, `name`, `created_at`
- [x] `Post` 타입: `id`, `user_id`, `image_url`, `caption`, `created_at`, `updated_at`
- [x] `PostWithUser` 타입: `Post` + `user: User`
- [x] `PostWithDetails` 타입: `PostWithUser` + `like_count`, `comment_count`, `is_liked`
- [x] `Comment` 타입 (댓글 미리보기용): `id`, `post_id`, `user_id`, `content`, `created_at`
- [x] `CommentWithUser` 타입: `Comment` + `user: User`

**2. 유틸리티 함수 (`lib/utils.ts` 또는 `lib/date.ts`)**

- [x] `formatTimeAgo(date: Date | string)`: "3시간 전", "2일 전", "1주 전" 형식
  - [x] 상대 시간 계산 (초, 분, 시간, 일, 주, 월, 년)
  - [x] 한국어 형식 ("전" 접미사)
- [x] `truncateText(text: string, maxLines: number)`: 텍스트 자르기
  - [x] 캡션 2줄 초과 시 "... 더 보기" 표시
  - [x] CSS `line-clamp` 또는 JavaScript 계산

**3. Avatar 컴포넌트 (`components/ui/Avatar.tsx`)**

- [x] 원형 이미지 표시
- [x] 다양한 크기 지원: `size?: "sm" | "md" | "lg"` (32px, 90px, 150px)
- [x] 기본 이미지 처리 (프로필 없을 때)
  - [x] Clerk 사용자 이미지 또는 기본 아바타
- [x] `src`, `alt`, `className` props 지원

**4. Skeleton 컴포넌트 (`components/ui/Skeleton.tsx`)**

- [x] shadcn/ui Skeleton 사용 또는 커스텀
- [x] Shimmer 효과 애니메이션 (CSS keyframes)
- [x] 다양한 크기/형태 지원
  - [x] `Skeleton` 기본 컴포넌트
  - [x] `SkeletonCircle` (원형)
  - [x] `SkeletonText` (텍스트 라인)

**5. `/api/posts` GET API (`app/api/posts/route.ts`)**

- [x] 페이지네이션 파라미터 처리
  - [x] `page` 쿼리 파라미터 (기본값: 1)
  - [x] `limit` 쿼리 파라미터 (기본값: 10)
- [x] Supabase 쿼리 구성
  - [x] `posts` 테이블에서 조회
  - [x] `users` 테이블 JOIN (`posts.user_id = users.id`)
  - [x] `created_at DESC` 정렬
  - [x] `range()`로 페이지네이션 적용
- [x] 좋아요 수 집계
  - [x] `likes` 테이블 LEFT JOIN 또는 서브쿼리
  - [x] `COUNT(likes.id) as like_count` (1-4 단계에서 likes 테이블 생성 예정이므로, 일단 0으로 처리)
- [x] 댓글 수 집계
  - [x] `comments` 테이블 LEFT JOIN 또는 서브쿼리
  - [x] `COUNT(comments.id) as comment_count` (2-3 단계에서 comments 테이블 생성 예정이므로, 일단 0으로 처리)
- [x] 현재 사용자 좋아요 여부 확인
  - [x] Clerk 인증 확인 (`auth()`)
  - [x] `likes` 테이블에서 현재 사용자 좋아요 여부 확인 (1-4 단계에서 구현)
  - [x] `is_liked` boolean 필드 추가
- [x] 댓글 미리보기 (최신 2개)
  - [x] `comments` 테이블에서 `post_id`로 필터링
  - [x] `created_at DESC` 정렬, `limit(2)`
  - [x] `users` 테이블 JOIN
- [x] 응답 형식: `{ posts: PostWithDetails[], hasMore: boolean }`
- [x] 에러 처리 (try-catch)

**6. PostCard 컴포넌트 (`components/post/PostCard.tsx`)**

- [x] Props 타입: `PostWithDetails` + 댓글 미리보기 배열
- [x] 헤더 영역 (60px 높이)
  - [x] `flex items-center justify-between px-4 py-3`
  - [x] 좌측: Avatar (32px) + 사용자명 (Bold) + 시간
  - [x] 우측: ⋯ 메뉴 버튼 (MoreVertical 아이콘)
  - [x] 사용자명 클릭 시 프로필 페이지로 이동 (`/profile/${user.id}`)
- [x] 이미지 영역 (1:1 정사각형)
  - [x] `aspect-square` 클래스 사용
  - [x] `Image` 컴포넌트 (Next.js) 또는 `img` 태그
  - [x] `object-cover` 스타일
  - [x] 로딩 상태: Skeleton 표시
  - [ ] 더블탭 좋아요 감지 (모바일, 1-4 단계에서 구현)
    - [ ] `onDoubleClick` 이벤트 핸들러
    - [ ] 큰 하트 애니메이션 (fade in/out)
- [x] 액션 버튼 영역 (48px 높이)
  - [x] `flex items-center justify-between px-4 py-2`
  - [x] 좌측: ❤️ 좋아요 (Heart), 💬 댓글 (MessageCircle), ✈️ 공유 (Send)
  - [x] 우측: 🔖 북마크 (Bookmark)
  - [ ] 좋아요 버튼: `is_liked` 상태에 따라 빈 하트/빨간 하트 (1-4 단계에서 구현)
  - [x] 공유/북마크 버튼: UI만 (클릭 이벤트 없음)
- [x] 컨텐츠 영역
  - [x] 좋아요 수: `font-bold` ("좋아요 {like_count}개")
  - [x] 캡션: 사용자명 (Bold) + 내용
    - [x] `truncateText()` 함수로 2줄 초과 시 "... 더 보기" 표시
    - [x] "더 보기" 클릭 시 전체 캡션 표시 (상태 관리)
  - [x] 댓글 미리보기: 최신 2개만
    - [x] 사용자명 (Bold) + 댓글 내용
    - [x] 각 댓글은 `CommentWithUser` 타입
  - [x] "댓글 {comment_count}개 모두 보기" 링크
    - [x] 클릭 시 게시물 상세 모달/페이지로 이동 (3-4 단계에서 구현)
- [x] 스타일링
  - [x] 배경: `bg-[var(--instagram-card-background)]`
  - [x] 테두리: `border border-[var(--instagram-border)]`
  - [x] 마진: `mb-4` (게시물 간 간격)
  - [x] 반응형: Mobile 전체 너비, Desktop 최대 630px

**7. PostCardSkeleton 컴포넌트 (`components/post/PostCardSkeleton.tsx`)**

- [x] PostCard와 동일한 레이아웃 구조
- [x] Skeleton 컴포넌트 사용
  - [x] 헤더: SkeletonCircle (32px) + SkeletonText (2줄)
  - [x] 이미지: Skeleton (aspect-square)
  - [x] 액션 버튼: Skeleton (48px 높이)
  - [x] 컨텐츠: SkeletonText (여러 줄)
- [x] Shimmer 효과 애니메이션 적용

**8. PostFeed 컴포넌트 (`components/post/PostFeed.tsx`)**

- [x] Client Component (`"use client"`)
- [x] 상태 관리
  - [x] `posts`: 게시물 배열
  - [x] `loading`: 로딩 상태
  - [x] `hasMore`: 더 불러올 데이터 있는지
  - [x] `page`: 현재 페이지 번호
- [x] 데이터 fetching
  - [x] `useEffect`로 초기 데이터 로드
  - [x] `/api/posts?page=1&limit=10` 호출
  - [x] `fetch` 또는 `useSWR` 사용 (선택사항)
- [x] 렌더링
  - [x] 로딩 중: PostCardSkeleton 여러 개 표시 (3-5개)
  - [x] 게시물 목록: `posts.map()`으로 PostCard 렌더링
  - [x] 빈 상태: 게시물 없을 때 UI
    - [x] "아직 게시물이 없습니다" 메시지
    - [x] 아이콘 또는 일러스트
- [ ] 무한 스크롤 (2-4 단계에서 구현)
  - [ ] Intersection Observer 사용
  - [ ] 하단 도달 시 다음 페이지 로드
- [x] 에러 처리
  - [x] API 에러 시 사용자 친화적 메시지 표시

**9. 홈 페이지 통합 (`app/(main)/page.tsx`)**

- [x] PostFeed 컴포넌트 import 및 렌더링
- [x] 기존 임시 콘텐츠 제거
- [x] 배경색: `bg-[var(--instagram-background)]`

### 1-4. 홈 피드 - 좋아요 기능

#### 구현 순서
1. `likes` 테이블 마이그레이션 생성
2. `/api/likes` POST API 구현 (좋아요 추가)
3. `/api/likes` DELETE API 구현 (좋아요 삭제)
4. PostCard에 좋아요 기능 통합 (버튼 클릭, 애니메이션)
5. 더블탭 좋아요 기능 추가 (모바일)

#### 상세 구현 계획

**1. `likes` 테이블 생성 (Supabase 마이그레이션)**
- [x] 마이그레이션 파일 생성 (`supabase/migrations/20250116035251_create_likes_table.sql`)
- [x] 테이블 스키마
  - [x] `id` (UUID, Primary Key, DEFAULT gen_random_uuid())
  - [x] `post_id` (UUID, Foreign Key → posts.id, ON DELETE CASCADE, NOT NULL)
  - [x] `user_id` (UUID, Foreign Key → users.id, ON DELETE CASCADE, NOT NULL)
  - [x] `created_at` (TIMESTAMPTZ, DEFAULT now(), NOT NULL)
- [x] 제약 조건
  - [x] Unique 제약: (post_id, user_id) - 중복 좋아요 방지
- [x] 인덱스 생성
  - [x] `idx_likes_post_id` (post_id)
  - [x] `idx_likes_user_id` (user_id)
  - [x] `idx_likes_created_at` (created_at DESC) - 최신 좋아요 조회용
- [x] RLS 비활성화 (개발 단계)
- [x] 권한 부여 (anon, authenticated, service_role)

**2. `/api/likes` POST API (`app/api/likes/route.ts`)**
- [x] 요청 본문: `{ postId: string }`
- [x] Clerk 인증 확인 (`auth()`)
- [x] Clerk user ID로 Supabase users 테이블에서 user_id 조회
- [x] 중복 체크
  - [x] `likes` 테이블에서 (post_id, user_id) 조합 확인
  - [x] 이미 좋아요한 경우 409 Conflict 반환
- [x] 좋아요 추가
  - [x] `likes` 테이블에 INSERT
- [x] 응답: `{ success: true, like: { id, post_id, user_id, created_at } }`
- [x] 에러 처리 (try-catch)

**3. `/api/likes` DELETE API (`app/api/likes/[postId]/route.ts`)**
- [x] URL 파라미터: `postId`
- [x] Clerk 인증 확인 (`auth()`)
- [x] Clerk user ID로 Supabase users 테이블에서 user_id 조회
- [x] 좋아요 삭제
  - [x] `likes` 테이블에서 (post_id, user_id)로 DELETE
  - [x] 존재하지 않는 경우 404 Not Found 반환
- [x] 응답: `{ success: true }`
- [x] 에러 처리 (try-catch)

**4. PostCard에 좋아요 기능 통합 (`components/post/PostCard.tsx`)**
- [x] 상태 관리
  - [x] `isLiked`: 로컬 좋아요 상태 (post.is_liked 초기값)
  - [x] `likeCount`: 로컬 좋아요 수 (post.like_count 초기값)
  - [x] `isLoading`: 좋아요 API 호출 중 상태
- [x] 좋아요 버튼 클릭 핸들러
  - [x] `handleLikeClick()` 함수
  - [x] `isLiked` 상태에 따라 POST/DELETE API 호출
  - [x] 로딩 상태 관리
  - [x] 성공 시 로컬 상태 업데이트 (optimistic update)
  - [x] 실패 시 이전 상태로 롤백
- [x] 애니메이션
  - [x] 클릭 시 하트 scale(1.3) → scale(1) (0.15초)
  - [x] CSS transition 사용
  - [x] `transform: scale()` 애니메이션
- [x] UI 업데이트
  - [x] `isLiked`에 따라 빈 하트 ↔ 빨간 하트 (fill 속성)
  - [x] 좋아요 수 실시간 업데이트
  - [x] 로딩 중 버튼 비활성화

**5. 더블탭 좋아요 기능 (`components/post/PostCard.tsx`)**
- [x] 이미지 영역에 더블탭 이벤트 핸들러 추가
- [x] `handleDoubleClick()` 함수
  - [x] 현재 좋아요 상태 확인
  - [x] 좋아요하지 않은 경우에만 좋아요 추가
  - [x] 좋아요 API 호출
- [x] 큰 하트 애니메이션
  - [x] 상태: `showDoubleTapHeart` (boolean)
  - [x] 큰 하트 아이콘 (중앙 위치, absolute)
  - [x] fade in 애니메이션 (0.2초)
  - [x] 1초 후 fade out 애니메이션 (0.3초)
  - [x] CSS keyframes (`fadeInOut`) 추가
- [x] 모든 디바이스에서 동작

---

## 2. 게시물 작성 & 댓글 기능

### 2-1. 게시물 작성 모달

- [ ] CreatePostModal 컴포넌트 (`components/post/CreatePostModal.tsx`)
  - [ ] Dialog/Modal UI (shadcn/ui Dialog 사용)
  - [ ] 이미지 미리보기 UI
    - [ ] 이미지 선택 버튼
    - [ ] 선택된 이미지 미리보기 (1:1 비율)
    - [ ] 이미지 제거 버튼
  - [ ] 텍스트 입력 필드 (최대 2,200자)
    - [ ] 캡션 입력창
    - [ ] 글자 수 카운터
  - [ ] 업로드 버튼
    - [ ] 로딩 상태 표시
    - [ ] 업로드 중 비활성화

### 2-2. 게시물 작성 - 이미지 업로드

- [ ] Supabase Storage 버킷 확인/생성
  - [ ] `posts` 버킷 생성 (또는 기존 `uploads` 버킷 사용)
  - [ ] RLS 정책 설정 (업로드 권한)
  - [ ] 파일 크기 제한: 5MB
  - [ ] 허용 MIME 타입: image/jpeg, image/png, image/webp
- [ ] `/api/posts` POST API (`app/api/posts/route.ts`)
  - [ ] 파일 업로드 로직
  - [ ] 이미지 검증 (최대 5MB, 이미지 형식)
  - [ ] 파일명 생성 (UUID 또는 타임스탬프)
  - [ ] Supabase Storage에 업로드
  - [ ] DB에 게시물 정보 저장 (posts 테이블)
  - [ ] 인증 확인 (Clerk)
- [ ] 파일 업로드 진행 상태 표시
  - [ ] Progress bar 또는 로딩 스피너
  - [ ] 업로드 완료 후 모달 닫기 및 피드 새로고침

### 2-3. 댓글 기능 - UI & 작성

- [ ] `comments` 테이블 생성 (Supabase 마이그레이션)
  - [ ] `id` (UUID, Primary Key)
  - [ ] `post_id` (UUID, Foreign Key → posts.id, ON DELETE CASCADE)
  - [ ] `user_id` (UUID, Foreign Key → users.id, ON DELETE CASCADE)
  - [ ] `content` (TEXT, NOT NULL)
  - [ ] `created_at` (TIMESTAMPTZ, DEFAULT now())
  - [ ] 인덱스: `idx_comments_post_id`, `idx_comments_created_at`
- [ ] CommentList 컴포넌트 (`components/comment/CommentList.tsx`)
  - [ ] 댓글 목록 표시
  - [ ] PostCard: 최신 2개만 미리보기
  - [ ] 상세 모달: 전체 댓글 + 스크롤
  - [ ] 댓글 삭제 버튼 (본인만 표시, ⋯ 메뉴)
- [ ] CommentForm 컴포넌트 (`components/comment/CommentForm.tsx`)
  - [ ] "댓글 달기..." 입력창 (placeholder)
  - [ ] Enter 키 또는 "게시" 버튼으로 제출
  - [ ] 로딩 상태 표시
- [ ] `/api/comments` POST API (`app/api/comments/route.ts`)
  - [ ] 댓글 작성
  - [ ] 인증 확인 (Clerk)
  - [ ] 입력 검증 (빈 댓글 방지)

### 2-4. 댓글 기능 - 삭제 & 무한스크롤

- [ ] `/api/comments` DELETE API (`app/api/comments/[commentId]/route.ts`)
  - [ ] 댓글 삭제 (본인만)
  - [ ] 인증 확인 (Clerk)
  - [ ] 권한 확인 (댓글 작성자만 삭제 가능)
- [ ] 댓글 삭제 버튼 (본인만 표시)
  - [ ] ⋯ 메뉴 추가 (댓글 우측)
  - [ ] 삭제 확인 다이얼로그
- [ ] PostFeed 무한 스크롤
  - [ ] Intersection Observer 사용
  - [ ] 하단 도달 시 10개씩 추가 로드
  - [ ] 로딩 상태 표시 (Skeleton UI)
  - [ ] 더 이상 로드할 데이터 없을 때 처리

---

## 3. 프로필 페이지 & 팔로우 기능

### 3-1. 프로필 페이지 - 기본 정보

- [ ] `/profile/[userId]` 동적 라우트 (`app/(main)/profile/[userId]/page.tsx`)
  - [ ] 내 프로필: `/profile` (현재 사용자)
  - [ ] 다른 사람 프로필: `/profile/[userId]`
- [ ] ProfileHeader 컴포넌트 (`components/profile/ProfileHeader.tsx`)
  - [ ] 프로필 이미지 (150px Desktop / 90px Mobile, 원형)
  - [ ] 사용자명 (username)
  - [ ] fullname (선택사항)
  - [ ] 통계 (게시물 수, 팔로워, 팔로잉)
  - [ ] "팔로우"/"팔로잉" 버튼 (다른 사람 프로필)
  - [ ] "프로필 편집" 버튼 (내 프로필, 1차 제외)
- [ ] `/api/users/[userId]` GET API (`app/api/users/[userId]/route.ts`)
  - [ ] 사용자 정보 조회
  - [ ] 통계 정보 포함 (게시물 수, 팔로워, 팔로잉)
  - [ ] 현재 사용자 팔로우 여부 확인

### 3-2. 프로필 페이지 - 게시물 그리드

- [ ] PostGrid 컴포넌트 (`components/profile/PostGrid.tsx`)
  - [ ] 3열 그리드 레이아웃 (반응형)
  - [ ] 1:1 정사각형 썸네일
  - [ ] Hover 시 좋아요/댓글 수 표시 (오버레이)
  - [ ] 빈 상태 UI (게시물 없을 때)
- [ ] `/api/posts`에 `userId` 쿼리 파라미터 추가
  - [ ] 특정 사용자 게시물만 조회
  - [ ] 페이지네이션 지원
- [ ] 게시물 이미지 썸네일 표시
  - [ ] 이미지 최적화 (lazy loading)
- [ ] 클릭 시 게시물 상세 모달/페이지로 이동
  - [ ] Desktop: 모달 열기
  - [ ] Mobile: `/post/[postId]` 페이지로 이동

### 3-3. 팔로우 기능

- [ ] `follows` 테이블 생성 (Supabase 마이그레이션)
  - [ ] `id` (UUID, Primary Key)
  - [ ] `follower_id` (UUID, Foreign Key → users.id, ON DELETE CASCADE)
  - [ ] `following_id` (UUID, Foreign Key → users.id, ON DELETE CASCADE)
  - [ ] `created_at` (TIMESTAMPTZ, DEFAULT now())
  - [ ] Unique 제약 (follower_id, following_id) - 중복 팔로우 방지
  - [ ] 인덱스: `idx_follows_follower_id`, `idx_follows_following_id`
- [ ] `/api/follows` POST API (`app/api/follows/route.ts`)
  - [ ] 팔로우 추가
  - [ ] 중복 체크 (이미 팔로우한 경우 에러)
  - [ ] 자기 자신 팔로우 방지
  - [ ] 인증 확인 (Clerk)
- [ ] `/api/follows` DELETE API (`app/api/follows/[followingId]/route.ts`)
  - [ ] 언팔로우
  - [ ] 인증 확인 (Clerk)
- [ ] 팔로우/언팔로우 버튼 및 상태 관리
  - [ ] 미팔로우: "팔로우" (파란색, `--instagram-blue`)
  - [ ] 팔로우 중: "팔로잉" (회색)
  - [ ] Hover: "언팔로우" (빨간 테두리)
  - [ ] 클릭 시 즉시 API 호출 → UI 업데이트
  - [ ] 로딩 상태 표시

### 3-4. 게시물 상세 모달

- [ ] PostModal 컴포넌트 (`components/post/PostModal.tsx`)
  - [ ] Desktop: 모달 형태 (이미지 50% + 댓글 50%)
  - [ ] Mobile: 전체 페이지로 전환
  - [ ] 닫기 버튼 (✕)
  - [ ] 이미지 영역
    - [ ] 1:1 정사각형 이미지
    - [ ] 더블탭 좋아요 (모바일)
  - [ ] 댓글 목록 (스크롤 가능)
    - [ ] 전체 댓글 표시
    - [ ] 무한 스크롤 (필요 시)
  - [ ] 댓글 작성 폼 (하단 고정)
- [ ] `/post/[postId]` 페이지 (Mobile용)
  - [ ] `app/(main)/post/[postId]/page.tsx`
  - [ ] PostModal과 동일한 레이아웃
  - [ ] 뒤로가기 버튼

---

## 4. 최종 마무리 & 배포

### 4-1. 반응형 테스트

- [ ] Mobile (< 768px) 테스트
  - [ ] Bottom Navigation 동작
  - [ ] Sidebar 숨김 확인
  - [ ] PostCard 전체 너비 확인
  - [ ] Header 표시 확인
- [ ] Tablet (768px ~ 1023px) 테스트
  - [ ] Icon-only Sidebar (72px)
  - [ ] PostCard 최대 630px
  - [ ] Bottom Navigation 숨김 확인
- [ ] Desktop (1024px+) 테스트
  - [ ] Full Sidebar (244px)
  - [ ] PostCard 최대 630px 중앙 정렬
  - [ ] Header, Bottom Navigation 숨김 확인

### 4-2. 에러 핸들링 & UI 개선

- [ ] 에러 핸들링
  - [ ] API 에러 처리 (try-catch)
  - [ ] 네트워크 에러 처리
  - [ ] 사용자 친화적 에러 메시지
  - [ ] 에러 토스트/알림 표시
- [ ] Skeleton UI 완성
  - [ ] 모든 로딩 상태에 Skeleton 적용
  - [ ] PostCardSkeleton
  - [ ] ProfileHeaderSkeleton
  - [ ] PostGridSkeleton
- [ ] 빈 상태 UI
  - [ ] 게시물 없을 때
  - [ ] 댓글 없을 때
  - [ ] 프로필 게시물 없을 때

### 4-3. 배포

- [ ] Vercel 배포
  - [ ] 환경변수 설정 확인
    - [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
    - [ ] `CLERK_SECRET_KEY`
    - [ ] `NEXT_PUBLIC_SUPABASE_URL`
    - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] 빌드 성공 확인
  - [ ] 프로덕션 테스트
  - [ ] Supabase 마이그레이션 실행 확인

---

## 5. 추가 컴포넌트 & 유틸리티

### 5-1. UI 컴포넌트

- [ ] Button 컴포넌트 (`components/ui/Button.tsx`)
  - [ ] shadcn/ui Button 사용 또는 커스텀
  - [ ] Instagram 스타일 적용
- [ ] Avatar 컴포넌트 (`components/ui/Avatar.tsx`)
  - [ ] 원형 이미지
  - [ ] 다양한 크기 지원 (32px, 90px, 150px)
  - [ ] 기본 이미지 (프로필 없을 때)
- [ ] Skeleton 컴포넌트 (`components/ui/Skeleton.tsx`)
  - [ ] Shimmer 효과 애니메이션
  - [ ] 다양한 크기/형태 지원

### 5-2. 타입 정의

- [ ] `lib/types.ts` 생성
  - [ ] `User` 타입
    - [ ] `id`, `clerk_id`, `name`, `created_at`
  - [ ] `Post` 타입
    - [ ] `id`, `user_id`, `image_url`, `caption`, `created_at`, `updated_at`
    - [ ] `user` (User 정보)
    - [ ] `like_count`, `comment_count`
    - [ ] `is_liked` (현재 사용자 좋아요 여부)
  - [ ] `Comment` 타입
    - [ ] `id`, `post_id`, `user_id`, `content`, `created_at`
    - [ ] `user` (User 정보)
  - [ ] `Like` 타입
    - [ ] `id`, `post_id`, `user_id`, `created_at`
  - [ ] `Follow` 타입
    - [ ] `id`, `follower_id`, `following_id`, `created_at`

### 5-3. 유틸리티 함수

- [ ] 날짜 포맷팅 함수 (`lib/utils.ts` 또는 `lib/date.ts`)
  - [ ] "3시간 전", "2일 전", "1주 전" 형식
  - [ ] 상대 시간 계산
- [ ] 이미지 최적화 함수
  - [ ] Supabase Storage URL 변환
  - [ ] 이미지 리사이징 (필요 시)
- [ ] 텍스트 자르기 함수 (`lib/utils.ts`)
  - [ ] 캡션 "... 더 보기" 처리
  - [ ] 최대 줄 수 제한

---

## 6. 1차 MVP 제외 기능 (2차 확장)

다음 기능들은 1차 MVP에서는 제외:

- ❌ 검색 (사용자, 해시태그)
- ❌ 탐색 페이지
- ❌ 릴스
- ❌ 메시지 (DM)
- ❌ 알림
- ❌ 스토리
- ❌ 동영상
- ❌ 이미지 여러 장
- ❌ 공유 버튼 (UI만 있음)
- ❌ 북마크 (UI만 있음)
- ❌ 프로필 편집 (Clerk 기본 사용)
- ❌ 팔로워/팔로잉 목록 모달

---

## 참고

- PRD 문서: `.cursor/prd.md`
- 개발 순서는 PRD의 "11. 개발 순서" 섹션을 따릅니다.
- 데이터베이스 스키마:
  - `users` 테이블: `supabase/migrations/setup_schema.sql`
  - `posts` 테이블: `supabase/migrations/20250116033156_create_posts_table.sql`
  - Storage 버킷: `supabase/migrations/setup_storage.sql` (uploads)
