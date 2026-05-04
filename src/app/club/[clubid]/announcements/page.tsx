import { Megaphone } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { AnnouncementCard } from "./_components/announcement-card";

type Announcement = {
  id: string;
  title: string;
  body: string;
  created_at: string;
  user_id: string;
  profiles: { first_name: string | null; last_name: string | null } | null;
};

export default async function ClubAnnouncementsPage({
  params,
}: {
  params: Promise<{ clubid: string }>;
}) {
  const { clubid } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("club_announcements")
    .select("id, title, body, created_at, user_id, profiles(first_name, last_name)")
    .eq("club_id", clubid)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch announcements:", error.message);
  }

  const announcements = (data ?? []) as unknown as Announcement[];

  if (announcements.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Megaphone />
          </EmptyMedia>
          <EmptyTitle>No announcements yet</EmptyTitle>
          <EmptyDescription>
            Announcements from club admins will appear here.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="space-y-4">
      {announcements.map((announcement) => (
        <AnnouncementCard key={announcement.id} announcement={announcement} />
      ))}
    </div>
  );
}
