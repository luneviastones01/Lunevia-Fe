export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-secondary/50 border border-border/20 ${className}`}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="w-full aspect-square rounded-md" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-5 w-2/3" />
      </div>
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="text-center mb-12 space-y-3">
      <Skeleton className="h-3 w-24 mx-auto" />
      <Skeleton className="h-8 w-64 mx-auto" />
    </div>
  );
}

export function ProductDetailsSkeleton() {
  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="container mx-auto px-6 max-w-6xl">
        <Skeleton className="h-4 w-36 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <Skeleton className="w-full aspect-square rounded-xl" />
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-10 w-3/4" />
            </div>
            <Skeleton className="h-28 w-full rounded-lg" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-14 w-full rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PageContentSkeleton() {
  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="container mx-auto px-6 max-w-3xl space-y-6">
        <Skeleton className="h-4 w-32 mb-6" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-4 w-40 mb-8" />
        <div className="space-y-4 pt-4">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-6 w-1/2 pt-4" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    </div>
  );
}
