"use client";

import { Infobox } from "@/app/user/signup/_components/infobox";
import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { SignUpAction } from "@/lib/actions/auth";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [, startTransition] = useTransition();

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) router.push("/");
    };
    checkUser();
  }, [router]);

  const handleSubmit = (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    major: string;
    academicYear: string;
    universityId: string | null;
  }) => {
    startTransition(async () => {
      const result = await SignUpAction(
        data.firstName,
        data.lastName,
        data.email,
        data.password,
        data.major || undefined,
        data.academicYear || undefined,
        data.universityId ?? undefined
      );
      if (result?.errorMessage) {
        toast.error("Error: " + result.errorMessage);
        return;
      }
      toast.success("Signed Up: Please check your email to verify your account.");
      router.push("/");
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-12">
        <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* LEFT TEXT — hidden on mobile, visible on desktop */}
          <section className="hidden text-primary lg:block">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              Find Your Campus
              <br />
              Community
            </h1>

            <p className="mt-5 max-w-md text-base text-primary/85 sm:text-lg">
              Join and connect with student clubs and organizations across your
              campus.
            </p>

            <div className="mt-10">
              <div className="h-px w-40 bg-primary/25" />
            </div>
          </section>

          {/* RIGHT: INFOBOX */}
          <section className="flex justify-center lg:justify-end">
            <div className="w-full max-w-sm">
              <Infobox onSubmitProp={handleSubmit} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
