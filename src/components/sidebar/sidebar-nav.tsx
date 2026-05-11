"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Users, User } from "lucide-react";
import { cn } from "@/lib/utils/tailwind";

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
    { label: "Home", href: "/club", icon: Home },
    { label: "Discover", href: "/club/search", icon: Search },
    { label: "My Clubs", href: "/club", icon: Users },
    { label: "Profile", href: `/user/profile/${userId}`, icon: User },
  ];

  return (
    <nav className="flex flex-col gap-1 px-3 flex-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== "/club" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors",
              isActive && "bg-primary/10 text-primary font-semibold"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
