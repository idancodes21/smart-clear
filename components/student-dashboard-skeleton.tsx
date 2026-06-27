import { Skeleton } from "@/components/ui/skeleton";

export default function StudentDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Skeleton className="h-10 w-44" />

          <div className="flex gap-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-6xl space-y-6 px-4 py-8">

        {/* Student Card */}
        <div className="rounded-xl border bg-white p-6">
          <Skeleton className="mb-6 h-6 w-48" />

          <div className="grid gap-6 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="mb-2 h-4 w-24" />
                <Skeleton className="h-5 w-40" />
              </div>
            ))}
          </div>
        </div>

        {/* Progress */}
        <div className="rounded-xl border bg-white p-6">
          <Skeleton className="mb-4 h-5 w-48" />

          <Skeleton className="h-3 w-full" />

          <div className="mt-6 grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="mx-auto h-8 w-10" />
                <Skeleton className="mx-auto mt-2 h-4 w-16" />
              </div>
            ))}
          </div>
        </div>

        {/* Clearance Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border bg-white p-6"
            >
              <Skeleton className="mb-5 h-5 w-40" />

              <Skeleton className="mb-10 h-4 w-24" />

              <Skeleton className="ml-auto h-10 w-32" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}