import { Link } from "react-router-dom";

const copy: Record<
  string,
  { eyebrow: string; title: string; body: string; next?: { label: string; to: string } }
> = {
  privacy: {
    eyebrow: "Legal",
    title: "Privacy Policy",
    body: "Seen collects only what we need to match you safely. Full policy text coming soon.",
  },
  terms: {
    eyebrow: "Legal",
    title: "Terms of Service",
    body: "Terms and community guidelines coming soon.",
  },
  cookies: {
    eyebrow: "Legal",
    title: "Cookie Policy",
    body: "We use the smallest set of cookies we can — just enough to keep you signed in and remember preferences.",
  },
};

export function StaticPage({ kind }: { kind: keyof typeof copy | string }) {
  const page = copy[kind] ?? {
    eyebrow: "Seen",
    title: "Coming soon",
    body: "This page is being built.",
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-6">
      <div className="max-w-lg text-center">
        <p className="eyebrow text-muted-foreground">{page.eyebrow}</p>
        <h1 className="display-3 mt-3 text-foreground">{page.title}</h1>
        <p className="mt-4 text-sm text-muted-foreground">{page.body}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {page.next ? (
            <Link to={page.next.to} className="btn-primary">
              {page.next.label}
            </Link>
          ) : null}
          <Link to="/" className="btn-secondary">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
