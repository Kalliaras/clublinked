import Link from "next/link";
import { Logo } from "@/components/logo";
import { createClient } from "@/lib/supabase/server";
import SidebarNav from "@/components/sidebar/sidebar-nav";
import SidebarProfileChip from "@/components/sidebar/sidebar-profile-chip";
import type { User } from "@supabase/supabase-js";

export default async function Sidebar({ user }: { user: User }) {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", user.id)
    .single();

  const firstName = profile?.first_name ?? "";
  const lastName = profile?.last_name ?? "";

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
        profileHref={`/user/profile/${user.id}`}
      />
    </aside>
  );
}
