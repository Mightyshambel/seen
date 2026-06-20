import {
  PillGroup,
  PrivacyNotice,
  SectionLabel,
} from "@/components/onboarding/OnboardingFields";
import { OnboardingStep } from "@/components/onboarding/OnboardingStep";
import type { JourneyDuration, SupportLookingFor } from "@/stores/onboarding";
import { useOnboarding } from "@/stores/onboarding";

const durationOptions: { value: JourneyDuration; label: string }[] = [
  { value: "just-beginning", label: "Just beginning" },
  { value: "1-3-months", label: "1–3 months" },
  { value: "3-6-months", label: "3–6 months" },
  { value: "6-12-months", label: "6–12 months" },
  { value: "1-plus-year", label: "1+ year" },
];

const supportOptions: { value: SupportLookingFor; label: string }[] = [
  { value: "heard", label: "Just to be heard" },
  { value: "advice", label: "Practical advice" },
  { value: "both", label: "Both" },
];

export function OnboardingJourneyPage() {
  const {
    journeyDuration,
    supportLookingFor,
    journeyNotes,
    setJourneyDuration,
    setSupportLookingFor,
    setJourneyNotes,
  } = useOnboarding();

  return (
    <OnboardingStep
      eyebrow="Your journey"
      title="Where are you in your journey?"
      subtitle="This helps us match you with someone at a compatible stage — not too early, not too far ahead."
      next="/onboarding/preferences"
      canContinue={!!journeyDuration && !!supportLookingFor}
    >
      <div className="space-y-8">
        <section className="space-y-3">
          <SectionLabel>How long have you been navigating this?</SectionLabel>
          <PillGroup options={durationOptions} value={journeyDuration} onChange={setJourneyDuration} />
        </section>

        <section className="space-y-3">
          <SectionLabel>What kind of support are you looking for?</SectionLabel>
          <PillGroup options={supportOptions} value={supportLookingFor} onChange={setSupportLookingFor} />
        </section>

        <section className="space-y-3">
          <SectionLabel optional>In your own words</SectionLabel>
          <textarea
            value={journeyNotes}
            onChange={(e) => setJourneyNotes(e.target.value)}
            placeholder="Describe what you're going through. The more you share, the better your match will be. This is anonymised before processing."
            rows={5}
            className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm leading-relaxed outline-none transition focus-visible:ring-2 focus-visible:ring-ring/40"
          />
          <PrivacyNotice>
            <span aria-hidden>🔒 </span>
            <strong>Privacy:</strong> Your text is anonymised before NLP processing. No PII is stored. The
            AI Safety Layer monitors for high-risk signals — if detected, a human moderator is notified
            immediately.
          </PrivacyNotice>
        </section>
      </div>
    </OnboardingStep>
  );
}
