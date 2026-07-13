"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";

export type Club = {
  id: string;
  name: string;
  description: string | null;
  type: string | null;
  club_image: string | null;
};

const clubTypes = [
  "all",
  "Consulting",
  "Sports",
  "Finance",
  "Engineering",
  "Volunteering",
];

export function ClubSearchClient({ clubs }: { clubs: Club[] }) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const deferredQuery = useDeferredValue(searchQuery.trim().toLocaleLowerCase());

  const filteredClubs = useMemo(
    () =>
      clubs.filter((club) => {
        const matchesCategory =
          selectedCategory === "all" || club.type === selectedCategory;
        const matchesQuery =
          !deferredQuery ||
          club.name.toLocaleLowerCase().includes(deferredQuery) ||
          (club.description ?? "").toLocaleLowerCase().includes(deferredQuery);
        return matchesCategory && matchesQuery;
      }),
    [clubs, deferredQuery, selectedCategory]
  );

  return (
    <>
      <div className="mx-auto max-w-xl">
        <div className="relative mt-6">
          <Search
            aria-hidden="true"
            className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            aria-label="Search clubs"
            className="h-14 w-full rounded-full border border-border bg-white px-12 text-base text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-primary/30"
            placeholder="Search by club name or category"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>

        <label className="mt-5 block">
          <span className="sr-only">Club category</span>
          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm text-slate-900 shadow-xs outline-none focus:ring-2 focus:ring-primary/30"
          >
            {clubTypes.map((type) => (
              <option key={type} value={type}>
                {type === "all" ? "All Categories" : type}
              </option>
            ))}
          </select>
        </label>
      </div>

      <section
        aria-live="polite"
        className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {filteredClubs.map((club) => (
          <Link key={club.id} href={`/club/${club.id}`}>
            <Card className="h-35 overflow-hidden rounded-2xl border-0 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-start gap-3">
                <div className="relative h-12 w-12 shrink-0">
                  <Image
                    src={club.club_image ?? "/logo.png"}
                    alt={`${club.name} logo`}
                    fill
                    sizes="48px"
                    className="object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-bold leading-tight text-slate-900">
                    {club.name}
                  </h2>
                  <p className="mt-1 line-clamp-2 overflow-hidden text-sm text-slate-600">
                    {club.description || "No description"}
                  </p>
                  {club.type && (
                    <span className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {club.type}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          </Link>
        ))}

        {filteredClubs.length === 0 && (
          <p className="col-span-full py-8 text-center text-sm text-slate-500">
            No clubs found. Try a different search or category.
          </p>
        )}
      </section>
    </>
  );
}
