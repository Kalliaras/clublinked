"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, KeyRound, Plus, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { joinWithAccessCodeAction } from "../actions";

export default function DiscoverHub({ universityName }: { universityName: string }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function join(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await joinWithAccessCodeAction(code);
      if ("errorMessage" in result) {
        setError(result.errorMessage);
        return;
      }
      router.push(`/club/${result.clubId}`);
    });
  }

  return (
    <main className="clublinked-page-background min-h-screen overflow-hidden">
      <section className="relative px-5 pb-16 pt-16 sm:px-8 lg:px-14 lg:pb-20 lg:pt-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.25fr_0.75fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/70 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary shadow-sm backdrop-blur"><Sparkles className="size-3.5" />ClubLinked discovery</span>
            <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-[-0.04em] text-slate-950 sm:text-6xl">Find the clubs that make campus feel like <span className="text-primary">yours.</span></h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">Explore student organizations at {universityName}, meet people who share your interests, and find your next opportunity.</p>
            <Button asChild size="lg" className="mt-8 rounded-xl bg-primary px-6 text-white shadow-lg shadow-primary/20 hover:bg-primary/90">
              <Link href="/club/search"><Search className="size-4" />Search all clubs<ArrowRight className="size-4" /></Link>
            </Button>
          </div>

          <div id="invite-code" className="scroll-mt-6 rounded-3xl border border-blue-100/80 bg-white/85 p-6 shadow-xl shadow-blue-950/5 backdrop-blur sm:p-7">
            <div className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-primary"><KeyRound className="size-5" /></div>
            <h2 className="mt-5 text-xl font-bold text-slate-950">Have an invite code?</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">Join a club directly with the code an administrator shared with you.</p>
            <form onSubmit={join} className="mt-5 space-y-3">
              <Input
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
                placeholder="Enter invite code"
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                disabled={isPending}
                aria-invalid={Boolean(error)}
                className="h-12 border-slate-200 bg-white text-slate-950 shadow-none placeholder:text-slate-400 focus-visible:border-primary/50 focus-visible:ring-primary/15"
              />
              {error && <p role="alert" className="text-sm font-medium text-rose-600">{error}</p>}
              <Button type="submit" disabled={isPending} className="h-12 w-full rounded-xl bg-primary font-bold text-white hover:bg-primary/90">
                {isPending ? "Joining..." : "Join with code"}
              </Button>
            </form>
          </div>
        </div>
      </section>

      <section className="relative px-5 pb-20 sm:px-8 lg:px-14 lg:pb-28">
        <div className="mx-auto max-w-6xl">
          <Link href="/club/create" className="group flex flex-col gap-6 overflow-hidden rounded-3xl border border-blue-100/80 bg-white/80 p-7 shadow-sm transition hover:border-primary/20 hover:shadow-lg sm:flex-row sm:items-center sm:p-9">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20"><Plus className="size-6" /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-bold uppercase tracking-[0.16em] text-primary">Build something new</span>
              <span className="mt-2 block text-2xl font-extrabold tracking-tight text-slate-950">Can&apos;t find your community? Start it.</span>
              <span className="mt-2 block max-w-2xl text-sm leading-relaxed text-slate-500">Create a club, bring people together, and give your next idea a home on campus.</span>
            </span>
            <span className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-primary">Create a club <ArrowRight className="size-4 transition group-hover:translate-x-1" /></span>
          </Link>
        </div>
      </section>
    </main>
  );
}
