import Image from "next/image";
import { cn } from "@/lib/utils/tailwind";

interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 32, className }: LogoProps) {
  return (
    <div
      className={cn("inline-flex items-center justify-center shrink-0", className)}
      style={{
        width: size,
        height: size,
        position: "relative",
      }}
      aria-hidden="true"
    >
      <Image
        src="/App_icon_no_name.png"
        alt="ClubLinked"
        fill
        className="object-contain"
      />
    </div>
  );
}

export default Logo;
