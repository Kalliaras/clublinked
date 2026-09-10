export default function ApplicationsLoading() {
  return (
    <main className="clublinked-page-background min-h-screen px-5 py-10 sm:px-8 lg:px-14">
      <div className="mx-auto max-w-6xl animate-pulse">
        <div className="h-11 w-72 rounded-xl bg-slate-200" />
        <div className="mt-4 h-5 w-96 max-w-full rounded bg-slate-200" />
        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-3">{[0, 1, 2].map((item) => <div key={item} className="h-28 rounded-2xl bg-white" />)}</div>
          <div className="h-80 rounded-2xl bg-white" />
        </div>
      </div>
    </main>
  );
}
