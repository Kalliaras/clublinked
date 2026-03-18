"use client";

import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import * as React from "react";
import { CategoryCombobox } from "./_components/combobox";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUniversity } from "@/lib/context/university-context";

type Club = {
  id: string;
  name: string;
  about: string | null;
  club_type: string | null;
};

export default function ClubDiscoveryPage() {
  const university = useUniversity();
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [clubs, setClubs] = useState<Club[]>([]);

  useEffect(() => {
    const loadClubs = async () => {
      const supabase = createClient();

      const { data } = await supabase
        .from("clubs")
        .select("id, name, about, club_type")
        .eq("university_id", university.id);

      setClubs((data as Club[]) ?? []);
      setIsLoading(false);
    };

    loadClubs();
  }, [university.id]);

  const filteredClubs = clubs
    .filter((club) =>
      selectedCategory === "all" ? true : club.club_type === selectedCategory
    )
    .filter((club) =>
      searchQuery.trim()
        ? club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (club.club_type ?? "").toLowerCase().includes(searchQuery.toLowerCase())
        : true
    );

  if (isLoading) {
    return <div className="min-h-screen bg-white" />;
  }

  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto w-full max-w-5xl px-5 pb-10 pt-8">
        {/* Title + search/filter */}
        <div className="max-w-xl mx-auto">
          <h1 className="text-5xl font-extrabold tracking-tight text-primary">
            Explore Clubs
          </h1>

          {/* Search */}
          <div className="mt-6 relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              className="h-14 w-full rounded-full bg-white px-12 text-base text-slate-900 placeholder:text-slate-400 shadow-sm outline-none focus:ring-2 focus:ring-primary/30 border border-border"
              placeholder="Search by club name or category"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Categories */}
          <div className="mt-5">
            <CategoryCombobox
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
          </div>
        </div>

        {/* Club cards */}
        <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClubs.map((club) => (
            <Link
              key={club.id}
              href={`/${university.slug}/club/${club.id}`}
            >
              <Card className="rounded-2xl border-0 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="relative h-12 w-12 shrink-0">
                    <Image
                      src="/logo.png"
                      alt="Club logo"
                      fill
                      className="object-contain"
                    />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-base font-bold leading-tight text-slate-900">
                      {club.name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {club.about || "No description"}
                    </p>

                    {club.club_type && (
                      <span className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        {club.club_type}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}

          {filteredClubs.length === 0 && (
            <p className="col-span-full text-center text-sm text-slate-500 py-8">
              No clubs found. Try a different search or category.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
