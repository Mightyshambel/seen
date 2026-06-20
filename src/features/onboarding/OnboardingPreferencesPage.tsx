import { LanguageGrid, PillGroup, SectionLabel } from "@/components/onboarding/OnboardingFields";
import { OnboardingStep } from "@/components/onboarding/OnboardingStep";
import type { GenderPreference } from "@/stores/onboarding";
import { useOnboarding } from "@/stores/onboarding";

const languages = [
  { value: "en", label: "English", flag: "🇬🇧" },
  { value: "it", label: "Italiano", flag: "🇮🇹" },
  { value: "fr", label: "Français", flag: "🇫🇷" },
  { value: "de", label: "Deutsch", flag: "🇩🇪" },
  { value: "es", label: "Español", flag: "🇪🇸" },
  { value: "pt", label: "Português", flag: "🇧🇷" },
  { value: "ar", label: "العربية", flag: "🇸🇦" },
  { value: "zh", label: "中文", flag: "🇨🇳" },
  { value: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { value: "ja", label: "日本語", flag: "🇯🇵" },
];

const genderOptions: { value: GenderPreference; label: string }[] = [
  { value: "none", label: "No preference" },
  { value: "same", label: "Same gender" },
  { value: "women", label: "Women only" },
  { value: "men", label: "Men only" },
];

export function OnboardingPreferencesPage() {
  const {
    languages: selectedLanguages,
    genderPreference,
    setLanguages,
    setGenderPreference,
  } = useOnboarding();

  return (
    <OnboardingStep
      eyebrow="Your preferences"
      title="Your preferences"
      subtitle="Help us find the right match for how you communicate and connect."
      next="/onboarding/safety"
      canContinue={selectedLanguages.length > 0}
    >
      <div className="space-y-8">
        <section className="space-y-3">
          <SectionLabel>Preferred language for conversations</SectionLabel>
          <p className="text-sm text-muted-foreground">(select all you speak)</p>
          <LanguageGrid options={languages} value={selectedLanguages} onChange={setLanguages} />
        </section>

        <section className="space-y-3">
          <SectionLabel optional>Peer gender preference</SectionLabel>
          <PillGroup
            options={genderOptions}
            value={genderPreference ?? "none"}
            onChange={setGenderPreference}
          />
        </section>
      </div>
    </OnboardingStep>
  );
}
