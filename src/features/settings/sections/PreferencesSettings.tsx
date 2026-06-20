import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import {
  SettingsPageIntro,
  SettingsRadioGroup,
} from "@/components/settings/SettingsShell";
import { experienceLabels } from "@/lib/mock";
import { useOnboarding } from "@/stores/onboarding";

export function PreferencesSettings() {
  const { experiences, supportLookingFor } = useOnboarding();
  const [supportStyle, setSupportStyle] = useState(
    supportLookingFor === "heard"
      ? "listen"
      : supportLookingFor === "advice"
        ? "shared"
        : supportLookingFor === "both"
          ? "shared"
          : "listen",
  );

  const focusLabel =
    experiences.length > 0 ? experienceLabels[experiences[0]] : "Grief & Loss";

  const focusHint =
    experiences.length > 0
      ? "Based on your onboarding reflection."
      : "Navigating life after losing someone.";

  return (
    <>
      <SettingsPageIntro
        title="Emotional Preferences"
        description="Update what you're going through to get better matches."
      />

      <div className="space-y-5">
        <div className="surface-card p-8">
          <p className="text-[15px] font-semibold text-foreground">Current Focus</p>
          <Link
            to="/onboarding/experience"
            className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-surface-muted px-5 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:bg-card hover:shadow-[var(--shadow-soft)]"
          >
            <div>
              <p className="text-[14px] font-medium text-foreground">{focusLabel}</p>
              <p className="mt-0.5 text-[13px] text-muted-foreground">{focusHint}</p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
          </Link>
        </div>

        <div className="surface-card p-8">
          <p className="text-[15px] font-semibold text-foreground">Support Style</p>
          <div className="mt-5">
            <SettingsRadioGroup
              value={supportStyle}
              onChange={setSupportStyle}
              options={[
                {
                  value: "listen",
                  label: "Someone to just listen",
                  hint: "No advice, just a safe space to vent.",
                },
                {
                  value: "shared",
                  label: "Shared experiences",
                  hint: "Connecting over similar stories.",
                },
              ]}
            />
          </div>
        </div>
      </div>
    </>
  );
}
