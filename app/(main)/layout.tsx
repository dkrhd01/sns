import { MainLayoutClient } from "@/components/layout/MainLayoutClient";

/**
 * @file layout.tsx
 * @description 메인 앱 레이아웃 (Route Group: (main))
 *
 * Server Component로 유지하여 Vercel 빌드 에러 방지
 * Client Component는 MainLayoutClient로 분리
 */

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayoutClient>{children}</MainLayoutClient>;
}

