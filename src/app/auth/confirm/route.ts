import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const allowedOtpTypes = new Set<EmailOtpType>([
  "email",
  "email_change",
  "invite",
  "magiclink",
  "recovery",
  "signup",
]);

function safeInternalPath(value: string | null, fallback: string) {
  if (!value?.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const code = request.nextUrl.searchParams.get("code");
  const requestedType = request.nextUrl.searchParams.get("type");
  const type = requestedType && allowedOtpTypes.has(requestedType as EmailOtpType)
    ? requestedType as EmailOtpType
    : null;
  const supabase = await createClient();
  let verifiedUserId: string | null = null;

  if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) verifiedUserId = data.user?.id ?? null;
  } else if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) verifiedUserId = data.user?.id ?? null;
  }

  if (verifiedUserId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      const profileResult = existingProfile
        ? await supabase.from("profiles").update({ email: user.email ?? null }).eq("id", user.id)
        : await supabase.from("profiles").insert({
            id: user.id,
            email: user.email ?? null,
            first_name: typeof user.user_metadata.first_name === "string" ? user.user_metadata.first_name.slice(0, 80) : null,
            last_name: typeof user.user_metadata.last_name === "string" ? user.user_metadata.last_name.slice(0, 80) : null,
            major: typeof user.user_metadata.major === "string" ? user.user_metadata.major.slice(0, 120) || null : null,
            academic_year: typeof user.user_metadata.academic_year === "string" ? user.user_metadata.academic_year.slice(0, 40) || null : null,
            university_id: typeof user.user_metadata.university_id === "string" ? user.user_metadata.university_id : null,
          });

      if (profileResult.error) {
        console.error("[auth/confirm-profile]", profileResult.error.message);
      }
    }

    const fallback = type === "recovery"
      ? "/user/reset-password"
      : type === "email_change"
        ? `/user/profile/${verifiedUserId}/edit`
        : "/home";
    const next = safeInternalPath(request.nextUrl.searchParams.get("next"), fallback);
    return NextResponse.redirect(new URL(next, request.url));
  }

  const errorUrl = new URL("/user/login", request.url);
  errorUrl.searchParams.set("authError", "invalid_or_expired_link");
  return NextResponse.redirect(errorUrl);
}
