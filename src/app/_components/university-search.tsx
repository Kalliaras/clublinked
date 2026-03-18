"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface University {
  id: string;
  name: string;
  slug: string;
}

export default function UniversitySearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<University[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const searchUniversities = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("universities")
          .select("id, name, slug")
          .ilike("name", `%${query.trim()}%`)
          .limit(8);

        if (data) {
          setResults(data);
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchUniversities, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSelect = (university: University) => {
    setIsOpen(false);
    setQuery(university.name);
    router.push(`/${university.slug}`);
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-lg">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search for your university..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          className="h-12 pl-10 text-base"
        />
      </div>

      {isOpen && (
        <div className="absolute top-full z-50 mt-2 w-full rounded-lg border bg-white shadow-lg">
          {isLoading ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              Searching...
            </div>
          ) : results.length > 0 ? (
            <ul className="max-h-64 overflow-y-auto py-1">
              {results.map((uni) => (
                <li key={uni.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(uni)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900">
                      {uni.name}
                    </span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      /{uni.slug}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              No universities found. Want to{" "}
              <Link href="/setup" className="font-medium text-primary hover:underline">
                add yours
              </Link>
              ?
            </div>
          )}
        </div>
      )}
    </div>
  );
}
