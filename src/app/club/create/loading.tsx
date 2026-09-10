export default function CreateClubLoading() {
  return (
    <main className="clublinked-page-background min-h-screen px-5 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="h-5 w-28 rounded bg-blue-100" />
        <div className="mt-8 h-10 w-72 max-w-full rounded-lg bg-slate-200" />
        <div className="mt-3 h-5 w-full max-w-xl rounded bg-slate-100" />
        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6 rounded-3xl border border-blue-100 bg-white/80 p-6 sm:p-8">
            <div className="h-44 rounded-2xl bg-blue-50" />
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="h-14 rounded-xl bg-slate-100" />
              <div className="h-14 rounded-xl bg-slate-100" />
            </div>
            <div className="h-28 rounded-xl bg-slate-100" />
            <div className="h-28 rounded-xl bg-slate-100" />
          </div>
          <div className="h-72 rounded-3xl border border-blue-100 bg-white/80" />
        </div>
      </div>
    </main>
  );
}
