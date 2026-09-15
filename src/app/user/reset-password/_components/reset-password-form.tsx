"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CheckCircle2, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePasswordAction, type ResetPasswordState } from "../actions";

const initialState: ResetPasswordState = {};

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(updatePasswordAction, initialState);

  return (
    <div className="w-full max-w-md rounded-3xl border border-blue-100 bg-white/90 p-7 shadow-xl shadow-blue-950/5 backdrop-blur sm:p-9">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-primary">
        <KeyRound className="size-5" />
      </span>
      <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-primary">Account recovery</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">Choose a new password</h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-500">
        Use at least eight characters and avoid passwords you use for other accounts.
      </p>

      {state.successMessage ? (
        <div className="mt-7">
          <p className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"><CheckCircle2 className="size-4 shrink-0" />{state.successMessage}</p>
          <Button asChild size="lg" className="mt-5 w-full rounded-xl"><Link href="/home">Continue to ClubLinked</Link></Button>
        </div>
      ) : <form action={formAction} className="mt-7 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="new-password">New password</Label>
          <Input
            id="new-password"
            name="password"
            type="password"
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm new password</Label>
          <Input
            id="confirm-password"
            name="confirmPassword"
            type="password"
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
            required
          />
        </div>
        {state.errorMessage && (
          <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {state.errorMessage}
          </p>
        )}
        <Button type="submit" size="lg" disabled={pending} className="w-full rounded-xl">
          {pending ? <><Loader2 className="size-4 animate-spin" />Updating password…</> : <><ShieldCheck className="size-4" />Update password</>}
        </Button>
      </form>}
    </div>
  );
}
