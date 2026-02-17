'use client';

import { Infobox } from "@/app/user/login/infobox";
import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { LoginAction } from "../actions/user";

export default function UserLoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const result = await LoginAction(email, password);
      const errorMessage = result?.errorMessage;

      if (errorMessage) {
        toast.error("Error: " + errorMessage);
        return;
      }

      toast.success("Logged in successfully!");
      router.push("/club/clubsearch");
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-12">
        <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-2">
          
          {/* LEFT TEXT — hidden on mobile, visible on desktop */}
          <section className="hidden text-[#0E4AE6] lg:block">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              Find Your Campus
              <br />
              Community
            </h1>

            <p className="mt-5 max-w-md text-base text-[#0E4AE6]/85 sm:text-lg">
              Join and connect with student clubs and organizations across your
              campus.
            </p>

            <div className="mt-10">
              <div className="h-px w-40 bg-[#0E4AE6]/25" />
            </div>
          </section>

          {/* RIGHT: INFOBOX */}
          <section className="flex justify-center lg:justify-end">
            <div className="w-full max-w-sm">
              <Infobox onSubmitProp={handleSubmit} isPending={isPending} />
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
