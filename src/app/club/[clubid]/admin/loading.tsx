export default function AdminDashboardLoading() {
  return (
    <div className="flex min-h-screen bg-[#F7F8FA]">
      <aside className="fixed inset-y-0 left-0 w-[260px] border-r border-slate-200 bg-white p-5">
        <div className="h-8 w-32 animate-pulse rounded-lg bg-slate-100" />
        <div className="mt-7 h-16 animate-pulse rounded-xl bg-slate-100" />
        <div className="mt-7 space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-10 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      </aside>
      <main className="ml-[260px] flex-1 px-8 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="h-9 w-64 animate-pulse rounded-lg bg-slate-200" />
          <div className="mt-8 grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-36 animate-pulse rounded-2xl bg-white" />
            ))}
          </div>
          <div className="mt-6 h-40 animate-pulse rounded-2xl bg-white" />
          <div className="mt-6 grid grid-cols-[2fr_1fr] gap-6">
            <div className="h-80 animate-pulse rounded-2xl bg-white" />
            <div className="h-80 animate-pulse rounded-2xl bg-white" />
          </div>
        </div>
      </main>
    </div>
  );
}
