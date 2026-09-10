export default function StudentHomeLoading() {
  return (
    <main className="clublinked-page-background min-h-screen overflow-hidden px-5 py-10 sm:px-8 lg:px-12 xl:px-16">
      <div className="relative mx-auto max-w-7xl animate-pulse space-y-10">
        <div className="space-y-3"><div className="h-3 w-36 rounded bg-slate-200" /><div className="h-11 w-80 max-w-full rounded bg-slate-200" /><div className="h-5 w-96 max-w-full rounded bg-slate-200" /></div>
        <div className="grid gap-4 md:grid-cols-3">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-32 rounded-2xl bg-white" />)}</div>
        <div className="grid gap-8 xl:grid-cols-[1.65fr_0.85fr]"><div className="h-[520px] rounded-2xl bg-white" /><div className="h-[420px] rounded-2xl bg-white" /></div>
      </div>
    </main>
  );
}
