import { Clock } from "lucide-react";
import { notFound } from "next/navigation";

import { Card } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { getClubPublicData } from "@/lib/data/club-page";

export default async function ClubHistoryPage({ params }: { params: Promise<{ clubid: string }> }) {
  const { clubid } = await params;
  const publicData = await getClubPublicData(clubid);
  if (!publicData) notFound();

  const history = publicData.club.history?.trim();
  if (!history) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon"><Clock /></EmptyMedia>
          <EmptyTitle>No history yet</EmptyTitle>
          <EmptyDescription>Club history and milestones will show up here once added.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <Card className="border-slate-200 p-6">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Club History</h2>
      <div className="prose prose-sm max-w-none text-slate-700">
        {history.split("\n").map((paragraph, index) => (
          <p key={index} className="mb-4 last:mb-0">{paragraph}</p>
        ))}
      </div>
    </Card>
  );
}
