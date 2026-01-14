import { Gabarito } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import  Header from "@/components/header/header";
import Footer from "@/components/footer/footer";
import { SpeedInsights } from "@vercel/speed-insights/next"


const gabarito = Gabarito({
  variable: "--font-gabarito",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${gabarito.className} antialiased bg-[var(--background)] text-[var(--foreground)] min-h-screen`}
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
