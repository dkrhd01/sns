"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * @file Avatar.tsx
 * @description 원형 프로필 이미지 컴포넌트
 *
 * 다양한 크기를 지원하는 Avatar 컴포넌트
 * - sm: 32px (PostCard 헤더)
 * - md: 90px (Mobile 프로필)
 * - lg: 150px (Desktop 프로필)
 */

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: 32,
  md: 90,
  lg: 150,
};

export function Avatar({ src, alt = "프로필", size = "sm", className }: AvatarProps) {
  const sizePx = sizeMap[size];

  // 기본 아바타 이미지 (프로필 없을 때)
  const defaultAvatar = (
    <div
      className={cn(
        "rounded-full bg-gray-200 flex items-center justify-center",
        className
      )}
      style={{ width: sizePx, height: sizePx }}
    >
      <svg
        className="text-gray-400"
        width={sizePx * 0.6}
        height={sizePx * 0.6}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );

  if (!src) {
    return defaultAvatar;
  }

  return (
    <div
      className={cn("relative rounded-full overflow-hidden", className)}
      style={{ width: sizePx, height: sizePx }}
    >
      <Image
        src={src}
        alt={alt}
        width={sizePx}
        height={sizePx}
        className="object-cover"
        unoptimized
      />
    </div>
  );
}

