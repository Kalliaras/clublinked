import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ApplicationsClient from "./_components/applications-client";

export default async function ApplicationsPage({
  params,
}: {
  params: Promise<{ clubid: string }>;
}) {
  const { clubid } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/user/login");

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

  if (!club) redirect(`/club/${clubid}`);

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

  const { data: userProfile } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", user.id)
    .maybeSingle();

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
      .select("id, status, student_id, submitted_at")
      .eq("application_id", effectiveApplication.id);

    if (subs && subs.length > 0) {
      const studentIds = subs.map((s) => s.student_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, major, academic_year")
        .in("id", studentIds);

      const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

      submissions = subs.map((s) => {
        const profile = profileMap.get(s.student_id);
        return {
          id: s.id,
          status: s.status,
          submitted_at: s.submitted_at,
          student: {
            first_name: profile?.first_name ?? null,
            last_name: profile?.last_name ?? null,
            major: (profile as { major?: string | null })?.major ?? null,
            academic_year: (profile as { academic_year?: string | null })?.academic_year ?? null,
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
