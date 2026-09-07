export default function InterviewsLoading() {
  return (
    <div className="ml-[260px] min-h-screen animate-pulse bg-[#F7F8FA] px-8 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="h-10 w-52 rounded-xl bg-slate-200" />
        <div className="mt-3 h-5 w-80 rounded bg-slate-200" />
        <div className="mt-8 h-12 border-b border-slate-200" />
        <div className="mt-7 h-36 rounded-2xl bg-white" />
        <div className="mt-6 grid grid-cols-[1fr_400px] gap-5">
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="h-20 rounded-2xl bg-white" />
            ))}
          </div>
          <div className="h-[560px] rounded-2xl bg-white" />
        </div>
      </div>
    </div>
  );
}
