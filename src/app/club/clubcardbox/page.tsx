import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function ClubPage() {
  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        {/* Top club header row */}
        <section className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            {/* Avatar (logo) */}
            <div className="relative h-20 w-20 overflow-hidden rounded-full bg-[#0E4AE6]/60 shadow-lg ring-2 ring-[#0E4AE6]/15">
              <Image
                src="/logo.png"
                alt="Club logo"
                fill
                className="object-contain p-3"
                priority
              />
            </div>

            {/* Club name placeholder */}
            <div className="h-10 w-64 rounded-lg bg-[#0E4AE6]/20" />
          </div>

          {/* Apply button */}
          <Button
            size="lg"
            className="rounded-2xl bg-white px-10 text-lg font-semibold text-[#0E4AE6] shadow-lg shadow-black/15 hover:bg-[#0E4AE6] hover:text-white"
          >
            Apply
          </Button>
        </section>

        {/* Tabs */}
        <nav className="mt-10">
          <ul className="flex flex-wrap gap-10 text-lg font-medium text-[#0E4AE6]/90">
            <li className="relative">
              <span>History</span>
              <span className="absolute -bottom-4 left-0 h-1 w-16 rounded-full bg-[#0E4AE6]/35" />
            </li>
            <li>Members</li>
            <li>Projects</li>
            <li>Applications</li>
            <li>Events</li>
          </ul>
        </nav>

        {/* Content */}
        <section className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl bg-[#0E4AE6]/60 p-8 shadow-xl ring-1 ring-[#0E4AE6]/10">
              <h2 className="text-2xl font-semibold text-white">Overview</h2>
              <div className="mt-6 space-y-3">
                <div className="h-4 w-full rounded bg-white/20" />
                <div className="h-4 w-11/12 rounded bg-white/20" />
                <div className="h-4 w-10/12 rounded bg-white/20" />
              </div>
            </div>

            <div className="rounded-3xl bg-[#0E4AE6]/60 p-8 shadow-xl ring-1 ring-[#0E4AE6]/10">
              <h2 className="text-2xl font-semibold text-white">History</h2>
              <div className="mt-6 space-y-3">
                <div className="h-4 w-full rounded bg-white/20" />
                <div className="h-4 w-10/12 rounded bg-white/20" />
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <div className="rounded-3xl bg-[#0E4AE6]/60 p-6 shadow-xl ring-1 ring-[#0E4AE6]/10">
              <div className="text-white/90">Founded</div>
              <div className="mt-3 h-10 w-24 rounded bg-white/20" />
            </div>

            <div className="rounded-3xl bg-[#0E4AE6]/60 p-6 shadow-xl ring-1 ring-[#0E4AE6]/10">
              <div className="space-y-6">
                <div>
                  <div className="text-white/90">Members</div>
                  <div className="mt-3 h-10 w-20 rounded bg-white/20" />
                </div>
                <div>
                  <div className="text-white/90">Projects</div>
                  <div className="mt-3 h-10 w-20 rounded bg-white/20" />
                </div>
                <div>
                  <div className="text-white/90">Events per year</div>
                  <div className="mt-3 h-10 w-20 rounded bg-white/20" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
