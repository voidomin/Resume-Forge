export function SkeletonLoader({
  className = "",
  count = 1,
}: {
  readonly className?: string;
  readonly count?: number;
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          className={`bg-gray-200 rounded-xl animate-pulse ${className}`}
        />
      ))}
    </>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 bg-gray-200 rounded-lg w-1/3"></div>
        <div className="h-4 bg-gray-200 rounded-lg w-1/4"></div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <SkeletonLoader className="h-48" count={3} />
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded-lg w-1/4"></div>
          <div className="h-8 bg-gray-200 rounded-lg w-24"></div>
        </div>
        <div className="space-y-4">
          <SkeletonLoader className="h-20" count={3} />
        </div>
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl flex gap-6 animate-pulse">
      {/* Sidebar Skeleton */}
      <div className="w-64 flex-shrink-0 hidden md:block space-y-3">
        <SkeletonLoader className="h-12" count={6} />
      </div>

      {/* Content Skeleton */}
      <div className="flex-1 space-y-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 space-y-6">
          <div className="h-8 bg-gray-200 rounded-lg w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <SkeletonLoader className="h-12" count={2} />
          </div>
          <SkeletonLoader className="h-12" count={4} />
          <SkeletonLoader className="h-32" count={1} />
        </div>
      </div>
    </div>
  );
}

export function ResumeSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl animate-pulse">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Preview Area Skeleton */}
        <div className="flex-1 bg-white rounded-xl shadow-lg border border-gray-100 p-8 min-h-[800px]">
          <div className="h-10 bg-gray-200 rounded-lg w-1/3 mb-8 mx-auto"></div>
          <div className="space-y-4 mb-8">
            <SkeletonLoader className="h-4" count={3} />
          </div>
          <div className="h-8 bg-gray-200 rounded-lg w-1/4 mb-4"></div>
          <div className="space-y-4 mb-8">
            <SkeletonLoader className="h-20" count={2} />
          </div>
          <div className="h-8 bg-gray-200 rounded-lg w-1/4 mb-4"></div>
          <div className="space-y-4 mb-8">
            <SkeletonLoader className="h-20" count={2} />
          </div>
        </div>

        {/* Sidebar Controls Skeleton */}
        <div className="lg:w-80 space-y-6 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 space-y-4">
            <div className="h-6 bg-gray-200 rounded-lg w-1/2 mb-4"></div>
            <SkeletonLoader className="h-10" count={4} />
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 space-y-4">
            <div className="h-6 bg-gray-200 rounded-lg w-1/2 mb-4"></div>
            <SkeletonLoader className="h-12" count={2} />
          </div>
        </div>
      </div>
    </div>
  );
}
