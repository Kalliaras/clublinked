import { Card } from "@/components/ui/card";

export function TabLoading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading club content">
      <Card className="border-slate-200 p-6">
        <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
        <div className="mt-5 space-y-3">
          <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
        </div>
      </Card>
    </div>
  );
}
