import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isAuthSessionMissingError } from "@supabase/supabase-js";

const signedOutErrorCodes = new Set([
  "refresh_token_not_found",
  "refresh_token_already_used",
  "session_not_found",
  "session_expired",
]);

export const getUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  const isSignedOut =
    error &&
    (isAuthSessionMissingError(error) ||
      signedOutErrorCodes.has(error.code ?? ""));

  if (error && !isSignedOut) {
    console.error("[getUser]", error.message);
  }

  return user ?? null;
});
