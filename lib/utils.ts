import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 날짜를 상대 시간 형식으로 변환 (예: "3시간 전", "2일 전")
 * @param date Date 객체 또는 ISO 문자열
 * @returns 한국어 형식의 상대 시간 문자열
 */
export function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const targetDate = typeof date === "string" ? new Date(date) : date;
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "방금 전";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}분 전`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}시간 전`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}일 전`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}주 전`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths}개월 전`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears}년 전`;
}

/**
 * 텍스트를 지정된 줄 수로 자르고 "... 더 보기" 추가
 * @param text 원본 텍스트
 * @param maxLines 최대 줄 수
 * @returns 자른 텍스트와 전체 텍스트 여부
 */
export function truncateText(text: string, maxLines: number = 2): {
  truncated: string;
  isTruncated: boolean;
} {
  if (!text) {
    return { truncated: "", isTruncated: false };
  }

  const lines = text.split("\n");
  if (lines.length <= maxLines) {
    return { truncated: text, isTruncated: false };
  }

  const truncated = lines.slice(0, maxLines).join("\n");
  return { truncated, isTruncated: true };
}
