import { Clock } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface ClubHistoryPageProps {
  params: Promise<{ clubid: string }>;
}

export default async function ClubHistoryPage({ params }: ClubHistoryPageProps) {
  const { clubid } = await params;
  const supabase = await createClient();

  const { data: club } = await supabase
    .from("clubs")
    .select("history")
    .eq("id", clubid)
    .single();

  if (!club?.history) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Clock />
          </EmptyMedia>
          <EmptyTitle>No history yet</EmptyTitle>
          <EmptyDescription>
            Club history and milestones will show up here once added.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <Card className="border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Club History</h2>
      <div className="prose prose-sm max-w-none text-slate-700">
        {club.history.split('\n').map((paragraph, index) => (
          <p key={index} className="mb-4 last:mb-0">
            {paragraph}
          </p>
        ))}
      </div>
    </Card>
  );
}
