export function PageLoader() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-pulse rounded-full bg-sage/30" />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    </div>
  );
}
