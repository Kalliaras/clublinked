import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/supabase/get-user";
import AdminDashboardClient, {
  type AdminDashboardProps,
} from "./_components/admin-dashboard-client";

type DashboardSnapshot = {
  club: AdminDashboardProps["club"];
  metrics: AdminDashboardProps["metrics"];
  application_title: string | null;
  admin_clubs: AdminDashboardProps["adminClubs"];
  pipeline_counts: AdminDashboardProps["pipelineCounts"];
  recent_submissions: AdminDashboardProps["recentSubmissions"];
  upcoming_interviews: AdminDashboardProps["upcomingInterviews"];
  user_profile: {
    first_name: string | null;
    last_name: string | null;
  } | null;
};

export default async function AdminPage({
  params,
}: {
  params: Promise<{ clubid: string }>;
}) {
  const { clubid } = await params;
  const user = await getUser();

  if (!user) {
    redirect("/user/login");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_admin_dashboard", {
    p_club_id: clubid,
  });

  if (error || !data || typeof data !== "object" || Array.isArray(data)) {
    redirect(`/club/${clubid}`);
  }

  const dashboard = data as unknown as DashboardSnapshot;

  return (
    <AdminDashboardClient
      clubId={clubid}
      club={dashboard.club}
      adminClubs={dashboard.admin_clubs}
      metrics={dashboard.metrics}
      pipelineCounts={dashboard.pipeline_counts}
      recentSubmissions={dashboard.recent_submissions}
      upcomingInterviews={dashboard.upcoming_interviews}
      userFirstName={dashboard.user_profile?.first_name ?? null}
      userLastName={dashboard.user_profile?.last_name ?? null}
    />
  );
}
