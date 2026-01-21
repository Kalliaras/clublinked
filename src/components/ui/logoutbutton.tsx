'use client'

import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { LogOutAction } from "@/app/user/actions/user";

function LogOutButton() {
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
    router.push("/");
  }

  return (
    <Button onClick={handleLogout} disabled={loading}>
      {loading ? <Loader2 className="animate-spin"/> : "Log out"}
    </Button>
  )
}

export default LogOutButton;