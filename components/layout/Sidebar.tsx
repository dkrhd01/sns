"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Home, Search, Plus, User } from "lucide-react";
import { CreatePostModal } from "@/components/post/CreatePostModal";

/**
 * @file Sidebar.tsx
 * @description Instagram 스타일 사이드바 컴포넌트
 *
 * Desktop (≥1024px): 244px 너비, 아이콘 + 텍스트
 * Tablet (768px~1023px): 72px 너비, 아이콘만
 * Mobile (<768px): 숨김
 */

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const menuItems = [
    {
      icon: Home,
      label: "홈",
      href: "/",
      active: pathname === "/",
    },
    {
      icon: Search,
      label: "검색",
      href: "/explore",
      active: pathname === "/explore",
    },
    {
      icon: Plus,
      label: "만들기",
      href: "#",
      active: false,
      onClick: () => setIsCreateModalOpen(true),
    },
    {
      icon: User,
      label: "프로필",
      href: user ? `/profile/${user.id}` : "/profile",
      active: pathname?.startsWith("/profile"),
    },
  ];

  return (
    <>
      <aside className="hidden md:flex md:flex-col md:fixed md:left-0 md:top-0 md:h-screen md:bg-[var(--instagram-card-background)] md:border-r md:border-[var(--instagram-border)] lg:w-[244px] md:w-[72px] z-40">
        <div className="flex flex-col p-4 gap-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.active;

            if (item.onClick) {
              return (
                <button
                  key={item.href}
                  onClick={item.onClick}
                  className={`
                    flex items-center gap-4 px-4 py-3 rounded-lg transition-colors
                    ${
                      isActive
                        ? "font-bold text-[var(--instagram-text-primary)]"
                        : "text-[var(--instagram-text-primary)] hover:bg-gray-100"
                    }
                  `}
                >
                  <Icon
                    className={`w-6 h-6 ${
                      isActive ? "stroke-[2.5]" : "stroke-2"
                    }`}
                  />
                  <span className="lg:inline-block md:hidden">{item.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-4 px-4 py-3 rounded-lg transition-colors
                  ${
                    isActive
                      ? "font-bold text-[var(--instagram-text-primary)]"
                      : "text-[var(--instagram-text-primary)] hover:bg-gray-100"
                  }
                `}
              >
                <Icon
                  className={`w-6 h-6 ${
                    isActive ? "stroke-[2.5]" : "stroke-2"
                  }`}
                />
                <span className="lg:inline-block md:hidden">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </aside>
      <CreatePostModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />
    </>
  );
}

