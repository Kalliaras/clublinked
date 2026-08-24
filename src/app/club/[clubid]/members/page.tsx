import Link from "next/link";
import { Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils/tailwind";

export default async function ClubMembersPage({ params }: { params: Promise<{ clubid: string }> }) {
  const { clubid } = await params;
  const supabase = await createClient();
  const { data: members, error } = await supabase.rpc("get_club_members", { p_club_id: clubid });

  if (error) console.error("Failed to fetch members:", error.message);
  if (!members?.length) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon"><Users /></EmptyMedia>
          <EmptyTitle>No members yet</EmptyTitle>
          <EmptyDescription>Members will appear here once people join your club.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent><Button variant="outline">Invite Members</Button></EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Members ({members.length})</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => {
          const initials = [member.first_name, member.last_name]
            .filter(Boolean)
            .map((name) => name![0].toUpperCase())
            .join("");
          const fullName = [member.first_name, member.last_name].filter(Boolean).join(" ");

          return (
            <Link key={member.user_id} href={`/user/profile/${member.user_id}`} className="group focus:outline-none">
              <Card className="flex flex-col gap-0 py-0 transition-shadow hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2">
                <div className="flex items-start gap-4 p-5">
                  <div className="flex size-11 shrink-0 select-none items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                    {initials || "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate text-sm font-semibold leading-tight text-foreground">{fullName || "Unknown Member"}</span>
                      <span className={cn(
                        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
                        member.is_owner
                          ? "bg-primary/10 text-primary ring-primary/20"
                          : "bg-muted text-muted-foreground ring-border"
                      )}>
                        {member.title ?? "Member"}
                      </span>
                    </div>
                    {member.major && (
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {member.major}{member.academic_year ? ` · Year ${member.academic_year}` : ""}
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
