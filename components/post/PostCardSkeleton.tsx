import { Skeleton, SkeletonCircle, SkeletonText } from "@/components/ui/skeleton";

/**
 * @file PostCardSkeleton.tsx
 * @description PostCard 로딩 스켈레톤 컴포넌트
 *
 * PostCard와 동일한 레이아웃 구조의 Skeleton UI
 */

export function PostCardSkeleton() {
  return (
    <article className="bg-[var(--instagram-card-background)] border border-[var(--instagram-border)] rounded-none mb-4">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-4 py-3 h-[60px]">
        <div className="flex items-center gap-3">
          <SkeletonCircle className="w-8 h-8" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="w-5 h-5 rounded" />
      </header>

      {/* 이미지 영역 */}
      <Skeleton className="aspect-square w-full" />

      {/* 액션 버튼 */}
      <div className="flex items-center justify-between px-4 py-2 h-[48px]">
        <div className="flex items-center gap-4">
          <Skeleton className="w-6 h-6 rounded" />
          <Skeleton className="w-6 h-6 rounded" />
          <Skeleton className="w-6 h-6 rounded" />
        </div>
        <Skeleton className="w-6 h-6 rounded" />
      </div>

      {/* 컨텐츠 영역 */}
      <div className="px-4 pb-4 space-y-2">
        <Skeleton className="h-4 w-24" />
        <SkeletonText lines={2} />
        <Skeleton className="h-3 w-32" />
      </div>
    </article>
  );
}

