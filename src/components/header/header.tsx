import Link from "next/link";
import Image from "next/image";
import logo from "../../../public/logo.png";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import UserAvatarMenu from "@/components/ui/user-avatar-menu";
import { headers } from "next/headers";

// Static routes that should NOT be treated as university slugs
const STATIC_ROUTES = new Set([
  "setup",
  "api",
  "_next",
  "user",
  "club",
  "favicon.ico",
]);

export default async function Header() {
  const supabase = await createClient();
  const userResult = await supabase.auth.getUser();
  const user = userResult?.data?.user ?? null;

  // Read pathname from middleware-injected header
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  // Extract potential slug from the first path segment
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0] || "";
  let slug: string | null = null;

  if (firstSegment && !STATIC_ROUTES.has(firstSegment)) {
    // Verify the slug corresponds to a real university
    const { data: university } = await supabase
      .from("universities")
      .select("slug")
      .eq("slug", firstSegment)
      .single();

    if (university) {
      slug = firstSegment;
    }
  }

  // Build links based on context
  const logoHref = slug ? `/${slug}` : "/";
  const signUpHref = slug ? `/${slug}/signup` : "/setup";
  const loginHref = slug ? `/${slug}/login` : "/setup";

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur dark:bg-slate-900/80 border-b border-gray-200">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href={logoHref} className="flex items-center gap-3">
          <Image
            src={logo}
            alt="ClubLinked logo"
            width={36}
            height={36}
            sizes="36px"
            className="object-contain"
          />
          <span className="text-lg font-bold text-primary">ClubLinked</span>
        </Link>

        {/* Nav - only show on landing/marketing pages */}
        {!slug && (
          <nav className="hidden gap-6 md:flex">
            <Link href="/features" className="text-sm hover:underline">
              Features
            </Link>
            <Link href="/pricing" className="text-sm hover:underline">
              Pricing
            </Link>
          </nav>
        )}

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
