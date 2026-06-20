import { SiteFooter, SiteHeader } from "@/components/layout/SiteChrome";
import { LegalSection } from "@/features/static/LegalSection";

export function PrivacyPage() {
  return (
    <div>
      <SiteHeader />
      <article className="mx-auto max-w-3xl px-6 py-20">
        <p className="eyebrow text-muted-foreground">Privacy</p>
        <h1 className="display-2 mt-3">A quiet promise about your data.</h1>
        <div className="prose prose-neutral mt-10 max-w-none text-foreground/90">
          <p className="text-lg leading-relaxed text-muted-foreground">
            Seen is built on a simple rule: what you share here belongs to you. We don&apos;t sell
            it, advertise against it, or share it outside of our trained safety team.
          </p>
          <LegalSection title="What we collect">
            <p>
              Your chosen display name, pronouns, the experiences you opt to share during onboarding,
              and the messages you send in conversations. We also store basic account metadata such
              as your email (for sign-in) and preference settings.
            </p>
          </LegalSection>
          <LegalSection title="How we use it">
            <p>
              To match you with a peer, deliver messages, keep your account secure, and operate our
              safety systems. We use aggregated, anonymized signals to improve matching quality —
              never to profile you for advertising.
            </p>
          </LegalSection>
          <LegalSection title="Who we share with">
            <p>
              Nobody outside Seen. We do not sell, rent, or trade your data. Message content is not
              shared with third parties for marketing, model training, or analytics. Our safety team
              may review reports you submit or metadata signals when someone may be at risk.
            </p>
          </LegalSection>
          <LegalSection title="Encryption">
            <p>
              Conversations are end-to-end encrypted. Only you and your match can read them. Our
              safety systems work on metadata signals and explicit reports, not the content of your
              messages.
            </p>
          </LegalSection>
          <LegalSection title="Your rights">
            <p>
              You can pause, archive, or permanently delete any conversation. You can export your
              data from Settings. Deleting your account removes your personal data within 30 days,
              except where retention is legally required.
            </p>
          </LegalSection>
          <LegalSection title="Contact">
            <p>
              Questions about privacy? Reach us at{" "}
              <a href="mailto:privacy@seen.app" className="link-muted">
                privacy@seen.app
              </a>
              . We respond within a few business days.
            </p>
          </LegalSection>
        </div>
      </article>
      <SiteFooter />
    </div>
  );
}
