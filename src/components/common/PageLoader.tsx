import { cn } from "@/lib/utils";

export function PageLoader({ variant = "page" }: { variant?: "page" | "inline" }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        variant === "page" ? "min-h-dvh bg-background" : "h-full w-full py-16",
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-pulse rounded-full bg-sage/30" />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    </div>
  );
}
