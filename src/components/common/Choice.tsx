import { cn } from "@/lib/utils";

export function Chip({
  active,
  children,
  onClick,
  tone = "sage",
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  tone?: "sage" | "lavender" | "ocean" | "sand" | "clay";
}) {
  const tones = {
    sage: "border-sage/30 bg-sage-soft text-foreground",
    lavender: "border-lavender/30 bg-lavender-soft text-foreground",
    ocean: "border-ocean/30 bg-ocean-soft text-foreground",
    sand: "border-border bg-sand/40 text-foreground",
    clay: "border-clay/30 bg-clay-soft text-foreground",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex min-h-10 items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition-all duration-300",
        active
          ? "border-foreground bg-foreground text-background shadow-[0_8px_24px_-8px_oklch(0.24_0.02_268_/_0.3)]"
          : tones[tone] + " hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-[var(--shadow-soft)]",
      )}
    >
      {children}
    </button>
  );
}

export function ChoiceTile({
  active,
  title,
  description,
  icon,
  onClick,
}: {
  active?: boolean;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "group flex min-h-16 w-full items-start gap-4 rounded-2xl border p-6 text-left transition-all duration-300",
        active
          ? "border-sage/40 bg-card shadow-[var(--shadow-elevated)] ring-1 ring-sage/15"
          : "border-border/80 bg-card/70 hover:-translate-y-0.5 hover:border-foreground/15 hover:bg-card hover:shadow-[var(--shadow-soft)]",
      )}
    >
      {icon && (
        <span
          className={cn(
            "mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-full transition",
            active
              ? "bg-sage text-primary-foreground shadow-[var(--shadow-glow-sage)]"
              : "bg-sage-soft text-sage",
          )}
        >
          {icon}
        </span>
      )}
      <span className="flex-1">
        <span className="block font-medium text-foreground">{title}</span>
        {description && <span className="mt-1 block text-sm text-muted-foreground">{description}</span>}
      </span>
    </button>
  );
}
