"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type Announcement = {
  id: string;
  title: string;
  body: string;
  created_at: string;
  user_id: string;
  profiles: { first_name: string | null; last_name: string | null } | null;
};

const BODY_TRUNCATE_LENGTH = 200;

export function AnnouncementCard({
  announcement,
}: {
  announcement: Announcement;
}) {
  const [expanded, setExpanded] = useState(false);

  const { title, body, created_at, profiles } = announcement;

  const firstName = profiles?.first_name ?? null;
  const lastName = profiles?.last_name ?? null;

  // Build initials: first letter of each name, uppercase. Fall back to "?" if both are null.
  const initials =
    firstName || lastName
      ? `${firstName ? firstName[0].toUpperCase() : ""}${lastName ? lastName[0].toUpperCase() : ""}`
      : "?";

  const posterName =
    firstName || lastName
      ? `${firstName ?? ""} ${lastName ?? ""}`.trim()
      : "Unknown";

  const formattedDate = new Date(created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const isLong = body.length > BODY_TRUNCATE_LENGTH;
  const displayBody =
    isLong && !expanded ? body.slice(0, BODY_TRUNCATE_LENGTH) + "…" : body;

  return (
    <div className="rounded-2xl border border-border bg-white shadow-sm p-5">
      <div className="flex flex-row">
        {/* Avatar */}
        <div className="h-10 w-10 rounded-full shrink-0 flex items-center justify-center bg-primary/10">
          <span className="text-sm font-semibold text-primary">{initials}</span>
        </div>

        {/* Content */}
        <div className="flex-1 ml-4 min-w-0">
          {/* Top row: title + date */}
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-base font-semibold text-slate-900 leading-snug">
              {title}
            </h3>
            <span className="text-xs text-slate-400 shrink-0 mt-0.5">
              {formattedDate}
            </span>
          </div>

          {/* Poster name */}
          <p className="text-sm text-slate-500 mt-0.5">{posterName}</p>

          {/* Body */}
          <p className="text-sm text-slate-700 mt-2 leading-relaxed">
            {displayBody}
          </p>

          {/* Expand / collapse toggle — only rendered when body exceeds truncation length */}
          {isLong && (
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="mt-1 flex items-center gap-1 border-0 bg-transparent p-0 text-xs text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              {expanded ? (
                <>
                  <ChevronUp size={16} className="text-slate-400" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown size={16} className="text-slate-400" />
                  Show more
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
