import { Link } from "react-router-dom";
import { SeenLogo } from "@/components/brand/SeenLogo";
import { crisisResources } from "@/lib/mock";

export function SupportPage() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border/60">
        <div className="mx-auto flex h-14 max-w-4xl items-center px-5">
          <Link to="/" className="inline-block">
            <SeenLogo className="h-9 sm:h-10" />
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-5 py-16">
        <p className="eyebrow text-muted-foreground">Crisis support</p>
        <h1 className="display-2 mt-4">You deserve immediate care</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Seen is not an emergency service. If you&apos;re in crisis, please contact one of
          these resources.
        </p>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {crisisResources.map((r) => (
            <li key={r.name} className="surface-card flex flex-col p-6">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{r.region}</p>
              <p className="mt-2 font-medium text-foreground">{r.name}</p>
              <p className="mt-2 text-sm text-muted-foreground">{r.contact}</p>
              <div className="mt-auto pt-5">
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                >
                  Learn more
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
