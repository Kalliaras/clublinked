import Image from "next/image";
import Link from "next/link";
import logo from "../../public/logo.png";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, Building2, Zap } from "lucide-react";
import UniversitySearch from "./_components/university-search";

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

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0E4AE6]/5 via-transparent to-[#0E4AE6]/5" />
        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-16 md:pb-28 md:pt-24">
          <div className="flex flex-col items-center text-center">
            {/* Logo Badge */}
            <div className="mb-8 flex items-center gap-3 rounded-full border bg-white px-5 py-2 shadow-sm">
              <Image
                src={logo}
                alt="ClubLinked logo"
                width={28}
                height={28}
                className="object-contain"
              />
              <span className="text-sm font-semibold text-primary">
                ClubLinked
              </span>
            </div>

            {/* Headline */}
            <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              The operating system for{" "}
              <span className="text-primary">student organizations</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              ClubLinked helps universities manage clubs, events, and members in
              one place. Less admin work, more community building.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-12 px-8 text-base font-semibold"
              >
                <Link href="/setup">Get Started</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 px-8 text-base font-semibold"
              >
                <Link href="#find-university">Find Your University</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* University Search Section */}
      <section
        id="find-university"
        className="border-y bg-gray-50 py-16 md:py-20"
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Find your university
            </h2>
            <p className="mt-3 max-w-lg text-muted-foreground">
              Search for your school to discover clubs, events, and
              organizations.
            </p>
            <div className="mt-8 w-full flex justify-center">
              <UniversitySearch />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Don&apos;t see your university?{" "}
              <Link
                href="/setup"
                className="font-medium text-primary hover:underline"
              >
                Set it up now
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Everything your org needs
            </h2>
            <p className="mt-3 text-muted-foreground">
              Tools designed for student leaders, by student leaders.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="border-0 bg-gray-50 shadow-none transition-shadow hover:shadow-md"
              >
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
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t bg-primary py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Ready to get your university on ClubLinked?
          </h2>
          <p className="mt-3 text-primary-foreground/80">
            Set up takes less than 2 minutes. No credit card required.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 h-12 bg-white px-8 text-base font-semibold text-primary hover:bg-gray-100"
          >
            <Link href="/setup">Get Started Free</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
