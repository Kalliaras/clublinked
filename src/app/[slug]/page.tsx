"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUniversity } from "@/lib/context/university-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function UniversityHub() {
  const university = useUniversity();
  const router = useRouter();
  const [code, setCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const handleJoin = async (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedCode = code.trim();
    if (!trimmedCode) {
      setError("Please enter an invite code.");
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("You must be signed in to join a club.");
        return;
      }

      const { data: club, error: clubError } = await supabase
        .from("clubs")
        .select("id, members")
        .eq("access_code", trimmedCode)
        .single();

      if (clubError || !club?.id) {
        setError("Invite code not found.");
        return;
      }

      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", user.id)
        .eq("club_id", club.id)
        .single();

      if (existingRole) {
        setError("You are already a member of this club.");
        return;
      }

      const { error: insertError } = await supabase.from("user_roles").insert({
        user_id: user.id,
        club_id: club.id,
        title: "Member",
        is_owner: false,
      });

      if (insertError) {
        setError("Could not join club. Please try again.");
        return;
      }

      const newMemberCount = (club.members ?? 0) + 1;
      const { error: updateError } = await supabase
        .from("clubs")
        .update({ members: newMemberCount })
        .eq("id", club.id);

      if (updateError) {
        setError("Joined the club, but could not update member count.");
        return;
      }

      setSuccess("You have joined the club!");
      setCode("");
      router.push(`/${university.slug}/club/${club.id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <main className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-12">
        <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Left section - hidden on mobile */}
          <section className="hidden text-primary lg:block">
            <div className="flex items-center gap-3 mb-8">
              <div className="relative h-10 w-10">
                <Image
                  src="/logo.png"
                  alt="ClubLinked logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-2xl font-bold tracking-wide">ClubLinked</span>
            </div>

            <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
              Join Your
              <br />
              Campus Community
            </h1>

            <p className="mt-5 max-w-md text-lg text-primary/85">
              Enter an invite code to join directly, or continue to search
              manually and discover clubs at {university.name}.
            </p>

            <div className="mt-10 h-px w-40 bg-primary/20" />
          </section>

          {/* Right card */}
          <section className="flex justify-center lg:justify-end">
            <Card className="w-full max-w-md border-gray-200 bg-white text-primary shadow-sm">
              <CardHeader className="space-y-2">
                <CardTitle className="text-3xl font-bold">Join a Club</CardTitle>
                <CardDescription className="text-base text-slate-600">
                  Use an invite code or continue to search manually.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {error && (
                  <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                    {success}
                  </div>
                )}

                <form onSubmit={handleJoin} className="space-y-6">
                  <div className="grid gap-2">
                    <label
                      htmlFor="invite-code"
                      className="text-sm font-medium text-primary"
                    >
                      Invite code
                    </label>
                    <Input
                      id="invite-code"
                      value={code}
                      onChange={(event) => setCode(event.target.value)}
                      placeholder="Enter invite code"
                      className="bg-white text-black"
                      disabled={loading}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary text-white hover:bg-primary/90"
                    disabled={loading}
                  >
                    {loading ? "Joining…" : "Join with Code"}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-3 text-slate-500">or</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link href={`/${university.slug}/clubs`}>
                    <Button
                      variant="outline"
                      className="w-full border-gray-200 text-primary hover:bg-primary hover:text-white"
                    >
                      Continue to Manual Search
                    </Button>
                  </Link>

                  <Link href={`/${university.slug}/club/create`}>
                    <Button
                      variant="ghost"
                      className="w-full text-primary hover:bg-primary/5"
                    >
                      Create a New Club
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
