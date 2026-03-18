import { Skeleton } from "@/components/ui/skeleton";

export default function ClubPageLoading() {
  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <main className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-12">
        <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Left hero section — hidden on mobile, matches real page */}
          <section className="hidden lg:block">
            {/* Logo + brand name */}
            <div className="mb-8 flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-md" />
              <Skeleton className="h-7 w-32" />
            </div>

            {/* Headline */}
            <div className="space-y-3">
              <Skeleton className="h-14 w-72" />
              <Skeleton className="h-14 w-56" />
            </div>

            {/* Subtext */}
            <div className="mt-5 space-y-2">
              <Skeleton className="h-5 w-96" />
              <Skeleton className="h-5 w-80" />
            </div>

            {/* Divider accent */}
            <Skeleton className="mt-10 h-px w-40" />
          </section>

          {/* Right card */}
          <section className="flex justify-center lg:justify-end">
            <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              {/* Card header */}
              <Skeleton className="h-9 w-32" />
              <Skeleton className="mt-2 h-5 w-72" />

              {/* Input label + field */}
              <div className="mt-6 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>

              {/* Primary button */}
              <Skeleton className="mt-6 h-10 w-full rounded-md" />

              {/* Divider */}
              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-200" />
                <Skeleton className="h-4 w-6" />
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              {/* Secondary button */}
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
