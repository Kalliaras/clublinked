import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Footer from "@/components/footer/footer";
import Sidebar from "@/components/sidebar/sidebar";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Header from "@/components/header/header";
import { getUser } from "@/lib/supabase/get-user";

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
  const user = await getUser();

  return (
    <html lang="en">
      <body
        className={`${openSauceSans.className} ${openSauceSans.variable} antialiased bg-[var(--background)] text-[var(--foreground)] min-h-screen`}
      >
        <SpeedInsights />
        <Toaster />
        {user ? (
          <div className="flex">
            <Sidebar />
            <main className="flex-1 min-w-0">{children}</main>
          </div>
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
