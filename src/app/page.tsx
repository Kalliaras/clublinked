import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/supabase/get-user";
import LandingClient from "./_components/landing-client";

export default async function Home() {
  const user = await getUser();
  if (user) {
    redirect("/club/search");
  }

  const supabase = await createClient();
  const [clubsRes, universityRes, studentsRes] = await Promise.all([
    supabase.from("clubs").select("id", { count: "exact", head: true }),
    supabase.from("universities").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
  ]);

  const stats = [
    { value: clubsRes.count ?? 500, label: "Clubs" },
    { value: universityRes.count ?? 50, label: "Universities" },
    { value: studentsRes.count ?? 10000, label: "Students" },
  ];

  return <LandingClient stats={stats} />;
}
