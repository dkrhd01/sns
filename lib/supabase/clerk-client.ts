"use client";

import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@clerk/nextjs";
import { useMemo } from "react";

/**
 * Clerk + Supabase 네이티브 통합 클라이언트 (Client Component용)
 *
 * 2025년 4월부터 권장되는 방식:
 * - JWT 템플릿 불필요
 * - useAuth().getToken()으로 현재 세션 토큰 사용
 * - React Hook으로 제공되어 Client Component에서 사용
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { useClerkSupabaseClient } from '@/lib/supabase/clerk-client';
 *
 * export default function MyComponent() {
 *   const supabase = useClerkSupabaseClient();
 *
 *   async function fetchData() {
 *     const { data } = await supabase.from('table').select('*');
 *     return data;
 *   }
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function useClerkSupabaseClient() {
  const { getToken } = useAuth();

  const supabase = useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // 빌드 타임에는 환경변수가 없을 수 있으므로, 런타임에만 검증
    // 빌드가 성공하도록 기본값 사용 (실제 사용 시 에러 발생)
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
              const token = await getToken();
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
          const token = await getToken();
          // 토큰이 없을 때는 null 반환 (RLS가 비활성화된 경우에도 작동)
          return token ?? null;
        } catch (error) {
          console.warn("Failed to get Clerk token:", error);
          return null;
        }
      },
    });
  }, [getToken]);

  return supabase;
}
