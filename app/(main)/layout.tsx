"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";

/**
 * @file layout.tsx
 * @description 메인 앱 레이아웃 (Route Group: (main))
 *
 * Sidebar, Header, BottomNav를 통합한 반응형 레이아웃
 * - Desktop: Sidebar (244px) + Main Content (max 630px)
 * - Tablet: Icon-only Sidebar (72px) + Main Content
 * - Mobile: Header (60px) + Main Content + BottomNav (50px)
 */

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--instagram-background)]">
      <Sidebar />
      <Header />

      {/* Main Content */}
      <main
        className={`
          md:ml-[72px] lg:ml-[244px]
          pt-[60px] md:pt-0
          pb-[50px] md:pb-0
          flex justify-center
        `}
      >
        <div className="w-full max-w-[630px] px-0 md:px-4 py-4 md:py-8">
          {children}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

