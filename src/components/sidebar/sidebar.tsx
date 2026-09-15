import Link from "next/link";
import { Logo } from "@/components/logo";
import { createClient } from "@/lib/supabase/server";
import SidebarNav from "@/components/sidebar/sidebar-nav";
import SidebarProfileChip from "@/components/sidebar/sidebar-profile-chip";
import type { User } from "@supabase/supabase-js";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";

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
    <ShadcnSidebar collapsible="icon" className="border-sidebar-border">
      <SidebarHeader className="gap-0 bg-white p-0">
        <div className="flex h-[76px] items-center gap-2 px-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2">
          <Link href="/home" aria-label="Go to ClubLinked home" className="flex min-w-0 flex-1 items-center gap-2.5 group-data-[collapsible=icon]:flex-none">
            <Logo size={34} />
            <span className="truncate text-base font-extrabold tracking-tight text-primary group-data-[collapsible=icon]:hidden">ClubLinked</span>
          </Link>
          <SidebarTrigger className="size-9 shrink-0 rounded-lg border border-slate-200 bg-white text-slate-500 shadow-xs hover:bg-blue-50 hover:text-primary group-data-[collapsible=icon]:hidden" />
        </div>
        <SidebarSeparator className="mx-0 h-px bg-slate-300" />
      </SidebarHeader>

      <SidebarContent className="bg-white">
        <SidebarNav userId={user.id} />
      </SidebarContent>

      <SidebarFooter className="bg-white p-2">
        <SidebarTrigger className="mx-auto hidden size-9 rounded-lg border border-slate-200 bg-white text-slate-500 shadow-xs hover:bg-blue-50 hover:text-primary group-data-[collapsible=icon]:flex" />
        <SidebarProfileChip
          firstName={firstName}
          lastName={lastName}
          profileHref={`/user/profile/${user.id}`}
        />
      </SidebarFooter>
      <SidebarRail />
    </ShadcnSidebar>
  );
}
