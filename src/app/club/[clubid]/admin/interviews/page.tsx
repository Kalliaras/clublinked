import { redirect } from "next/navigation";

import { getUser } from "@/lib/supabase/get-user";
import { createClient } from "@/lib/supabase/server";
import InterviewsClient from "./_components/interviews-client";
import type { AdminInterviewsData } from "./types";

export default async function InterviewsPage({
  params,
}: {
  params: Promise<{ clubid: string }>;
}) {
  const { clubid } = await params;
  const supabase = await createClient();
  const [user, interviewsResult] = await Promise.all([
    getUser(),
    supabase.rpc("get_admin_interviews", { p_club_id: clubid }),
  ]);

  if (!user) redirect("/user/login");
  if (interviewsResult.error || !interviewsResult.data) {
    redirect(`/club/${clubid}`);
  }

  return (
    <InterviewsClient
      clubId={clubid}
      data={interviewsResult.data as unknown as AdminInterviewsData}
      now={new Date().toISOString()}
    />
  );
}
