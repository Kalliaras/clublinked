"use client";

import { WordRotate } from "@/components/ui/word-rotate";

export function HeroWordRotate() {
  return (
    <WordRotate
      words={["student clubs", "campus events", "club leaders"]}
      className="text-4xl font-extrabold tracking-tight text-primary sm:text-5xl md:text-6xl"
      motionProps={{
        initial: { opacity: 1, y: 0 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 50 },
        transition: { duration: 0.25, ease: "easeOut" },
      }}
    />
  );
}
