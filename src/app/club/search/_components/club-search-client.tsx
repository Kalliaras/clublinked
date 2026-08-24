"use client";

import { memo, useDeferredValue, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarClock, Search, SlidersHorizontal, Users, X } from "lucide-react";

import { Slider } from "@/components/ui/slider";
import type { DiscoveryClub, DiscoveryTag } from "@/lib/club-discovery-types";
import { cn } from "@/lib/utils/tailwind";

const DAY_MS = 86_400_000;
type SortMode = "relevance" | "newest" | "deadline" | "members";

function toggleValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

function getDeadlineDays(club: DiscoveryClub, nowMs: number) {
  if (!club.application_deadline) return null;
  return Math.ceil((new Date(club.application_deadline).getTime() - nowMs) / DAY_MS);
}

function getApplicationStatus(club: DiscoveryClub, nowMs: number) {
  if (!club.uses_applications) {
    return { label: "Open membership", className: "bg-blue-50 text-blue-700" };
  }

  const days = getDeadlineDays(club, nowMs);
  if (days === null) {
    return { label: "Recruiting now", className: "bg-emerald-50 text-emerald-700" };
  }
  if (days < 0) {
    return { label: "Closed", className: "bg-slate-100 text-slate-500" };
  }
  if (days <= 7) {
    return { label: "Closing soon", className: "bg-amber-50 text-amber-700" };
  }
  return { label: "Recruiting now", className: "bg-emerald-50 text-emerald-700" };
}

function deadlineLabel(club: DiscoveryClub) {
  if (!club.uses_applications) return "Join anytime";
  if (!club.application_deadline) return "Applications open";
  return `Closes ${new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(club.application_deadline))}`;
}

const ClubCard = memo(function ClubCard({
  club,
  nowMs,
  eager,
}: {
  club: DiscoveryClub;
  nowMs: number;
  eager: boolean;
}) {
  const status = getApplicationStatus(club, nowMs);
  const visibleTags = [club.type, ...club.interests.map((tag) => tag.name)]
    .filter((tag, index, tags): tag is string => Boolean(tag) && tags.indexOf(tag) === index)
    .slice(0, 2);

  return (
    <Link
      href={`/club/${club.id}`}
      prefetch={false}
      className="group block h-full rounded-[20px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <article className="flex h-full flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white transition duration-200 [content-visibility:auto] [contain-intrinsic-size:auto_360px] group-hover:-translate-y-0.5 group-hover:border-transparent group-hover:shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
        <div className="relative h-[112px] overflow-hidden bg-primary">
          <Image
            src={club.club_banner_image ?? "/default-banners/default-blue.png"}
            alt=""
            fill
            sizes="(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.015]"
            fetchPriority={eager ? "high" : "auto"}
            loading={eager ? "eager" : "lazy"}
          />
        </div>

        <div className="relative flex flex-1 flex-col px-[22px] pb-[22px] pt-[18px]">
          <div className="absolute -top-7 left-[22px] size-14 overflow-hidden rounded-full border-[3px] border-white bg-white shadow-sm">
            <Image
              src={club.club_image ?? "/default-profile-images/default-blue.png"}
              alt={`${club.name} logo`}
              fill
              sizes="56px"
              className="object-cover"
            />
          </div>

          <div className="mb-3 mt-8 flex min-h-6 flex-wrap items-center gap-1.5">
            {visibleTags.map((tag) => (
              <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                {tag}
              </span>
            ))}
            <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold", status.className)}>
              <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
              {status.label}
            </span>
          </div>

          <h2 className="text-[19px] font-bold leading-tight tracking-[-0.015em] text-slate-950">
            {club.name}
          </h2>
          <p className="mt-2 line-clamp-2 min-h-[40px] text-[13px] leading-5 text-slate-500">
            {club.description || "Learn more about this organization and its campus community."}
          </p>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs font-medium text-slate-500">
            <span className="flex min-w-0 items-center gap-1.5">
              <CalendarClock className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{deadlineLabel(club)}</span>
            </span>
            <span className="flex shrink-0 items-center gap-1.5">
              <Users className="size-3.5" aria-hidden="true" />
              {club.member_count ?? 0}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
});

function FilterChoice({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
        selected
          ? "border-primary bg-primary text-white"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
      )}
    >
      {label}
    </button>
  );
}

export function ClubSearchClient({
  clubs,
  interests,
  skills,
  now,
}: {
  clubs: DiscoveryClub[];
  interests: DiscoveryTag[];
  skills: DiscoveryTag[];
  now: string;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [deadlineEnabled, setDeadlineEnabled] = useState(false);
  const [deadlineDays, setDeadlineDays] = useState(30);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("relevance");
  const deferredQuery = useDeferredValue(searchQuery.trim().toLocaleLowerCase());
  const nowMs = useMemo(() => new Date(now).getTime(), [now]);

  const categories = useMemo(
    () =>
      Array.from(new Set(clubs.map((club) => club.type).filter((type): type is string => Boolean(type))))
        .sort((left, right) => left.localeCompare(right)),
    [clubs]
  );

  const filteredClubs = useMemo(() => {
    const results = clubs.filter((club) => {
      const searchable = [
        club.name,
        club.description,
        club.type,
        ...club.interests.map((tag) => tag.name),
        ...club.skills.map((tag) => tag.name),
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase();
      const matchesQuery = !deferredQuery || searchable.includes(deferredQuery);
      const matchesCategory = selectedCategory === "all" || club.type === selectedCategory;
      const matchesInterests = selectedInterests.every((id) =>
        club.interests.some((interest) => interest.id === id)
      );
      const matchesSkills = selectedSkills.every((id) =>
        club.skills.some((skill) => skill.id === id)
      );
      const daysRemaining = getDeadlineDays(club, nowMs);
      const matchesDeadline =
        !deadlineEnabled ||
        (club.uses_applications && daysRemaining !== null && daysRemaining >= 0 && daysRemaining <= deadlineDays);

      return matchesQuery && matchesCategory && matchesInterests && matchesSkills && matchesDeadline;
    });

    return results.toSorted((left, right) => {
      if (sortMode === "newest") {
        return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
      }
      if (sortMode === "deadline") {
        const leftDeadline = left.application_deadline ? new Date(left.application_deadline).getTime() : Number.POSITIVE_INFINITY;
        const rightDeadline = right.application_deadline ? new Date(right.application_deadline).getTime() : Number.POSITIVE_INFINITY;
        return leftDeadline - rightDeadline;
      }
      if (sortMode === "members") {
        return (right.member_count ?? 0) - (left.member_count ?? 0);
      }
      return left.name.localeCompare(right.name);
    });
  }, [clubs, deadlineDays, deadlineEnabled, deferredQuery, nowMs, selectedCategory, selectedInterests, selectedSkills, sortMode]);

  const activeFilterCount =
    (selectedCategory === "all" ? 0 : 1) + selectedInterests.length + selectedSkills.length + (deadlineEnabled ? 1 : 0);

  function clearFilters() {
    setSelectedCategory("all");
    setSelectedInterests([]);
    setSelectedSkills([]);
    setDeadlineEnabled(false);
    setDeadlineDays(30);
  }

  return (
    <>
      <div className="flex gap-3">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search clubs</span>
          <Search aria-hidden="true" className="pointer-events-none absolute left-[18px] top-1/2 size-5 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            className="h-14 w-full rounded-[14px] border border-slate-300 bg-white pl-[50px] pr-5 text-base text-slate-950 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10"
            placeholder="Search by club name, keyword, interest, or skill"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </label>
        <button
          type="button"
          aria-expanded={filtersOpen}
          aria-controls="club-filter-panel"
          onClick={() => setFiltersOpen((open) => !open)}
          className="inline-flex h-14 shrink-0 items-center gap-2.5 rounded-[14px] border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:border-slate-400 hover:bg-slate-50 sm:px-[22px] sm:text-[15px]"
        >
          <SlidersHorizontal className="size-[18px]" aria-hidden="true" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="min-w-[22px] rounded-full bg-primary px-2 py-0.5 text-center text-[11px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {filtersOpen && (
        <section id="club-filter-panel" aria-label="Club filters" className="mt-4 grid gap-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 lg:grid-cols-[1fr_1fr_0.9fr]">
          <div>
            <h2 className="text-sm font-bold text-slate-950">Interests</h2>
            <p className="mt-1 text-xs text-slate-500">Match every selected interest.</p>
            <div className="mt-3 flex max-h-32 flex-wrap gap-2 overflow-y-auto pr-1">
              {interests.map((interest) => (
                <FilterChoice
                  key={interest.id}
                  label={interest.name}
                  selected={selectedInterests.includes(interest.id)}
                  onClick={() => setSelectedInterests((values) => toggleValue(values, interest.id))}
                />
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-950">Skills</h2>
            <p className="mt-1 text-xs text-slate-500">Match every selected skill.</p>
            <div className="mt-3 flex max-h-32 flex-wrap gap-2 overflow-y-auto pr-1">
              {skills.map((skill) => (
                <FilterChoice
                  key={skill.id}
                  label={skill.name}
                  selected={selectedSkills.includes(skill.id)}
                  onClick={() => setSelectedSkills((values) => toggleValue(values, skill.id))}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-950">Application window</h2>
                <p className="mt-1 text-xs text-slate-500">Closing within {deadlineDays} days</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={deadlineEnabled}
                onClick={() => setDeadlineEnabled((enabled) => !enabled)}
                className={cn("relative h-6 w-11 shrink-0 rounded-full transition", deadlineEnabled ? "bg-primary" : "bg-slate-300")}
              >
                <span className={cn("absolute top-1 size-4 rounded-full bg-white shadow transition-transform", deadlineEnabled ? "translate-x-6" : "translate-x-1")} />
                <span className="sr-only">Filter by application deadline</span>
              </button>
            </div>
            <Slider
              className="mt-5"
              min={1}
              max={90}
              step={1}
              value={[deadlineDays]}
              onValueChange={(value) => {
                setDeadlineDays(value[0] ?? 30);
                setDeadlineEnabled(true);
              }}
              aria-label="Maximum days until applications close"
            />
            <div className="mt-2 flex justify-between text-[11px] font-medium text-slate-400">
              <span>1 day</span>
              <span>90 days</span>
            </div>
          </div>
        </section>
      )}

      {activeFilterCount > 0 && (
        <ActiveFilters
          selectedCategory={selectedCategory}
          selectedInterests={selectedInterests}
          selectedSkills={selectedSkills}
          interests={interests}
          skills={skills}
          deadlineEnabled={deadlineEnabled}
          deadlineDays={deadlineDays}
          clearFilters={clearFilters}
          clearCategory={() => setSelectedCategory("all")}
          clearInterest={(id) => setSelectedInterests((values) => toggleValue(values, id))}
          clearSkill={(id) => setSelectedSkills((values) => toggleValue(values, id))}
          clearDeadline={() => setDeadlineEnabled(false)}
        />
      )}

      <div className="mt-8 flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {["all", ...categories].map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setSelectedCategory(category)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition",
              selectedCategory === category
                ? "border-primary bg-primary text-white"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            )}
          >
            {category === "all" ? "All" : category}
          </button>
        ))}
      </div>

      <div className="mb-5 mt-9 flex items-center justify-between gap-4">
        <p className="text-sm text-slate-500" aria-live="polite">
          Showing <strong className="font-bold text-slate-950">{filteredClubs.length}</strong> of{" "}
          <strong className="font-bold text-slate-950">{clubs.length}</strong> clubs
        </p>
        <label>
          <span className="sr-only">Sort clubs</span>
          <select
            value={sortMode}
            onChange={(event) => setSortMode(event.target.value as SortMode)}
            className="rounded-[10px] border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          >
            <option value="relevance">Sort by relevance</option>
            <option value="newest">Recently added</option>
            <option value="deadline">Deadline soonest</option>
            <option value="members">Most members</option>
          </select>
        </label>
      </div>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredClubs.map((club, index) => (
          <ClubCard key={club.id} club={club} nowMs={nowMs} eager={index === 0} />
        ))}
      </section>

      {filteredClubs.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
          <h2 className="font-bold text-slate-950">No clubs match those filters.</h2>
          <p className="mt-1 text-sm text-slate-500">Try removing a filter or searching for something broader.</p>
          <button type="button" onClick={clearFilters} className="mt-4 text-sm font-semibold text-primary hover:underline">
            Clear filters
          </button>
        </div>
      )}
    </>
  );
}

function ActiveFilters({
  selectedCategory,
  selectedInterests,
  selectedSkills,
  interests,
  skills,
  deadlineEnabled,
  deadlineDays,
  clearFilters,
  clearCategory,
  clearInterest,
  clearSkill,
  clearDeadline,
}: {
  selectedCategory: string;
  selectedInterests: string[];
  selectedSkills: string[];
  interests: DiscoveryTag[];
  skills: DiscoveryTag[];
  deadlineEnabled: boolean;
  deadlineDays: number;
  clearFilters: () => void;
  clearCategory: () => void;
  clearInterest: (id: string) => void;
  clearSkill: (id: string) => void;
  clearDeadline: () => void;
}) {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-2">
      {selectedCategory !== "all" && <FilterChip label={selectedCategory} onClick={clearCategory} />}
      {selectedInterests.map((id) => {
        const tag = interests.find((interest) => interest.id === id);
        return tag ? <FilterChip key={id} label={tag.name} onClick={() => clearInterest(id)} /> : null;
      })}
      {selectedSkills.map((id) => {
        const tag = skills.find((skill) => skill.id === id);
        return tag ? <FilterChip key={id} label={tag.name} onClick={() => clearSkill(id)} tone="violet" /> : null;
      })}
      {deadlineEnabled && <FilterChip label={`Closing in ${deadlineDays} days`} onClick={clearDeadline} tone="amber" />}
      <button type="button" onClick={clearFilters} className="ml-1 text-xs font-semibold text-slate-500 underline-offset-4 hover:text-slate-950 hover:underline">
        Clear all
      </button>
    </div>
  );
}

function FilterChip({ label, onClick, tone = "blue" }: { label: string; onClick: () => void; tone?: "blue" | "violet" | "amber" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold",
        tone === "blue" && "border-blue-100 bg-blue-50 text-primary",
        tone === "violet" && "border-violet-100 bg-violet-50 text-violet-700",
        tone === "amber" && "border-amber-100 bg-amber-50 text-amber-700"
      )}
    >
      {label} <X className="size-3" />
    </button>
  );
}
