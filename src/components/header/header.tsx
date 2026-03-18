import Link from "next/link";
import { Logo } from "@/components/logo";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import UserAvatarMenu from "@/components/ui/user-avatar-menu";

export default async function Header({ slug }: { slug?: string | null }) {
  const supabase = await createClient();
  const userResult = await supabase.auth.getUser();
  const user = userResult?.data?.user ?? null;

  // Build links based on context
  const logoHref = slug ? `/${slug}` : "/";
  const signUpHref = slug ? `/${slug}/signup` : "/setup";
  const loginHref = slug ? `/${slug}/login` : "/setup";

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur dark:bg-slate-900/80 border-b border-gray-200">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href={logoHref} className="flex items-center gap-2">
          <Logo size={24} />
          <span className="text-lg font-bold text-primary">ClubLinked</span>
        </Link>

        {/* CTA */}
        {user ? (
          <UserAvatarMenu userId={user.id} slug={slug ?? undefined} />
        ) : (
          <div className="flex gap-3">
            <Link href={signUpHref}>
              <Button>Sign up</Button>
            </Link>
            <Link href={loginHref}>
              <Button variant="outline">Login</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
