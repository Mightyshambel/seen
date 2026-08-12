import { cn } from "@/lib/utils";

const LOGO_MASK = "url(/seen-logo.svg)";

type SeenLogoProps = {
  /** White logo for dark/hero backgrounds; sage green on light backgrounds by default */
  tone?: "default" | "light";
  className?: string;
};

export function SeenLogo({ tone = "default", className }: SeenLogoProps) {
  const isLight = tone === "light";

  return (
    <span
      role="img"
      aria-label="Seen"
      className={cn(
        "inline-block shrink-0 bg-sage",
        isLight && "bg-white",
        className,
      )}
      style={{
        aspectRatio: "1",
        maskImage: LOGO_MASK,
        WebkitMaskImage: LOGO_MASK,
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
        maskSize: "contain",
        WebkitMaskSize: "contain",
      }}
    />
  );
}
