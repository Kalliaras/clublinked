"use client";

import { usePathname } from "next/navigation";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

interface AuthenticatedShellProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  defaultSidebarOpen: boolean;
}

export default function AuthenticatedShell({
  children,
  sidebar,
  defaultSidebarOpen,
}: AuthenticatedShellProps) {
  const pathname = usePathname();
  const usesAdminShell = /^\/club\/[^/]+\/admin(?:\/|$)/.test(pathname);

  if (usesAdminShell) {
    return children;
  }

  return (
    <SidebarProvider
      defaultOpen={defaultSidebarOpen}
      className="clublinked-page-background"
    >
      {sidebar}
      <SidebarInset className="min-w-0 bg-transparent">
        <SidebarTrigger className="fixed left-4 top-4 z-50 size-10 rounded-xl border border-slate-200 bg-white/95 shadow-sm backdrop-blur md:hidden" />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
