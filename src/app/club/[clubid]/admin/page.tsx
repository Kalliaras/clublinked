import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminDashboardClient from "./_components/admin-dashboard-client";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ clubid: string }>;
}) {
  const { clubid } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/user/login");
  }

  const { data: role } = await supabase
    .from("user_roles")
    .select("is_owner, is_admin")
    .eq("user_id", user.id)
    .eq("club_id", clubid)
    .maybeSingle();

  if (!role || (!role.is_owner && !role.is_admin)) {
    redirect(`/club/${clubid}`);
  }

  const { data: club } = await supabase
    .from("clubs")
    .select("id, name, club_image")
    .eq("id", clubid)
    .single();

  if (!club) {
    redirect(`/club/${clubid}`);
  }

  const { data: adminRoles } = await supabase
    .from("user_roles")
    .select("club_id, clubs(name, club_image)")
    .eq("user_id", user.id)
    .or("is_owner.eq.true,is_admin.eq.true");

  const adminClubs = (adminRoles ?? [])
    .filter((r) => r.clubs)
    .map((r) => ({
      club_id: r.club_id,
      name: (r.clubs as { name: string | null; club_image: string | null }).name ?? "",
      club_image: (r.clubs as { name: string | null; club_image: string | null }).club_image ?? null,
    }));

  const { data: activeApplication } = await supabase
    .from("club_applications")
    .select("id, title")
    .eq("club_id", clubid)
    .eq("is_active", true)
    .maybeSingle();

  let totalApplications = 0;
  let pendingReview = 0;
  let interviewsScheduled = 0;
  let pipelineCounts = { pending: 0, interview: 0, accepted: 0, rejected: 0 };
  let recentSubmissions: {
    id: string;
    student: { first_name: string | null; last_name: string | null };
    submitted_at: string;
    status: string;
  }[] = [];
  let upcomingInterviews: {
    id: string;
    interview_time: string;
    interview_round: number;
    student: { first_name: string | null; last_name: string | null };
  }[] = [];

  if (activeApplication) {
    const { data: submissions } = await supabase
      .from("application_submissions")
      .select("id, status, student_id, submitted_at")
      .eq("application_id", activeApplication.id);

    const allSubs = submissions ?? [];
    totalApplications = allSubs.length;
    pendingReview = allSubs.filter((s) => s.status === "pending").length;
    pipelineCounts = {
      pending: allSubs.filter((s) => s.status === "pending").length,
      interview: allSubs.filter((s) => s.status === "interview").length,
      accepted: allSubs.filter((s) => s.status === "accepted").length,
      rejected: allSubs.filter((s) => s.status === "rejected").length,
    };

    const submissionIds = allSubs.map((s) => s.id);

    if (submissionIds.length > 0) {
      const now = new Date().toISOString();
      const { data: upcomingRaw } = await supabase
        .from("application_interviews")
        .select("id, submission_id, interview_round, interview_time")
        .gte("interview_time", now)
        .in("submission_id", submissionIds)
        .order("interview_time", { ascending: true })
        .limit(4);

      interviewsScheduled = (upcomingRaw ?? []).length;

      if (upcomingRaw && upcomingRaw.length > 0) {
        const interviewStudentIds = allSubs
          .filter((s) => upcomingRaw.some((i) => i.submission_id === s.id))
          .map((s) => s.student_id);

        const { data: interviewProfiles } = await supabase
          .from("profiles")
          .select("id, first_name, last_name")
          .in("id", interviewStudentIds);

        const profileMap = new Map(
          (interviewProfiles ?? []).map((p) => [p.id, p])
        );
        const studentIdBySubmission = new Map(
          allSubs.map((s) => [s.id, s.student_id])
        );

        upcomingInterviews = upcomingRaw.map((i) => {
          const studentId = studentIdBySubmission.get(i.submission_id) ?? "";
          const profile = profileMap.get(studentId);
          return {
            id: i.id,
            interview_time: i.interview_time ?? "",
            interview_round: i.interview_round,
            student: {
              first_name: profile?.first_name ?? null,
              last_name: profile?.last_name ?? null,
            },
          };
        });
      }
    }

    const pendingSubs = allSubs
      .filter((s) => s.status === "pending")
      .sort(
        (a, b) =>
          new Date(b.submitted_at).getTime() -
          new Date(a.submitted_at).getTime()
      )
      .slice(0, 5);

    if (pendingSubs.length > 0) {
      const pendingStudentIds = pendingSubs.map((s) => s.student_id);
      const { data: pendingProfiles } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .in("id", pendingStudentIds);

      const profileMap = new Map(
        (pendingProfiles ?? []).map((p) => [p.id, p])
      );

      recentSubmissions = pendingSubs.map((s) => {
        const profile = profileMap.get(s.student_id);
        return {
          id: s.id,
          student: {
            first_name: profile?.first_name ?? null,
            last_name: profile?.last_name ?? null,
          },
          submitted_at: s.submitted_at,
          status: s.status,
        };
      });
    }
  }

  const { count: memberCount } = await supabase
    .from("user_roles")
    .select("*", { count: "exact", head: true })
    .eq("club_id", clubid);

  const { data: userProfile } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <AdminDashboardClient
      clubId={clubid}
      club={{ id: club.id, name: club.name ?? "", club_image: club.club_image }}
      adminClubs={adminClubs}
      metrics={{
        totalApplications,
        pendingReview,
        interviewsScheduled,
        memberCount: memberCount ?? 0,
      }}
      pipelineCounts={pipelineCounts}
      recentSubmissions={recentSubmissions}
      upcomingInterviews={upcomingInterviews}
      userFirstName={userProfile?.first_name ?? null}
      userLastName={userProfile?.last_name ?? null}
    />
  );
}
