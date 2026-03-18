import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="rounded-lg border bg-white p-8 shadow-sm">
          {/* Header row: avatar + name / action buttons */}
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            {/* Left: avatar + name lines */}
            <div className="flex items-start gap-5">
              <Skeleton className="h-16 w-16 shrink-0 rounded-full" />
              <div className="space-y-2 pt-1">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>

            {/* Right: button + social icons */}
            <div className="flex items-center gap-4 md:flex-col md:items-end">
              <Skeleton className="h-9 w-28 rounded-xl" />
              <div className="flex items-center gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-5 w-5 rounded-full" />
                ))}
              </div>
            </div>
          </div>

          {/* Role badge chips */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Skeleton className="h-9 w-40 rounded-lg" />
            <Skeleton className="h-9 w-36 rounded-lg" />
            <Skeleton className="h-9 w-32 rounded-lg" />
          </div>

          {/* Divider */}
          <div className="my-8 h-px w-full bg-slate-200" />

          {/* Content cards */}
          <div className="space-y-6">
            {/* At a glance */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <Skeleton className="h-5 w-28" />
              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            </div>

            {/* Interests & focus */}
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <Skeleton className="h-5 w-36" />
              <div className="mt-4 flex flex-wrap gap-3">
                <Skeleton className="h-9 w-24 rounded-full" />
                <Skeleton className="h-9 w-28 rounded-full" />
                <Skeleton className="h-9 w-20 rounded-full" />
                <Skeleton className="h-9 w-32 rounded-full" />
              </div>
            </div>

            {/* Bottom row: Key highlights (2/3) + Campus activity (1/3) */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
                <Skeleton className="h-5 w-32" />
                <div className="mt-5">
                  <Skeleton className="h-4 w-16" />
                  <div className="mt-3 flex flex-wrap gap-3">
                    <Skeleton className="h-9 w-20 rounded-full" />
                    <Skeleton className="h-9 w-28 rounded-full" />
                    <Skeleton className="h-9 w-24 rounded-full" />
                    <Skeleton className="h-9 w-16 rounded-full" />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="mt-4 h-14 w-20" />
                <Skeleton className="mt-2 h-4 w-40" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
