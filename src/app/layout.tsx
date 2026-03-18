import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import  Header from "@/components/header/header";
import Footer from "@/components/footer/footer";
import { SpeedInsights } from "@vercel/speed-insights/next"


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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${openSauceSans.className} ${openSauceSans.variable} antialiased bg-[var(--background)] text-[var(--foreground)] min-h-screen`}
      >
        <SpeedInsights />
        <Header />
        <Toaster />
        {children}
        <Footer/>
      </body>
    </html>
  );
}
