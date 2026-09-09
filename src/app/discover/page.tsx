import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/get-user";
import { createClient } from "@/lib/supabase/server";
import DiscoverHub from "./_components/discover-hub";

export default async function DiscoverPage() {
  const user = await getUser();
  if (!user) redirect("/user/login");

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("universities(name)")
    .eq("id", user.id)
    .maybeSingle();
  const university = profile?.universities as { name: string | null } | null;

  return <DiscoverHub universityName={university?.name ?? "your campus"} />;
}
