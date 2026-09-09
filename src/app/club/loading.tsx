export default function StudentHomeLoading() {
  return (
    <main className="min-h-screen bg-[#F7F8FA] px-5 py-10 sm:px-8 lg:px-12 xl:px-16">
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="h-4 w-40 rounded bg-slate-200" />
        <div className="mt-4 h-11 w-96 max-w-full rounded-xl bg-slate-200" />
        <div className="mt-12 grid gap-4 md:grid-cols-3">{[0, 1, 2].map((item) => <div key={item} className="h-32 rounded-2xl bg-white" />)}</div>
        <div className="mt-10 grid gap-8 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.85fr)]"><div className="h-[520px] rounded-2xl bg-white" /><div className="h-[520px] rounded-2xl bg-white" /></div>
      </div>
    </main>
  );
}
