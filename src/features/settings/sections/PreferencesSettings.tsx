import { useState } from "react";
import { toast } from "sonner";
import {
  SettingsPageIntro,
  SettingsRadioGroup,
} from "@/components/settings/SettingsShell";
import { Chip } from "@/components/common/Choice";
import { ApiError } from "@/lib/api-client";
import { experienceLabels, type ExperienceTag } from "@/lib/mock";
import { syncOnboardingPatch } from "@/lib/onboarding-sync";
import { useOnboarding, type SupportLookingFor } from "@/stores/onboarding";

const EXPERIENCE_OPTIONS = Object.keys(experienceLabels) as ExperienceTag[];

const SUPPORT_OPTIONS: { value: SupportLookingFor; label: string; hint: string }[] = [
  {
    value: "heard",
    label: "Someone to just listen",
    hint: "No advice, just a safe space to vent.",
  },
  {
    value: "advice",
    label: "Practical advice",
    hint: "Gentle guidance when you're ready for it.",
  },
  {
    value: "both",
    label: "Shared experiences",
    hint: "Connecting over similar stories, with room for both.",
  },
];

export function PreferencesSettings() {
  const experiences = useOnboarding((s) => s.experiences);
  const supportLookingFor = useOnboarding((s) => s.supportLookingFor);
  const setExperiences = useOnboarding((s) => s.setExperiences);
  const setSupportLookingFor = useOnboarding((s) => s.setSupportLookingFor);
  const [busy, setBusy] = useState(false);

  const persist = async (patch: Parameters<typeof syncOnboardingPatch>[0], rollback: () => void) => {
    setBusy(true);
    try {
      await syncOnboardingPatch(patch);
    } catch (error) {
      rollback();
      toast.error(
        error instanceof ApiError ? error.message : "Couldn't save your preferences. Try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  const toggleExperience = (tag: ExperienceTag) => {
    const previous = experiences;
    const next = previous.includes(tag)
      ? previous.filter((item) => item !== tag)
      : [...previous, tag];

    if (next.length === 0) {
      toast.error("Keep at least one focus so we can match you well.");
      return;
    }

    setExperiences(next);
    void persist({ experiences: next }, () => setExperiences(previous));
  };

  const changeSupportStyle = (value: string) => {
    const next = value as SupportLookingFor;
    const previous = supportLookingFor;
    setSupportLookingFor(next);
    void persist({ supportLookingFor: next }, () => {
      if (previous) setSupportLookingFor(previous);
    });
  };

  return (
    <>
      <SettingsPageIntro
        title="Emotional Preferences"
        description="Update what you're going through to get better matches."
      />

      <div className="space-y-5">
        <div className="surface-card p-8">
          <p className="text-[15px] font-semibold text-foreground">Current Focus</p>
          <p className="mt-1.5 text-[13px] text-muted-foreground">
            Choose what still feels true. Changes save automatically.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {EXPERIENCE_OPTIONS.map((tag) => (
              <Chip
                key={tag}
                active={experiences.includes(tag)}
                onClick={() => {
                  if (!busy) toggleExperience(tag);
                }}
              >
                {experienceLabels[tag]}
              </Chip>
            ))}
          </div>
        </div>

        <div className="surface-card p-8">
          <p className="text-[15px] font-semibold text-foreground">Support Style</p>
          <p className="mt-1.5 text-[13px] text-muted-foreground">
            How you’d like to be met in conversation.
          </p>
          <div className="mt-5">
            <SettingsRadioGroup
              value={supportLookingFor ?? "heard"}
              onChange={(value) => {
                if (!busy) changeSupportStyle(value);
              }}
              options={SUPPORT_OPTIONS}
            />
          </div>
        </div>
      </div>
    </>
  );
}
