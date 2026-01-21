import Link from "next/link";
import Image from "next/image";
import logo from "../../../public/logo.png";
import LogOutButton from "@/components/ui/logoutbutton";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export default async function Header() {
  const supabase = await createClient();
  const userResult = await supabase.auth.getUser();
  const user = userResult?.data?.user ?? null;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur dark:bg-slate-900/80 border-b border-gray-200">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src={logo}
            alt="ClubLinked logo"
            width={36}
            height={36}
            className="object-contain"
          />
          <span className="text-lg font-bold text-[#1d56d8]">ClubLinked</span>
        </Link>

        {/* Nav */}
        <nav className="hidden gap-6 md:flex">
          <Link href="/features" className="text-sm hover:underline">
            Features
          </Link>
          <Link href="/pricing" className="text-sm hover:underline">
            Pricing
          </Link>
        </nav>

        {/* CTA */}
        {user ? (
          <LogOutButton />
        ) : (
          <div className="flex gap-3">
            <Link href="/user/signup">
              <Button>Sign up</Button>
            </Link>
            <Link href="/user/login">
              <Button variant="outline">Login</Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
