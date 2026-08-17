"use client";

import * as React from "react";
import { LoaderCircle, MapPin } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/tailwind";

type AddressSuggestion = {
  id: string;
  label: string;
};

const MIN_QUERY_LENGTH = 3;
const SEARCH_DELAY_MS = 450;

function isAddressSuggestion(value: unknown): value is AddressSuggestion {
  if (!value || typeof value !== "object") return false;
  const suggestion = value as Record<string, unknown>;
  return (
    typeof suggestion.id === "string"
    && suggestion.id.trim().length > 0
    && typeof suggestion.label === "string"
    && suggestion.label.trim().length > 0
  );
}

export function AddressAutocomplete({
  value,
  onChange,
  clubId,
  id = "event-location",
  required = false,
}: {
  value: string;
  onChange: (value: string) => void;
  clubId: string;
  id?: string;
  required?: boolean;
}) {
  const [suggestions, setSuggestions] = React.useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const [searchMessage, setSearchMessage] = React.useState("");
  const selectedValue = React.useRef<string | null>(null);

  React.useEffect(() => {
    const query = value.trim();

    if (selectedValue.current === value) {
      selectedValue.current = null;
      setLoading(false);
      return;
    }

    if (query.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setLoading(false);
      setOpen(false);
      setSearchMessage("");
      return;
    }

    setSuggestions([]);
    setOpen(false);
    setActiveIndex(-1);
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      setSearchMessage("");

      try {
        const searchParams = new URLSearchParams({ q: query, clubId });
        const response = await fetch(`/api/address-search?${searchParams.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("Address search unavailable");

        const result = (await response.json()) as unknown;
        const untrustedSuggestions =
          result && typeof result === "object" && "suggestions" in result
            ? (result as { suggestions?: unknown }).suggestions
            : undefined;
        const nextSuggestions = Array.isArray(untrustedSuggestions)
          ? untrustedSuggestions.filter(isAddressSuggestion).map((suggestion) => ({
              id: suggestion.id.trim(),
              label: suggestion.label.trim(),
            }))
          : [];
        setSuggestions(nextSuggestions);
        setActiveIndex(-1);
        setOpen(nextSuggestions.length > 0);
        setSearchMessage(
          nextSuggestions.length === 0
            ? "No suggestions found. You can keep the location you entered."
            : `${nextSuggestions.length} address ${nextSuggestions.length === 1 ? "suggestion" : "suggestions"} available.`
        );
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setSuggestions([]);
        setOpen(false);
        setSearchMessage("Suggestions are unavailable. You can still enter the location manually.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, SEARCH_DELAY_MS);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [clubId, value]);

  function chooseSuggestion(suggestion: AddressSuggestion) {
    selectedValue.current = suggestion.label;
    onChange(suggestion.label);
    setOpen(false);
    setSuggestions([]);
    setActiveIndex(-1);
    setSearchMessage("");
  }

  return (
    <div>
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-2.5 z-10 size-4 text-slate-400" />
        <Input
          id={id}
          name="location"
          value={value}
          required={required}
          autoComplete="street-address"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open && suggestions.length > 0}
          aria-controls={`${id}-suggestions`}
          aria-activedescendant={activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined}
          aria-busy={loading}
          placeholder="Search an address or enter a venue"
          className="pl-9 pr-9"
          onChange={(event) => {
            selectedValue.current = null;
            onChange(event.target.value);
            setActiveIndex(-1);
          }}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 150)}
          onKeyDown={(event) => {
            if (!open || suggestions.length === 0) return;

            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActiveIndex((index) => Math.min(index + 1, suggestions.length - 1));
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((index) => Math.max(index - 1, 0));
            } else if (event.key === "Home") {
              event.preventDefault();
              setActiveIndex(0);
            } else if (event.key === "End") {
              event.preventDefault();
              setActiveIndex(suggestions.length - 1);
            } else if (event.key === "Enter" && activeIndex >= 0) {
              event.preventDefault();
              chooseSuggestion(suggestions[activeIndex]);
            } else if (event.key === "Escape") {
              event.preventDefault();
              setOpen(false);
              setActiveIndex(-1);
            }
          }}
        />
        {loading && (
          <LoaderCircle
            className="absolute right-3 top-2.5 size-4 animate-spin text-slate-400"
            aria-hidden="true"
          />
        )}

        {open && suggestions.length > 0 && (
          <div
            id={`${id}-suggestions`}
            role="listbox"
            aria-label="Address suggestions"
            className="absolute z-[70] mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
          >
            {suggestions.map((suggestion, index) => (
              <button
                id={`${id}-option-${index}`}
                key={suggestion.id}
                type="button"
                role="option"
                tabIndex={-1}
                aria-selected={activeIndex === index}
                className={cn(
                  "flex w-full items-start gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-700",
                  activeIndex === index ? "bg-blue-50 text-blue-900" : "hover:bg-slate-50"
                )}
                onMouseDown={(event) => event.preventDefault()}
                onMouseMove={() => setActiveIndex(index)}
                onClick={() => chooseSuggestion(suggestion)}
              >
                <MapPin className="mt-0.5 size-4 shrink-0 text-slate-400" />
                <span>{suggestion.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="mt-1 text-xs text-slate-500" aria-live="polite">
        {loading ? "Searching for addresses…" : searchMessage || "Select a suggestion or enter a location manually."}
      </p>
      <p className="mt-1 text-[10px] text-slate-400">
        Suggestions by{" "}
        <a
          href="https://photon.komoot.io/"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2 hover:text-slate-600"
        >
          Photon
        </a>
        {" · "}©{" "}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2 hover:text-slate-600"
        >
          OpenStreetMap contributors
        </a>
      </p>
    </div>
  );
}
