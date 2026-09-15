import { Skeleton } from "@/components/ui/skeleton";

export function TabLoading() {
  return (
    <div
      className="grid gap-7 lg:grid-cols-2"
      aria-busy="true"
      aria-label="Loading club content"
    >
      {[0, 1].map((item) => (
        <div
          key={item}
          className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80 sm:p-7"
        >
          <Skeleton className="h-6 w-40 bg-slate-200" />
          <div className="mt-5 space-y-3">
            <Skeleton className="h-4 w-full bg-slate-100" />
            <Skeleton className="h-4 w-5/6 bg-slate-100" />
            <Skeleton className="h-4 w-2/3 bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
