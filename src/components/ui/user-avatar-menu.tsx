'use client'

import { Logo } from "@/components/logo";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogOutAction } from "@/lib/actions/auth";
import { Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function UserAvatarMenu({ userId, slug }: { userId: string; slug?: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setLoading(true);

    const result = await LogOutAction();
    const errorMessage = result?.errorMessage;

    if (errorMessage) {
      toast.error("Error logging out: " + errorMessage);
      setLoading(false);
      return;
    }

    toast.success("Logged out successfully");
    router.push(slug ? `/${slug}` : "/");
  };

  const handleProfileClick = () => {
    router.push(`/user/profile/${userId}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative h-10 w-10 overflow-hidden rounded-full border border-slate-200 hover:border-slate-300 transition-colors flex items-center justify-center">
          <Logo size={28} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleProfileClick}>
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={loading}
          variant="destructive"
          className="text-red-600"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
