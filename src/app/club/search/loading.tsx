export default function ClubDiscoveryLoading() {
  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto w-full max-w-[1280px] animate-pulse px-5 pb-20 pt-10 sm:px-8 lg:px-12 xl:px-16">
        <div className="h-12 w-72 rounded-xl bg-slate-100" />
        <div className="mt-3 h-6 w-full max-w-xl rounded-lg bg-slate-100" />
        <div className="mt-9 flex gap-3">
          <div className="h-14 flex-1 rounded-[14px] bg-slate-100" />
          <div className="h-14 w-28 rounded-[14px] bg-slate-100" />
        </div>
        <div className="mt-8 flex gap-2.5">
          {[96, 116, 104, 124, 92].map((width) => (
            <div key={width} className="h-10 rounded-full bg-slate-100" style={{ width }} />
          ))}
        </div>
        <div className="mb-5 mt-9 h-5 w-44 rounded bg-slate-100" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="overflow-hidden rounded-[20px] border border-slate-100">
              <div className="h-28 bg-slate-100" />
              <div className="space-y-3 p-5 pt-10">
                <div className="h-5 w-2/3 rounded bg-slate-100" />
                <div className="h-10 rounded bg-slate-100" />
                <div className="h-9 border-t border-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
