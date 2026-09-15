"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, FileText, Home, Search, Users, User } from "lucide-react";
import { cn } from "@/lib/utils/tailwind";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface SidebarNavProps {
  userId: string;
}

export default function SidebarNav({ userId }: SidebarNavProps) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { label: "Home", href: "/home", icon: Home },
    { label: "Discover", href: "/discover", icon: Search },
    { label: "Calendar", href: `/user/profile/${userId}/calendar`, icon: CalendarDays },
    { label: "Applications", href: `/user/profile/${userId}/applications`, icon: FileText },
    { label: "My Clubs", href: `/user/profile/${userId}/clubs`, icon: Users },
    { label: "Profile", href: `/user/profile/${userId}`, icon: User },
  ];
  const activeHref = navItems
    .filter(
      (item) =>
        pathname === item.href ||
        pathname.startsWith(`${item.href}/`)
    )
    .toSorted((left, right) => right.href.length - left.href.length)[0]?.href;

  return (
    <SidebarGroup className="px-3 py-5 group-data-[collapsible=icon]:px-2">
      <SidebarGroupLabel className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
        Workspace
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <nav aria-label="Main navigation">
          <SidebarMenu className="gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === activeHref;

              return (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.label}
                    className={cn(
                      "h-10 rounded-xl px-3 font-semibold text-slate-600 hover:bg-blue-50 hover:text-primary",
                      isActive && "bg-blue-50 text-primary"
                    )}
                  >
                    <Link href={item.href}>
                      <Icon className="size-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </nav>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
