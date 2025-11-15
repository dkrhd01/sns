"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Home, Search, Plus, Heart, User } from "lucide-react";
import { CreatePostModal } from "@/components/post/CreatePostModal";

/**
 * @file BottomNav.tsx
 * @description Mobile 전용 하단 네비게이션 컴포넌트
 *
 * Mobile (<768px)에서만 표시
 * 높이: 50px
 * 5개 아이콘: 홈, 검색, 만들기, 좋아요, 프로필
 */

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const navItems = [
    {
      icon: Home,
      href: "/",
      active: pathname === "/",
      label: "홈",
    },
    {
      icon: Search,
      href: "/explore",
      active: pathname === "/explore",
      label: "검색",
    },
    {
      icon: Plus,
      href: "#",
      active: false,
      label: "만들기",
      onClick: () => setIsCreateModalOpen(true),
    },
    {
      icon: Heart,
      href: "/activity",
      active: pathname === "/activity",
      label: "좋아요",
    },
    {
      icon: User,
      href: user ? `/profile/${user.id}` : "/profile",
      active: pathname?.startsWith("/profile"),
      label: "프로필",
    },
  ];

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[50px] bg-[var(--instagram-card-background)] border-t border-[var(--instagram-border)] z-50">
        <div className="flex items-center justify-around h-full">
          {navItems.map((item) => {
            const Icon = item.icon;

            if (item.onClick) {
              return (
                <button
                  key={item.href}
                  onClick={item.onClick}
                  className={`
                    flex items-center justify-center p-2 transition-colors
                    ${
                      item.active
                        ? "text-[var(--instagram-text-primary)]"
                        : "text-[var(--instagram-text-secondary)]"
                    }
                  `}
                  aria-label={item.label}
                >
                  <Icon
                    className={`w-6 h-6 ${
                      item.active ? "stroke-[2.5]" : "stroke-2"
                    }`}
                  />
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center justify-center p-2 transition-colors
                  ${
                    item.active
                      ? "text-[var(--instagram-text-primary)]"
                      : "text-[var(--instagram-text-secondary)]"
                  }
                `}
                aria-label={item.label}
              >
                <Icon
                  className={`w-6 h-6 ${
                    item.active ? "stroke-[2.5]" : "stroke-2"
                  }`}
                />
              </Link>
            );
          })}
        </div>
      </nav>
      <CreatePostModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </>
  );
}

