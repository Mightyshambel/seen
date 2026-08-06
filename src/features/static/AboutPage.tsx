import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { TeamGrid } from "@/components/about/TeamGrid";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteChrome";
import { teamMembers } from "@/lib/team";

export function AboutPage() {
  return (
    <div>
      <SiteHeader />
      <article className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <Link
          to="/#about"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <p className="eyebrow mt-10 text-muted-foreground">About us</p>
        <h1 className="display-2 mt-3 max-w-3xl">
          The people behind a quieter kind of <em className="italic text-sage">company.</em>
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Seen began with a simple belief: the loneliest moments are often the ordinary ones — when
          no one around you has lived what you&apos;re living. We&apos;re a small team building a
          place where one person who understands can meet you there.
        </p>

        <div className="mt-14 grid gap-10 border-t border-border/60 pt-14 md:grid-cols-3">
          {[
            {
              title: "Why we exist",
              body: "Peer support for when professional care isn't enough — or isn't what you need right now. A conversation with someone who's been there.",
            },
            {
              title: "What we believe",
              body: "Being seen matters more than being fixed. You don't need to perform wellness here. You can show up tired, uncertain, or mid-sentence — and still belong.",
            },
            {
              title: "How we show up",
              body: "One match at a time. No feeds, no followers, no ads. Your story is never sold. Safety tools sit quietly in the background so you can focus on the person in front of you.",
            },
          ].map((item) => (
            <div key={item.title}>
              <h2 className="font-serif text-xl text-foreground">{item.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>

        <section className="mt-20 border-t border-border/60 pt-14">
          <p className="eyebrow text-muted-foreground">The team</p>
          <h2 className="display-2 mt-3">Five people. One quiet mission.</h2>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            We&apos;re building Seen together — product, care, and craft side by side.
          </p>
          <div className="mt-12">
            <TeamGrid members={teamMembers} size="lg" />
          </div>
        </section>
      </article>
      <SiteFooter />
    </div>
  );
}
