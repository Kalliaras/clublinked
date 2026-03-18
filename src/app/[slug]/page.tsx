"use client";

import { useUniversity } from "@/lib/context/university-context";

export default function UniversityHub() {
  const university = useUniversity();

  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-4xl px-6 py-12 text-center">
        <h1 className="text-4xl font-bold text-[#0E4AE6]">
          {university.name}
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          University hub — clubs and community
        </p>
      </main>
    </div>
  );
}
