"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogOut, Loader2 } from "lucide-react";
import { LogOutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

interface SidebarProfileChipProps {
  firstName: string;
  lastName: string;
  profileHref: string;
}

export default function SidebarProfileChip({
  firstName,
  lastName,
  profileHref,
}: SidebarProfileChipProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  const fullName = `${firstName} ${lastName}`;

  const handleLogout = async () => {
    setLoading(true);
    const result = await LogOutAction();
    if (result?.errorMessage) {
      toast.error("Error logging out: " + result.errorMessage);
      setLoading(false);
      return;
    }
    toast.success("Logged out successfully");
    router.push("/");
  };

  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-2 shadow-xs group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:p-1 group-data-[collapsible=icon]:shadow-none">
      <Link
        href={profileHref}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary group-data-[collapsible=icon]:flex-none"
        aria-label="View your profile"
      >
        {/* Initials avatar */}
        <div className="h-9 w-9 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-sm font-semibold text-primary">{initials}</span>
        </div>

        {/* Name */}
        <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
          <p className="text-[13px] font-bold text-foreground leading-tight truncate">
            {fullName}
          </p>
        </div>
      </Link>

      {/* Logout button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        data-collapsed-hidden
        onClick={handleLogout}
        disabled={loading}
        aria-label="Log out"
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <LogOut className="h-3.5 w-3.5" />
        )}
      </Button>
    </div>
  );
}
