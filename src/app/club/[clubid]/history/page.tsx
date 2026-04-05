import { Clock } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export default function ClubHistoryPage() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Clock />
        </EmptyMedia>
        <EmptyTitle>No activity yet</EmptyTitle>
        <EmptyDescription>
          Club activity and milestones will show up here over time.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
