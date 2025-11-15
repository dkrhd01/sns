"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Heart, Send, User } from "lucide-react";

/**
 * @file Header.tsx
 * @description Mobile 전용 헤더 컴포넌트
 *
 * Mobile (<768px)에서만 표시
 * 높이: 60px
 * 로고 + 알림/DM/프로필 아이콘
 */

export function Header() {
  const { user } = useUser();

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 h-[60px] bg-[var(--instagram-card-background)] border-b border-[var(--instagram-border)] z-50">
      <div className="flex items-center justify-between h-full px-4">
        {/* 좌측: Instagram 로고 */}
        <Link href="/" className="text-xl font-bold">
          Instagram
        </Link>

        {/* 우측: 아이콘 버튼들 */}
        <div className="flex items-center gap-4">
          <Link
            href="/activity"
            className="p-2 hover:opacity-70 transition-opacity"
            aria-label="알림"
          >
            <Heart className="w-6 h-6" />
          </Link>
          <Link
            href="/direct"
            className="p-2 hover:opacity-70 transition-opacity"
            aria-label="메시지"
          >
            <Send className="w-6 h-6" />
          </Link>
          <Link
            href={user ? `/profile/${user.id}` : "/profile"}
            className="p-2 hover:opacity-70 transition-opacity"
            aria-label="프로필"
          >
            <User className="w-6 h-6" />
          </Link>
        </div>
      </div>
    </header>
  );
}

