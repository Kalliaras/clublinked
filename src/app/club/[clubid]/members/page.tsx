import Link from "next/link";
import { Users } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils/tailwind";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface ClubMembersPageProps {
  params: Promise<{ clubid: string }>;
}

export default async function ClubMembersPage({ params }: ClubMembersPageProps) {
  const { clubid } = await params;
  const supabase = await createClient();

  const { data: memberRoles } = await supabase
    .from("user_roles")
    .select("user_id, title, is_owner")
    .eq("club_id", clubid);

  const userIds = memberRoles?.map((r) => r.user_id) ?? [];

  const { data: profiles } =
    userIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, first_name, last_name, major, academic_year")
          .in("id", userIds)
      : { data: [] };

  if (userIds.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Users />
          </EmptyMedia>
          <EmptyTitle>No members yet</EmptyTitle>
          <EmptyDescription>
            Members will appear here once people join your club.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline">Invite Members</Button>
        </EmptyContent>
      </Empty>
    );
  }

  // Build a lookup map from user_id → role info for O(1) access
  const roleByUserId = new Map(
    (memberRoles ?? []).map((r) => [r.user_id, r])
  );

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground">
        Members ({userIds.length})
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(profiles ?? []).map((profile) => {
          const role = roleByUserId.get(profile.id);
          const initials = [profile.first_name, profile.last_name]
            .filter(Boolean)
            .map((n) => n![0].toUpperCase())
            .join("");
          const fullName = [profile.first_name, profile.last_name]
            .filter(Boolean)
            .join(" ");

          return (
            <Link
              key={profile.id}
              href={`/user/profile/${profile.id}`}
              className="group focus:outline-none"
            >
              <Card className="flex flex-col gap-0 py-0 transition-shadow hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2">
                <div className="flex items-start gap-4 p-5">
                  {/* Avatar */}
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground select-none">
                    {initials || "?"}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-semibold leading-tight text-foreground">
                        {fullName || "Unknown Member"}
                      </span>

                      {/* Role badge */}
                      {role && (
                        <span
                          className={cn(
                            "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
                            role.is_owner
                              ? "bg-primary/10 text-primary ring-primary/20"
                              : "bg-muted text-muted-foreground ring-border"
                          )}
                        >
                          {role.title ?? "Member"}
                        </span>
                      )}
                    </div>

                    {profile.major && (
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {profile.major}
                        {profile.academic_year
                          ? ` · Year ${profile.academic_year}`
                          : ""}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
