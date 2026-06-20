import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export function SectionLabel({ children, optional }: { children: React.ReactNode; optional?: boolean }) {
  return (
    <p className="text-sm font-semibold text-foreground">
      {children}
      {optional && <span className="font-normal text-muted-foreground"> (optional)</span>}
    </p>
  );
}

export function PillGroup<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2.5", className)}>
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "min-h-10 rounded-full border px-4 py-2.5 text-sm transition-all duration-300",
              active
                ? "border-sage bg-sage text-primary-foreground shadow-[var(--shadow-glow-sage)]"
                : "border-border bg-card text-foreground hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-[var(--shadow-soft)]",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function LanguageGrid({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string; flag: string }[];
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const toggle = (lang: string) => {
    onChange(value.includes(lang) ? value.filter((x) => x !== lang) : [...value, lang]);
  };

  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {options.map((option) => {
        const active = value.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => toggle(option.value)}
            className={cn(
              "flex min-h-12 items-center justify-between rounded-xl border px-4 py-3.5 text-left text-sm transition-all duration-300",
              active
                ? "border-sage/50 bg-card shadow-[0_0_0_1px_var(--sage),var(--shadow-soft)]"
                : "border-border bg-card hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-[var(--shadow-soft)]",
            )}
          >
            <span className="flex items-center gap-3">
              <span aria-hidden className="text-lg leading-none">
                {option.flag}
              </span>
              {option.label}
            </span>
            {active && <Check className="h-4 w-4 shrink-0 text-sage" strokeWidth={2.5} />}
          </button>
        );
      })}
    </div>
  );
}

export function PrivacyNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-ocean/20 bg-ocean-soft/50 px-4 py-3 text-sm leading-relaxed text-foreground/85">
      {children}
    </div>
  );
}
