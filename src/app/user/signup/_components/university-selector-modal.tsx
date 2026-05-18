"use client";

import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

interface University {
  id: string;
  name: string | null;
  slug: string;
}

type Props = {
  open: boolean;
  onSelect: (university: { id: string; name: string }) => void;
  onClose: () => void;
};

export function UniversitySelectorModal({ open, onSelect, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<University[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounced search
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
        console.error("University search error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchUniversities, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  if (!open) return null;

  const handleSelect = (uni: University) => {
    onSelect({ id: uni.id, name: uni.name ?? "" });
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
    >
      <div
        ref={wrapperRef}
        className="relative mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        {/* Header */}
        <h2 className="text-lg font-semibold text-gray-900">
          Find your university
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Search for your school to link your account
        </p>

        {/* Search input */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search for your university..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setIsOpen(true)}
            className="pl-9 bg-white text-black"
            autoFocus
          />
        </div>

        {/* Results dropdown */}
        {isOpen && (
          <div className="mt-2 w-full rounded-lg border bg-white shadow-lg">
            {isLoading ? (
              <div className="px-4 py-3 text-sm text-gray-500">
                Searching...
              </div>
            ) : results.length > 0 ? (
              <ul className="max-h-56 overflow-y-auto py-1">
                {results.map((uni) => (
                  <li key={uni.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(uni)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-gray-50"
                    >
                      <span className="font-medium text-gray-900">
                        {uni.name}
                      </span>
                      <span className="ml-auto text-xs text-gray-400">
                        /{uni.slug}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500">
                No universities found.
              </div>
            )}
          </div>
        )}

        {/* Skip */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-gray-400 underline-offset-2 hover:text-gray-600 hover:underline transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
