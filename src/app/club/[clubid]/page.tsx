import { redirect } from "next/navigation";

export default async function ClubDashboardPage({
  params,
}: {
  params: Promise<{ clubid: string }>;
}) {
  const { clubid } = await params;
  redirect(`/club/${clubid}/overview`);
}
