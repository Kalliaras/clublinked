"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShimmerButton } from "@/components/ui/shimmer-button";

export function HeroCTAs() {
  const router = useRouter();

  return (
    <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
      <ShimmerButton
        background="#0E4AE6"
        shimmerColor="#ffffff"
        borderRadius="8px"
        className="h-12 px-8 text-base font-semibold shadow-xl"
        onClick={() => router.push("/user/signup")}
      >
        Get Started
      </ShimmerButton>
      <Button
        asChild
        variant="outline"
        size="lg"
        className="h-12 px-8 text-base font-semibold"
      >
        <Link href="#find-university">Find Your University</Link>
      </Button>
    </div>
  );
}
