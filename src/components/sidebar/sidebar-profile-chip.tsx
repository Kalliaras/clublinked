"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogOut, Loader2 } from "lucide-react";
import { LogOutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

interface SidebarProfileChipProps {
  firstName: string;
  lastName: string;
  subtitle: string;
}

export default function SidebarProfileChip({
  firstName,
  lastName,
  subtitle,
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
    <div className="mx-3 mb-4 p-3 rounded-2xl border border-border flex items-center gap-3">
      {/* Initials avatar */}
      <div className="h-9 w-9 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
        <span className="text-sm font-semibold text-primary">{initials}</span>
      </div>

      {/* Name + subtitle */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-foreground leading-tight truncate">
          {fullName}
        </p>
        <p className="text-[12px] text-muted-foreground leading-tight truncate">
          {subtitle}
        </p>
      </div>

      {/* Logout button */}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
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
