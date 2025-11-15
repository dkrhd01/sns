"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";

/**
 * @file MainLayoutClient.tsx
 * @description 메인 레이아웃 Client Component
 *
 * Sidebar, Header, BottomNav를 포함하는 Client Component
 * layout.tsx는 Server Component로 유지하고, 이 컴포넌트를 사용
 */

export function MainLayoutClient({ children }: { children: React.ReactNode }) {
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

