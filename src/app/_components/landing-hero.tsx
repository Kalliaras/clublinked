import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DotPattern } from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils/tailwind";

export default function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      <DotPattern
        className={cn(
          "absolute inset-0 [mask-image:radial-gradient(700px_circle_at_center,white,transparent)]",
          "opacity-40"
        )}
      />
      <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-16 md:pb-28 md:pt-24">
        <div className="flex flex-col items-center text-center">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              The operating system for{" "}
              <span className="text-primary">student clubs</span>
            </h1>
          </div>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground md:text-xl">
            ClubLinked helps universities manage clubs, events, and members
            in one place. Less admin work, more community building.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="h-12 px-8 text-base font-semibold shadow-xl"
            >
              <Link href="/user/signup">Get Started</Link>
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
  );
}
