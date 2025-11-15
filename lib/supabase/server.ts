import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

/**
 * Clerk + Supabase 네이티브 통합 클라이언트 (Server Component용)
 *
 * 2025년 4월부터 권장되는 방식:
 * - JWT 템플릿 불필요
 * - Clerk 토큰을 Supabase가 자동 검증
 * - auth().getToken()으로 현재 세션 토큰 사용
 *
 * @example
 * ```tsx
 * // Server Component
 * import { createClerkSupabaseClient } from '@/lib/supabase/server';
 *
 * export default async function MyPage() {
 *   const supabase = createClerkSupabaseClient();
 *   const { data } = await supabase.from('table').select('*');
 *   return <div>...</div>;
 * }
 * ```
 */
export function createClerkSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 빌드 타임에는 환경변수가 없을 수 있으므로, 런타임에만 검증
  if (!supabaseUrl || !supabaseKey) {
    console.error(
      "⚠️ Supabase URL or Anon Key is missing. Please check your environment variables."
    );
    // 빌드 타임 에러 방지를 위해 더미 URL 사용 (런타임에 에러 발생)
    return createClient(
      supabaseUrl || "https://placeholder.supabase.co",
      supabaseKey || "placeholder-key",
      {
        async accessToken() {
          try {
            const authResult = await auth();
            const token = await authResult.getToken();
            return token ?? null;
          } catch (error) {
            console.warn("Failed to get Clerk token:", error);
            return null;
          }
        },
      }
    );
  }

  return createClient(supabaseUrl, supabaseKey, {
    async accessToken() {
      try {
        const authResult = await auth();
        const token = await authResult.getToken();
        // 토큰이 없을 때는 null 반환 (RLS가 비활성화된 경우에도 작동)
        return token ?? null;
      } catch (error) {
        console.warn("Failed to get Clerk token:", error);
        return null;
      }
    },
  });
}
