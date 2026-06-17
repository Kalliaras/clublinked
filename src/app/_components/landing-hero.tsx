import { DotPattern } from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils/tailwind";
import { HeroWordRotate } from "./landing-hero-word-rotate";
import { HeroCTAs } from "./landing-hero-ctas";

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
            <div className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              The operating system for
            </div>
            <HeroWordRotate />
          </div>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground md:text-xl">
            ClubLinked helps universities manage clubs, events, and members
            in one place. Less admin work, more community building.
          </p>
          <HeroCTAs />
        </div>
      </div>
    </section>
  );
}
