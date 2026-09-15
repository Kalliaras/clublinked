import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Footer from "@/components/footer/footer";
import Sidebar from "@/components/sidebar/sidebar";
import AuthenticatedShell from "@/components/authenticated-shell";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Header from "@/components/header/header";
import { getUser } from "@/lib/supabase/get-user";
import { cookies } from "next/headers";

const openSauceSans = localFont({
  src: [
    {
      path: "../fonts/OpenSauceSansVF.ttf",
      style: "normal",
    },
    {
      path: "../fonts/OpenSauceSansVF-Italic.ttf",
      style: "italic",
    },
  ],
  variable: "--font-open-sauce-sans",
  display: "swap",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, cookieStore] = await Promise.all([getUser(), cookies()]);
  const sidebarStartsOpen =
    cookieStore.get("sidebar_state")?.value !== "false";

  return (
    <html lang="en">
      <body
        className={`${openSauceSans.className} ${openSauceSans.variable} antialiased bg-[var(--background)] text-[var(--foreground)] min-h-screen`}
      >
        <SpeedInsights />
        <Toaster />
        {user ? (
          <AuthenticatedShell
            sidebar={<Sidebar user={user} />}
            defaultSidebarOpen={sidebarStartsOpen}
          >
            {children}
          </AuthenticatedShell>
        ) : (
          <>
            <Header />
            {children}
            <Footer />
          </>
        )}
      </body>
    </html>
  );
}
