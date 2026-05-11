import Link from "next/link";
import { Logo } from "@/components/logo";
import { createClient } from "@/lib/supabase/server";
import SidebarNav from "@/components/sidebar/sidebar-nav";
import SidebarProfileChip from "@/components/sidebar/sidebar-profile-chip";

export default async function Sidebar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, email, university_id")
    .eq("id", user.id)
    .single();

  const { data: university } = profile?.university_id
    ? await supabase
        .from("universities")
        .select("name")
        .eq("id", profile.university_id)
        .single()
    : { data: null };

  const firstName = profile?.first_name ?? "";
  const lastName = profile?.last_name ?? "";
  const subtitle = university?.name ?? profile?.email ?? user.email ?? "";

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-white flex flex-col h-screen sticky top-0">
      {/* Brand row */}
      <div className="px-4 pt-6 pb-6 flex items-center gap-3">
        <Link href="/club" className="flex items-center gap-2.5">
          <Logo size={36} />
          <span className="text-base font-bold text-primary">ClubLinked</span>
        </Link>
      </div>

      {/* Nav items */}
      <SidebarNav userId={user.id} />

      {/* Profile chip */}
      <SidebarProfileChip
        firstName={firstName}
        lastName={lastName}
        subtitle={subtitle}
      />
    </aside>
  );
}
