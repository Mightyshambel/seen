import { SiteFooter, SiteHeader } from "@/components/layout/SiteChrome";
import { LegalSection } from "@/features/static/LegalSection";

export function CookiesPage() {
  return (
    <div>
      <SiteHeader />
      <article className="mx-auto max-w-3xl px-6 py-20">
        <p className="eyebrow text-muted-foreground">Cookies</p>
        <h1 className="display-2 mt-3">A short note on cookies.</h1>
        <div className="prose prose-neutral mt-10 max-w-none text-foreground/90">
          <p className="text-lg leading-relaxed text-muted-foreground">
            By default, Seen uses only necessary cookies — just enough to keep you signed in and the
            app working. Optional analytics and personalization are off until you choose otherwise.
          </p>
          <LegalSection title="Necessary cookies">
            <p>
              Session, authentication, and security cookies. These keep Seen working and cannot be
              turned off. They do not track you across other websites.
            </p>
          </LegalSection>
          <LegalSection title="Optional analytics">
            <p>
              If you opt in, we use privacy-respecting, aggregated analytics to understand which
              moments feel supportive. No ad networks. No cross-site tracking. You can decline or
              withdraw consent anytime via the cookie banner or footer link.
            </p>
          </LegalSection>
          <LegalSection title="Personalization">
            <p>
              Optional cookies that remember your theme, reduced-motion choice, and accessibility
              settings so the experience stays calm across visits.
            </p>
          </LegalSection>
          <LegalSection title="What we never use">
            <p>
              No third-party advertising cookies. No social tracking pixels. No fingerprinting. No
              selling cookie data to data brokers.
            </p>
          </LegalSection>
        </div>
      </article>
      <SiteFooter />
    </div>
  );
}
