import { SiteFooter, SiteHeader } from "@/components/layout/SiteChrome";
import { LegalSection } from "@/features/static/LegalSection";

export function TermsPage() {
  return (
    <div>
      <SiteHeader />
      <article className="mx-auto max-w-3xl px-6 py-20">
        <p className="eyebrow text-muted-foreground">Terms & Agreement</p>
        <h1 className="display-2 mt-3">The agreement that keeps Seen kind.</h1>
        <div className="prose prose-neutral mt-10 max-w-none text-foreground/90">
          <p className="text-lg leading-relaxed text-muted-foreground">
            By using Seen you agree to a few simple commitments — to yourself, to your match, and
            to the community we&apos;re building together.
          </p>
          <LegalSection title="Peer support, not therapy">
            <p>
              Seen connects you with peers who have lived experience. It is not a substitute for
              licensed mental healthcare, crisis services, or medical advice. If you are in crisis,
              please use our{" "}
              <a href="/support" className="link-muted">
                crisis resources
              </a>{" "}
              or contact a professional.
            </p>
          </LegalSection>
          <LegalSection title="Community guidelines">
            <p>
              Show up with honesty and care. No harassment, hate, solicitation, self-promotion, or
              sharing another member&apos;s identity or messages outside Seen. Respect boundaries —
              if someone asks to pause or change topic, honor that.
            </p>
          </LegalSection>
          <LegalSection title="Account terms">
            <p>
              You must be 18 or older. You are responsible for keeping your login secure. You own
              what you write; by sending messages you grant Seen a limited license to deliver them
              to your match and operate safety systems on metadata.
            </p>
          </LegalSection>
          <LegalSection title="Moderation">
            <p>
              We use trained human moderators and gentle AI signals to keep conversations safe. We
              may pause accounts, end matches, or remove members who put others at risk. We try to
              be transparent about why, when we can.
            </p>
          </LegalSection>
          <LegalSection title="Termination">
            <p>
              You can leave at any time from Settings. We may suspend or terminate accounts that
              violate these terms. Upon deletion, we remove your data within 30 days except where
              retention is legally required. Material changes to these terms will be communicated
              before they take effect.
            </p>
          </LegalSection>
        </div>
      </article>
      <SiteFooter />
    </div>
  );
}
