# 버그 수정 내역

## 프로필 페이지 관련 버그 수정 (2025-01-16)

### 문제점

1. **프로필 페이지가 작동하지 않음**
   - `userId`가 Clerk ID인지 Supabase user ID인지 불명확
   - 사용자를 찾을 수 없을 때 에러 처리 부족
   - API에서 userId 해석 로직 불일치

2. **API 엔드포인트 문제**
   - `/api/users/[userId]`가 Supabase user ID만 처리
   - `/api/posts?userId=...`가 Clerk ID를 제대로 처리하지 못함

### 수정 내용

#### 1. `/api/users/[userId]` API 개선

**변경 전:**
- `userId`를 Supabase user ID로만 가정
- `eq("id", userId)`만 사용

**변경 후:**
- `userId`가 Clerk ID인지 Supabase user ID인지 자동 감지
- 먼저 `id`로 조회, 없으면 `clerk_id`로 조회
- `actualUserId` 변수로 실제 Supabase user ID 사용

```typescript
// Supabase user ID로 조회 시도
const { data: userById } = await supabase
  .from("users")
  .select("id, clerk_id, name, created_at")
  .eq("id", userId)
  .maybeSingle();

if (userById) {
  userData = userById;
} else {
  // Clerk ID로 조회 시도
  const { data: userByClerkId } = await supabase
    .from("users")
    .select("id, clerk_id, name, created_at")
    .eq("clerk_id", userId)
    .maybeSingle();
  
  if (userByClerkId) {
    userData = userByClerkId;
  }
}

const actualUserId = userData.id; // 실제 Supabase user ID 사용
```

#### 2. 프로필 페이지 개선

**변경 전:**
- `targetUserData`가 없을 때 처리 없음
- `targetUserId`가 `userId`로 남아있을 수 있음

**변경 후:**
- 사용자를 찾을 수 없을 때 명확한 에러 메시지 표시
- `targetUserId`가 `null`일 때 처리 추가

```typescript
const { data: targetUserData } = await supabase
  .from("users")
  .select("id, clerk_id")
  .or(`id.eq.${userId},clerk_id.eq.${userId}`)
  .maybeSingle();

if (!targetUserData) {
  return (
    <div>사용자를 찾을 수 없습니다.</div>
  );
}

targetUserId = targetUserData.id; // Supabase user ID 사용
```

#### 3. `/api/posts` API 개선

**변경 전:**
- `userId` 조회 실패 시 조용히 빈 배열 반환

**변경 후:**
- `maybeSingle()` 사용으로 에러 방지
- 사용자를 찾을 수 없을 때 경고 로그 추가

```typescript
const { data: targetUser } = await supabase
  .from("users")
  .select("id")
  .or(`id.eq.${userId},clerk_id.eq.${userId}`)
  .maybeSingle(); // single() 대신 maybeSingle() 사용

if (!targetUser) {
  console.warn(`User not found: ${userId}`);
  return NextResponse.json({
    posts: [],
    hasMore: false,
  });
}
```

### 테스트 체크리스트

- [x] `/profile/[clerkId]` 접근 시 정상 작동
- [x] `/profile/[supabaseUserId]` 접근 시 정상 작동
- [x] 존재하지 않는 사용자 접근 시 에러 메시지 표시
- [x] 프로필 페이지에서 게시물 목록 표시
- [x] 팔로우/언팔로우 버튼 작동
- [x] 통계 (게시물 수, 팔로워, 팔로잉) 정확히 표시

### 추가 개선 사항

1. **에러 메시지 개선**
   - 사용자 친화적인 에러 메시지
   - 데이터베이스 테이블이 없을 때 안내 메시지

2. **타입 안정성**
   - `maybeSingle()` 사용으로 null 처리 개선
   - 타입 가드 추가

3. **로깅**
   - 사용자를 찾을 수 없을 때 경고 로그 추가
   - 디버깅 용이성 향상

