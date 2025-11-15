import { cn } from "@/lib/utils"

/**
 * @file skeleton.tsx
 * @description Skeleton 로딩 UI 컴포넌트
 *
 * Shimmer 효과가 있는 Skeleton 컴포넌트
 */

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "bg-gray-200 animate-pulse rounded-md relative overflow-hidden",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent",
        className
      )}
      {...props}
    />
  )
}

function SkeletonCircle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <Skeleton
      className={cn("rounded-full", className)}
      {...props}
    />
  )
}

function SkeletonText({ 
  lines = 1, 
  className, 
  ...props 
}: React.ComponentProps<"div"> & { lines?: number }) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  )
}

export { Skeleton, SkeletonCircle, SkeletonText }
