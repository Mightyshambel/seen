import {
  BatteryLow,
  CloudRain,
  Compass,
  HandHelping,
  HeartCrack,
  MoonStar,
  ShieldAlert,
  Sprout,
} from "lucide-react";
import { ChoiceTile } from "@/components/common/Choice";
import { OnboardingStep } from "@/components/onboarding/OnboardingStep";
import { experienceLabels, type ExperienceTag } from "@/lib/mock";
import { useOnboarding } from "@/stores/onboarding";

const icons: Record<ExperienceTag, React.ReactNode> = {
  grief: <CloudRain className="h-4 w-4" />,
  "addiction-recovery": <Sprout className="h-4 w-4" />,
  trauma: <ShieldAlert className="h-4 w-4" />,
  burnout: <BatteryLow className="h-4 w-4" />,
  loneliness: <MoonStar className="h-4 w-4" />,
  breakup: <HeartCrack className="h-4 w-4" />,
  caregiving: <HandHelping className="h-4 w-4" />,
  "life-transition": <Compass className="h-4 w-4" />,
};

const descriptions: Record<ExperienceTag, string> = {
  grief: "Loss of someone, something, or a chapter of life.",
  "addiction-recovery": "Any stage. Any substance. Any day count.",
  trauma: "Recent or long-held. We move gently.",
  burnout: "When the well has run dry.",
  loneliness: "When the room feels too quiet.",
  breakup: "The slow becoming after love ends.",
  caregiving: "Holding space for someone who needs you.",
  "life-transition": "Endings, beginnings, in-betweens.",
};

export function OnboardingExperiencePage() {
  const { experiences, toggleExperience } = useOnboarding();

  return (
    <OnboardingStep
      eyebrow="What you're moving through"
      title="What brings you here today?"
      subtitle="Choose anything that resonates. There's no need to label it perfectly."
      next="/onboarding/journey"
      canContinue={experiences.length > 0}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {(Object.keys(experienceLabels) as ExperienceTag[]).map((t) => (
          <ChoiceTile
            key={t}
            title={experienceLabels[t]}
            description={descriptions[t]}
            icon={icons[t]}
            active={experiences.includes(t)}
            onClick={() => toggleExperience(t)}
          />
        ))}
      </div>
    </OnboardingStep>
  );
}
