import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";
import { Geist, Geist_Mono } from "next/font/google";

import Navbar from "@/components/Navbar";
import { SyncUserProvider } from "@/components/providers/sync-user-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SaaS 템플릿",
  description: "Next.js + Clerk + Supabase 보일러플레이트",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 빌드 타임에 환경변수가 없을 때도 빌드가 성공하도록 처리
  // Vercel에서는 반드시 환경변수를 설정해야 정상 작동
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // 환경변수가 없으면 ClerkProvider 없이 렌더링 (빌드 성공을 위해)
  // 실제 배포 시에는 Vercel에서 환경변수를 설정해야 함
  if (!publishableKey) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "⚠️ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is missing. Clerk features will not work."
      );
    }

    return (
      <html lang="ko">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">환경변수 설정 필요</h1>
              <p className="text-gray-600 mb-2">
                NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY가 설정되지 않았습니다.
              </p>
              <p className="text-sm text-gray-500">
                Vercel Dashboard에서 환경변수를 설정해주세요.
              </p>
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey} localization={koKR}>
      <html lang="ko">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <SyncUserProvider>
            <Navbar />
            {children}
          </SyncUserProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
