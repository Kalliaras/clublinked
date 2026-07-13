export default function ClubSearchLoading() {
  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto w-full max-w-5xl px-5 pb-10 pt-8">
        <div className="mx-auto max-w-xl">
          <div className="h-14 w-72 max-w-full animate-pulse rounded-xl bg-slate-100" />
          <div className="mt-6 h-14 animate-pulse rounded-full bg-slate-100" />
          <div className="mt-5 h-10 animate-pulse rounded-md bg-slate-100" />
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-35 animate-pulse rounded-2xl bg-slate-100"
            />
          ))}
        </div>
      </main>
    </div>
  );
}
