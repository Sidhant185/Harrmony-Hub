export function SkeletonLoader({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-white/10 rounded-lg h-full w-full" />
    </div>
  )
}

export function SongCardSkeleton() {
  return (
    <div className="bg-[#181818] rounded-lg p-4 space-y-3">
      <SkeletonLoader className="aspect-square rounded-md" />
      <div className="space-y-2">
        <SkeletonLoader className="h-4 w-3/4 rounded" />
        <SkeletonLoader className="h-3 w-1/2 rounded" />
      </div>
    </div>
  )
}

export function PlaylistCardSkeleton() {
  return <SongCardSkeleton />
}

export function SongListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-3 rounded-lg bg-white/5"
        >
          <SkeletonLoader className="w-8 h-8 rounded" />
          <SkeletonLoader className="flex-1 h-4 rounded" />
          <SkeletonLoader className="w-16 h-4 rounded" />
        </div>
      ))}
    </div>
  )
}

