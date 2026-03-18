import { Megaphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function ClubAnnouncementsPage() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Megaphone />
        </EmptyMedia>
        <EmptyTitle>No announcements yet</EmptyTitle>
        <EmptyDescription>
          Post announcements to keep your members in the loop.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline">New Announcement</Button>
      </EmptyContent>
    </Empty>
  );
}
