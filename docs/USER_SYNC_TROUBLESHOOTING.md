# 사용자 동기화 문제 해결 가이드

## 문제: "사용자를 찾을 수 없습니다"

### 원인

이 에러는 Supabase `users` 테이블에 사용자 정보가 동기화되지 않았을 때 발생합니다.

**가능한 원인:**
1. Clerk로 로그인했지만 Supabase에 동기화되지 않음
2. `SyncUserProvider`가 작동하지 않음
3. `users` 테이블이 생성되지 않음
4. 동기화 API 호출 실패

### 해결 방법

#### 1. 수동 동기화 (즉시 해결)

**방법 A: 브라우저 콘솔에서 실행**

1. 브라우저 개발자 도구 열기 (F12)
2. Console 탭으로 이동
3. 다음 코드 실행:

```javascript
fetch('/api/sync-user', { method: 'POST' })
  .then(res => res.json())
  .then(data => {
    console.log('동기화 결과:', data);
    if (data.success) {
      window.location.reload();
    }
  })
  .catch(err => console.error('동기화 실패:', err));
```

**방법 B: `/auth-test` 페이지 사용**

1. `/auth-test` 페이지로 이동
2. "사용자 데이터 가져오기 또는 생성" 버튼 클릭
3. 동기화 완료 후 프로필 페이지로 이동

#### 2. 자동 동기화 확인

**SyncUserProvider 확인:**

1. `app/layout.tsx`에 `SyncUserProvider`가 포함되어 있는지 확인
2. 브라우저 콘솔에서 동기화 에러 확인
3. 네트워크 탭에서 `/api/sync-user` 호출 확인

**동기화 로그 확인:**

브라우저 콘솔에서 다음 메시지 확인:
- ✅ `"User synced successfully"` - 성공
- ❌ `"Failed to sync user"` - 실패 (에러 메시지 확인)

#### 3. 데이터베이스 확인

**Supabase Dashboard에서 확인:**

1. Supabase Dashboard → **Table Editor** → **users** 테이블
2. 현재 로그인한 사용자의 `clerk_id`로 검색
3. 데이터가 없으면 동기화 필요

**SQL로 확인:**

```sql
SELECT * FROM users WHERE clerk_id = 'your_clerk_user_id';
```

#### 4. 동기화 API 테스트

**Postman 또는 curl로 테스트:**

```bash
curl -X POST http://localhost:3000/api/sync-user \
  -H "Cookie: __clerk_db_jwt=your_jwt_token"
```

또는 브라우저에서 직접:
- 로그인 상태에서 `/api/sync-user` POST 요청

### 예방 방법

#### 1. 로그인 후 자동 동기화 확인

`SyncUserProvider`가 제대로 작동하는지 확인:

```typescript
// app/layout.tsx
<SyncUserProvider>{children}</SyncUserProvider>
```

#### 2. 동기화 상태 모니터링

브라우저 콘솔에서 동기화 에러 모니터링:
- 동기화 실패 시 자동 재시도
- 에러 로그 확인

#### 3. 프로필 페이지 접근 전 동기화

프로필 페이지에서 사용자를 찾을 수 없을 때 자동으로 동기화 시도 (이미 구현됨)

### 디버깅 체크리스트

- [ ] Clerk 로그인 상태 확인
- [ ] Supabase `users` 테이블 존재 확인
- [ ] `SyncUserProvider`가 `app/layout.tsx`에 포함되어 있는지 확인
- [ ] 브라우저 콘솔에서 동기화 에러 확인
- [ ] 네트워크 탭에서 `/api/sync-user` 호출 확인
- [ ] Supabase Dashboard에서 사용자 데이터 확인
- [ ] 수동 동기화 시도

### 추가 정보

**관련 파일:**
- `hooks/use-sync-user.ts` - 동기화 훅
- `components/providers/sync-user-provider.tsx` - 동기화 프로바이더
- `app/api/sync-user/route.ts` - 동기화 API
- `app/(main)/profile/[userId]/page.tsx` - 프로필 페이지 (자동 동기화 포함)

**관련 문서:**
- `docs/TROUBLESHOOTING.md` - 일반적인 문제 해결
- `docs/BUGFIX.md` - 버그 수정 내역

