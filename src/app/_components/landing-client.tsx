"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, Building2, Zap } from "lucide-react";
import UniversitySearch from "./university-search";
import { cn } from "@/lib/utils/tailwind";

// Magic UI components
import { BlurFade } from "@/components/ui/blur-fade";
import { WordRotate } from "@/components/ui/word-rotate";
import { DotPattern } from "@/components/ui/dot-pattern";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { BorderBeam } from "@/components/ui/border-beam";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Marquee } from "@/components/ui/marquee";
import { Particles } from "@/components/ui/particles";

const features = [
  {
    icon: Calendar,
    title: "Events",
    description:
      "Create, promote, and manage club events with RSVPs and attendance tracking.",
  },
  {
    icon: Users,
    title: "Members",
    description:
      "Streamline onboarding with applications, roles, and member directories.",
  },
  {
    icon: Building2,
    title: "Clubs",
    description:
      "Discover and join clubs that match your interests, all in one place.",
  },
  {
    icon: Zap,
    title: "Automation",
    description:
      "Automate announcements, reminders, and workflows so you can focus on what matters.",
  },
];

const marqueeItems = [
  "Student Government",
  "Engineering Society",
  "Debate Club",
  "Sports Teams",
  "Cultural Organizations",
  "Pre-Med Society",
  "Film Club",
  "Hackathon Teams",
  "Volunteer Groups",
  "Business Clubs",
  "Music Ensembles",
];

export type Stat = { value: number; label: string };

export default function LandingClient({ stats }: { stats: Stat[] }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      {/* ── Hero Section ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Dot pattern background */}
        <DotPattern
          className={cn(
            "absolute inset-0 [mask-image:radial-gradient(700px_circle_at_center,white,transparent)]",
            "opacity-40"
          )}
        />

        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-16 md:pb-28 md:pt-24">
          <div className="flex flex-col items-center text-center">
            {/* Headline — WordRotate renders a motion.h1 internally */}
            <BlurFade delay={0.1} inView>
              <div className="max-w-3xl">
                <div className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                  The operating system for
                </div>
                <WordRotate
                  words={[
                    "student clubs",
                    "campus events",
                    "club leaders",
                  ]}
                  className="text-4xl font-extrabold tracking-tight text-primary sm:text-5xl md:text-6xl"
                />
              </div>
            </BlurFade>

            {/* Subtitle */}
            <BlurFade delay={0.3} inView>
              <p className="mt-4 max-w-2xl text-lg text-muted-foreground md:text-xl">
                ClubLinked helps universities manage clubs, events, and members
                in one place. Less admin work, more community building.
              </p>
            </BlurFade>

            {/* CTAs */}
            <BlurFade delay={0.4} inView>
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
                <ShimmerButton
                  background="#0E4AE6"
                  shimmerColor="#ffffff"
                  borderRadius="8px"
                  className="h-12 px-8 text-base font-semibold shadow-xl"
                  onClick={() => router.push("/user/signup")}
                >
                  Get Started
                </ShimmerButton>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-12 px-8 text-base font-semibold"
                >
                  <Link href="#find-university">Find Your University</Link>
                </Button>
              </div>
            </BlurFade>
          </div>
        </div>
      </section>

      {/* ── University Search Section ─────────────────────────────────── */}
      <section
        id="find-university"
        className="border-y bg-gray-50 py-16 md:py-20"
      >
        <div className="mx-auto max-w-6xl px-6">
          <BlurFade delay={0.1} inView>
            <div className="flex flex-col items-center text-center">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Find your university
              </h2>
              <p className="mt-3 max-w-lg text-muted-foreground">
                Search for your school to discover clubs, events, and
                organizations.
              </p>

              {/* Search card with BorderBeam */}
              <div className="relative mt-8 w-full max-w-xl overflow-hidden rounded-2xl border bg-white p-8 shadow-sm">
                <UniversitySearch />
                <BorderBeam
                  duration={8}
                  size={150}
                  colorFrom="#0E4AE6"
                  colorTo="#60a5fa"
                />
              </div>

              <p className="mt-4 text-sm text-muted-foreground">
                Don&apos;t see your university?{" "}
                <Link
                  href="/user/signup"
                  className="font-medium text-primary hover:underline"
                >
                  Sign up now
                </Link>
              </p>
            </div>
          </BlurFade>
        </div>
      </section>

      {/* ── Stats + Marquee Section ───────────────────────────────────── */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          {/* Stats row */}
          <BlurFade delay={0.1} inView>
            <div className="flex flex-col items-center justify-center gap-10 sm:flex-row sm:gap-16 mb-12">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col items-center">
                  <div className="flex items-baseline gap-1">
                    <NumberTicker
                      value={stat.value}
                      className="text-5xl font-extrabold text-primary tabular-nums"
                    />
                    <span className="text-3xl font-extrabold text-primary">+</span>
                  </div>
                  <span className="mt-1 text-base font-medium text-muted-foreground">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </BlurFade>

          {/* Marquee of campus keywords */}
          <BlurFade delay={0.2} inView>
            <div className="relative overflow-hidden">
              <Marquee pauseOnHover className="[--duration:35s]">
                {marqueeItems.map((item) => (
                  <div
                    key={item}
                    className="mx-3 flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-5 py-2 text-sm font-medium text-primary"
                  >
                    {item}
                  </div>
                ))}
              </Marquee>
              {/* Fade edges */}
              <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent" />
            </div>
          </BlurFade>
        </div>
      </section>

      {/* ── Features Section ──────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-gray-50/50">
        <div className="mx-auto max-w-6xl px-6">
          <BlurFade delay={0.1} inView>
            <div className="mb-12 text-center">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Everything your org needs
              </h2>
              <p className="mt-3 text-muted-foreground">
                Tools designed for student leaders, by student leaders.
              </p>
            </div>
          </BlurFade>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <BlurFade key={feature.title} delay={0.15 + index * 0.1} inView>
                <Card className="border-0 bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 h-full">
                  <CardContent className="pt-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-primary py-16 md:py-24">
        {/* Particle background */}
        <Particles
          className="absolute inset-0 z-0"
          quantity={80}
          color="#ffffff"
          ease={80}
        />

        <div className="relative z-10 mx-auto max-w-6xl px-6 text-center">
          <BlurFade delay={0.1} inView>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
              Ready to get your university on ClubLinked?
            </h2>
            <p className="mt-4 text-lg text-white/75">
              Set up takes less than 2 minutes. No credit card required.
            </p>
            <div className="mt-8 flex justify-center">
              <ShimmerButton
                background="#ffffff"
                shimmerColor="#0E4AE6"
                borderRadius="8px"
                className="h-12 px-10 text-base font-semibold text-primary shadow-2xl"
                onClick={() => router.push("/user/signup")}
              >
                Get Started Free
              </ShimmerButton>
            </div>
          </BlurFade>
        </div>
      </section>
    </div>
  );
}
