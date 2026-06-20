import { OnboardingStep } from "@/components/onboarding/OnboardingStep";

export function OnboardingWelcomePage() {
  return (
    <OnboardingStep
      eyebrow="Welcome to Seen"
      title={
        <>
          Let&apos;s take this <em className="italic text-sage">slowly.</em>
        </>
      }
      subtitle="A few quiet questions help us find one person who can meet you where you are. There are no wrong answers, and you can skip anything."
      next="/onboarding/experience"
      nextLabel="Begin"
      affirmation="Whatever brought you here is enough. You don't need to have the right words today."
    >
      <ul className="space-y-3 text-sm text-muted-foreground">
        <li>· Takes about 3 minutes</li>
        <li>· Only your first name and pronouns are shared</li>
        <li>· You can pause and return any time</li>
      </ul>
    </OnboardingStep>
  );
}
