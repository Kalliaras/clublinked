import { redirect } from "next/navigation";

export default async function ClubDashboardPage({
  params,
}: {
  params: Promise<{ slug: string; clubid: string }>;
}) {
  const { slug, clubid } = await params;
  redirect(`/${slug}/club/${clubid}/overview`);
}
