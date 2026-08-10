import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/supabase/get-user";
import ApplicationsClient from "./_components/applications-client";

export default async function ApplicationsPage({
  params,
}: {
  params: Promise<{ clubid: string }>;
}) {
  const { clubid } = await params;
  const supabase = await createClient();

  const user = await getUser();
  if (!user) redirect("/user/login");

  const [roleResult, clubResult, adminRolesResult, applicationResult, profileResult] =
    await Promise.all([
      supabase
        .from("user_roles")
        .select("is_owner, is_admin")
        .eq("user_id", user.id)
        .eq("club_id", clubid)
        .maybeSingle(),
      supabase
        .from("clubs")
        .select("id, name, club_image")
        .eq("id", clubid)
        .single(),
      supabase
        .from("user_roles")
        .select("club_id, clubs(name, club_image)")
        .eq("user_id", user.id)
        .or("is_owner.eq.true,is_admin.eq.true"),
      supabase
        .from("club_applications")
        .select("id, title")
        .eq("club_id", clubid)
        .eq("is_active", true)
        .maybeSingle(),
      supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", user.id)
        .maybeSingle(),
    ]);

  const { data: role } = roleResult;

  if (!role || (!role.is_owner && !role.is_admin)) {
    redirect(`/club/${clubid}`);
  }

  const { data: club } = clubResult;

  if (!club) redirect(`/club/${clubid}`);

  const { data: adminRoles } = adminRolesResult;

  const adminClubs = (adminRoles ?? [])
    .filter((r) => r.clubs)
    .map((r) => ({
      club_id: r.club_id,
      name: (r.clubs as { name: string | null; club_image: string | null }).name ?? "",
      club_image: (r.clubs as { name: string | null; club_image: string | null }).club_image ?? null,
    }));

  const { data: activeApplication } = applicationResult;

  let effectiveApplication = activeApplication;
  if (!effectiveApplication) {
    const { data: fallbackApp } = await supabase
      .from("club_applications")
      .select("id, title")
      .eq("club_id", clubid)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    effectiveApplication = fallbackApp;
  }

  const { data: userProfile } = profileResult;

  type Submission = {
    id: string;
    status: string;
    submitted_at: string;
    student: {
      first_name: string | null;
      last_name: string | null;
      major: string | null;
      academic_year: string | null;
    };
  };

  let submissions: Submission[] = [];

  if (effectiveApplication) {
    const { data: subs } = await supabase
      .from("application_submissions")
      .select(
        "id, status, submitted_at, student:profiles!application_submissions_student_id_fkey(first_name, last_name, major, academic_year)"
      )
      .eq("application_id", effectiveApplication.id);

    if (subs) {
      submissions = subs.map((s) => {
        const profile = s.student as {
          first_name: string | null;
          last_name: string | null;
          major: string | null;
          academic_year: string | null;
        } | null;
        return {
          id: s.id,
          status: s.status,
          submitted_at: s.submitted_at,
          student: {
            first_name: profile?.first_name ?? null,
            last_name: profile?.last_name ?? null,
            major: profile?.major ?? null,
            academic_year: profile?.academic_year ?? null,
          },
        };
      });
    }
  }

  return (
    <ApplicationsClient
      clubId={clubid}
      club={{ id: club.id, name: club.name ?? "", club_image: club.club_image }}
      adminClubs={adminClubs}
      applicationTitle={effectiveApplication?.title ?? null}
      submissions={submissions}
      userFirstName={userProfile?.first_name ?? null}
      userLastName={userProfile?.last_name ?? null}
    />
  );
}
