export default function AdminProjectsLoading() {
  return (
    <div className="clublinked-page-background min-h-screen animate-pulse md:ml-[260px]">
      <div className="px-4 py-6 sm:px-6 md:px-8 md:py-8">
        <div className="h-9 w-48 rounded-lg bg-slate-200" />
        <div className="mt-3 h-5 w-72 rounded bg-slate-200" />
        <div className="mt-8 space-y-3">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-32 rounded-xl bg-white" />
          ))}
        </div>
      </div>
    </div>
  );
}
