import { redirect } from "next/navigation";

import { getUser } from "@/lib/supabase/get-user";
import { createClient } from "@/lib/supabase/server";
import ApplicationBuilderClient from "./_components/application-builder-client";
import type { ApplicationBuilderData } from "./types";

export default async function ApplicationBuilderPage({
  params,
}: {
  params: Promise<{ clubid: string }>;
}) {
  const { clubid } = await params;
  const supabase = await createClient();
  const [user, builderResult] = await Promise.all([
    getUser(),
    supabase.rpc("get_club_application_builder", { p_club_id: clubid }),
  ]);

  if (!user) redirect("/user/login");
  if (builderResult.error || !builderResult.data) redirect(`/club/${clubid}`);

  return (
    <ApplicationBuilderClient
      clubId={clubid}
      data={builderResult.data as unknown as ApplicationBuilderData}
    />
  );
}
