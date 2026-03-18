import { Skeleton } from "@/components/ui/skeleton";

export default function ClubSearchLoading() {
  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto w-full max-w-5xl px-5 pb-10 pt-8">
        {/* Title + search — constrained to match real page */}
        <div className="mx-auto max-w-xl">
          <Skeleton className="h-12 w-56" />

          {/* Search bar */}
          <Skeleton className="mt-6 h-14 w-full rounded-full" />

          {/* Category filter */}
          <Skeleton className="mt-5 h-10 w-48 rounded-md" />
        </div>

        {/* Club card grid — mirrors grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 */}
        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border-0 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                {/* Club logo placeholder */}
                <Skeleton className="h-12 w-12 shrink-0 rounded-md" />

                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="mt-1 h-6 w-20 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
