import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/get-user";
import { createClient } from "@/lib/supabase/server";
import ApplicationsTracker from "./_components/applications-tracker";
import type { StudentApplication } from "./types";

export default async function UserApplicationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ profileid: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const [{ profileid }, query] = await Promise.all([params, searchParams]);
  const supabase = await createClient();
  const [user, result] = await Promise.all([
    getUser(),
    supabase.rpc("get_student_applications", { p_profile_id: profileid }),
  ]);

  if (!user) redirect("/user/login");
  if (user.id !== profileid) redirect("/user/profile/" + user.id + "/applications");

  const applications = Array.isArray(result.data)
    ? (result.data as unknown as StudentApplication[])
    : [];

  const activeFilter = ["application", "submitted", "interview", "accepted"].includes(query.status ?? "")
    ? query.status as "application" | "submitted" | "interview" | "accepted"
    : "all";

  return <ApplicationsTracker applications={applications} activeFilter={activeFilter} />;
}
