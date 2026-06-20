import { Link } from "react-router-dom";
import { crisisResources } from "@/lib/mock";

export function SupportPage() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border/60">
        <div className="mx-auto flex h-14 max-w-2xl items-center px-5">
          <Link to="/" className="font-serif text-lg">
            Seen
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-2xl px-5 py-16">
        <p className="eyebrow text-muted-foreground">Crisis support</p>
        <h1 className="display-2 mt-4">You deserve immediate care</h1>
        <p className="mt-4 text-muted-foreground">
          Seen is not an emergency service. If you&apos;re in crisis, please contact one of
          these resources.
        </p>
        <ul className="mt-10 space-y-4">
          {crisisResources.map((r) => (
            <li key={r.name} className="surface-card p-5">
              <p className="font-medium">{r.name}</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
                {r.region}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{r.contact}</p>
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary mt-4 text-xs"
              >
                Learn more
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
