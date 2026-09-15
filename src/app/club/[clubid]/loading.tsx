import { Skeleton } from "@/components/ui/skeleton";

export default function ClubPageLoading() {
  return (
    <main
      className="clublinked-page-background min-h-screen"
      aria-busy="true"
      aria-label="Loading club page"
    >
      <Skeleton className="h-[220px] w-full rounded-none bg-blue-100/80 sm:h-[280px]" />

      <div className="mx-auto w-full max-w-5xl px-5 pt-8 sm:px-8 lg:px-12">
        <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:gap-7">
          <Skeleton className="size-24 shrink-0 rounded-full bg-blue-100 sm:size-[120px]" />
          <div className="min-w-0 flex-1 space-y-3 sm:pb-3">
            <Skeleton className="h-4 w-40 bg-slate-200" />
            <Skeleton className="h-10 w-3/4 max-w-md bg-slate-200" />
          </div>
          <Skeleton className="h-11 w-28 rounded-xl bg-blue-100 sm:mb-3" />
        </div>

        <div className="mb-7 flex min-h-14 flex-wrap items-center gap-6 rounded-2xl bg-white/70 px-5 py-4 shadow-sm ring-1 ring-slate-200/70">
          <Skeleton className="h-4 w-28 bg-slate-200" />
          <Skeleton className="h-4 w-28 bg-slate-200" />
          <Skeleton className="h-4 w-36 bg-slate-200" />
        </div>

        <div className="flex gap-2 overflow-hidden rounded-xl bg-slate-100/80 p-1.5">
          {[80, 72, 76, 82, 116, 68].map((width) => (
            <Skeleton
              key={width}
              className="h-10 shrink-0 rounded-lg bg-white/80"
              style={{ width }}
            />
          ))}
        </div>

        <div className="grid gap-7 py-10 sm:py-12 lg:grid-cols-2">
          {[0, 1].map((item) => (
            <div
              key={item}
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80 sm:p-7"
            >
              <Skeleton className="h-6 w-36 bg-slate-200" />
              <div className="mt-5 space-y-3">
                <Skeleton className="h-4 w-full bg-slate-100" />
                <Skeleton className="h-4 w-11/12 bg-slate-100" />
                <Skeleton className="h-4 w-3/4 bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
