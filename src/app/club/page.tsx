import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/get-user";
import { createClient } from "@/lib/supabase/server";
import StudentHome, { type StudentHomeData } from "./_components/student-home";

export default async function StudentHomePage() {
  const supabase = await createClient();
  const [user, homeResult] = await Promise.all([
    getUser(),
    supabase.rpc("get_student_home"),
  ]);

  if (!user) redirect("/user/login");
  if (homeResult.error || !homeResult.data || typeof homeResult.data !== "object" || Array.isArray(homeResult.data)) {
    throw new Error("The student home could not be loaded.");
  }

  return <StudentHome data={homeResult.data as unknown as StudentHomeData} now={new Date().toISOString()} />;
}
