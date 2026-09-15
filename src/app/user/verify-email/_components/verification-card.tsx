"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resendVerificationAction } from "@/lib/actions/auth";

export function VerificationCard({ email }: { email: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function resend() {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await resendVerificationAction(email);
      if (result.errorMessage) {
        setError(result.errorMessage);
        return;
      }
      setMessage("A fresh verification link has been sent.");
    });
  }

  return (
    <div className="w-full max-w-md rounded-3xl border border-blue-100 bg-white/90 p-7 text-center shadow-xl shadow-blue-950/5 backdrop-blur sm:p-9">
      <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-primary">
        <MailCheck className="size-6" />
      </span>
      <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-primary">One more step</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">Verify your email</h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-500">
        We sent a secure verification link to <strong className="text-slate-800">{email || "your inbox"}</strong>. Open it to finish creating your ClubLinked account.
      </p>
      {message && <p className="mt-5 flex items-center justify-center gap-2 text-sm font-medium text-emerald-700"><CheckCircle2 className="size-4" />{message}</p>}
      {error && <p role="alert" className="mt-5 text-sm font-medium text-rose-700">{error}</p>}
      <Button type="button" variant="outline" disabled={pending || !email} onClick={resend} className="mt-7 w-full rounded-xl">
        {pending ? <><Loader2 className="size-4 animate-spin" />Sending…</> : "Resend verification email"}
      </Button>
      <Button asChild variant="link" className="mt-2 text-slate-500"><Link href="/user/login">Return to login</Link></Button>
    </div>
  );
}
