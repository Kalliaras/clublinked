export default function CalendarLoading() {
  return (
    <main className="clublinked-page-background min-h-screen px-5 py-10 sm:px-8 lg:px-14">
      <div className="mx-auto max-w-7xl animate-pulse">
        <div className="h-11 w-80 rounded-xl bg-slate-200" />
        <div className="mt-4 h-5 w-96 max-w-full rounded bg-slate-200" />
        <div className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="h-[680px] rounded-2xl bg-white" />
          <div className="h-96 rounded-2xl bg-white" />
        </div>
      </div>
    </main>
  );
}
