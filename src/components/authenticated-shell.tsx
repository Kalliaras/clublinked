"use client";

import { usePathname } from "next/navigation";

interface AuthenticatedShellProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}

export default function AuthenticatedShell({
  children,
  sidebar,
}: AuthenticatedShellProps) {
  const pathname = usePathname();
  const usesAdminShell = /^\/club\/[^/]+\/admin(?:\/|$)/.test(pathname);

  if (usesAdminShell) {
    return children;
  }

  return (
    <div className="flex">
      {sidebar}
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
