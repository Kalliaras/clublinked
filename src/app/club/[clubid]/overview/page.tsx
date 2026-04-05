"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderKanban, ChevronDown } from "lucide-react";

type Club = {
  id: string;
  name: string | null;
  description: string | null;
  member_count: number | null;
  created_at: string;
  university_id: string | null;
};

export default function ClubOverviewPage() {
  const params = useParams();
  const clubId = params?.clubid as string | undefined;
  const [club, setClub] = React.useState<Club | null>(null);
  const [highlights, setHighlights] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!clubId || typeof clubId !== "string") {
      return;
    }

    const supabase = createClient();
    const load = async () => {
      setLoading(true);

      const { data: clubData } = await supabase
        .from("clubs")
        .select("id, name, description, member_count, created_at, university_id")
        .eq("id", clubId)
        .single();

      if (clubData) {
        setClub(clubData as Club);
      }

      const { data: clubInterests } = await supabase
        .from("club_interests")
        .select("interest_id")
        .eq("club_id", clubId);

      const interests = (clubInterests ?? []) as Array<{
        interest_id: string | null;
      }>;

      const interestIds = interests
        .map((row) => row.interest_id)
        .filter((id): id is string => Boolean(id));

      const { data: interestTags } = interestIds.length > 0
        ? await supabase
            .from("interest_tags")
            .select("id, name")
            .in("id", interestIds)
        : { data: [] };

      const tags = (interestTags ?? []) as Array<{
        id: string | null;
        name: string | null;
      }>;

      const names = tags
        .map((tag) => tag.name)
        .filter((name): name is string => Boolean(name));
      setHighlights(names);

      setLoading(false);
    };

    load();
  }, [clubId]);

  if (!clubId) {
    return (
      <Card className="border-slate-200 p-6">
        <p className="text-sm text-slate-700">Missing club id.</p>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="border-slate-200 p-6">
        <p className="text-sm text-slate-700">Loading club overview…</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900">About</h2>
        <p className="mt-4 text-sm leading-6 text-slate-700">
          {club?.description || "This club has no description yet."}
        </p>
      </Card>

      <Card className="border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900">Key highlights</h2>

        <div className="mt-4 flex flex-wrap gap-3">
          {highlights.length === 0 ? (
            <p className="text-sm leading-6 text-slate-700">
              No key highlights available for this club yet.
            </p>
          ) : (
            highlights.map((highlight) => (
              <Badge
                key={highlight}
                variant="secondary"
                className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700"
              >
                <FolderKanban className="mr-2 h-4 w-4 text-slate-500" />
                {highlight}
              </Badge>
            ))
          )}

          {highlights.length > 4 && (
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
            >
              +1 more <ChevronDown className="h-4 w-4" />
            </button>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-slate-200 p-6">
          <div className="text-sm font-semibold text-slate-900">Featured Events</div>
          <p className="mt-4 text-sm leading-6 text-slate-700">
            This club has no featured events yet.
          </p>
        </Card>

        <Card className="border-slate-200 p-6">
          <div className="text-sm font-semibold text-slate-900">Featured Projects</div>
          <p className="mt-4 text-sm leading-6 text-slate-700">
            This club has no featured projects yet.
          </p>
        </Card>
      </div>
    </div>
  );
}
