'use client'

import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react";
import Link from "next/link"
import { useState } from "react";

function SignupButton() {
  const [loading, setLoading] = useState(false);
  return (
    <Button>
          {loading ? <Loader2/> : <Link href="/user/signup">Sign up</Link>}
        </Button>
  )
}

export default SignupButton;