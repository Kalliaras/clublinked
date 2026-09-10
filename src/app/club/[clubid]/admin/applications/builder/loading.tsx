export default function ApplicationBuilderLoading() {
  return (
    <div className="clublinked-page-background min-h-screen animate-pulse">
      <div className="h-[72px] border-b border-slate-200 bg-white" />
      <div className="grid min-h-[calc(100vh-72px)] lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)]">
        <div className="space-y-5 border-r border-slate-200 p-8">
          <div className="h-40 rounded-2xl bg-white" />
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-28 rounded-2xl bg-white" />
          ))}
        </div>
        <div className="hidden p-10 lg:block">
          <div className="mx-auto h-[560px] max-w-xl rounded-2xl bg-white" />
        </div>
      </div>
    </div>
  );
}
