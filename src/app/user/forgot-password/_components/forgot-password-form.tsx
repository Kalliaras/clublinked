"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordResetAction } from "@/lib/actions/auth";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await requestPasswordResetAction(email);
      if (result.errorMessage) {
        setError(result.errorMessage);
        return;
      }
      setSent(true);
    });
  }

  return (
    <div className="w-full max-w-md rounded-3xl border border-blue-100 bg-white/90 p-7 shadow-xl shadow-blue-950/5 backdrop-blur sm:p-9">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-primary"><Mail className="size-5" /></span>
      <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-primary">Account recovery</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">Reset your password</h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-500">Enter your account email and we’ll send a secure reset link if an account exists.</p>

      {sent ? (
        <div className="mt-7">
          <p className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"><CheckCircle2 className="size-4 shrink-0" />Check your inbox for the reset link.</p>
          <Button asChild className="mt-5 w-full rounded-xl"><Link href="/user/login"><ArrowLeft className="size-4" />Return to login</Link></Button>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-7 space-y-5">
          <div className="space-y-2"><Label htmlFor="recovery-email">Email</Label><Input id="recovery-email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
          {error && <p role="alert" className="text-sm font-medium text-rose-700">{error}</p>}
          <Button type="submit" size="lg" disabled={pending} className="w-full rounded-xl">{pending ? <><Loader2 className="size-4 animate-spin" />Sending…</> : "Send reset link"}</Button>
          <Button asChild variant="link" className="w-full text-slate-500"><Link href="/user/login">Return to login</Link></Button>
        </form>
      )}
    </div>
  );
}
