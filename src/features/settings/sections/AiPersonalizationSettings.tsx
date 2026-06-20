import { useState } from "react";
import { SettingsPageIntro, SettingsToggleRow } from "@/components/settings/SettingsShell";

export function AiPersonalizationSettings() {
  const [prompts, setPrompts] = useState(true);
  const [checkIns, setCheckIns] = useState(true);

  return (
    <>
      <SettingsPageIntro
        title="AI Personalization"
        description="Control how our AI assists you in conversations and matching."
      />

      <div className="surface-card p-6">
        <div className="space-y-5">
          <SettingsToggleRow
            label="AI Conversation Prompts"
            hint="Suggest gentle ways to reply when you're not sure what to say."
            checked={prompts}
            onChange={setPrompts}
          />
          <div className="border-t border-border/60 pt-5">
            <SettingsToggleRow
              label="Emotional Check-ins"
              hint="Occasional gentle check-ins from our AI to see how you're coping."
              checked={checkIns}
              onChange={setCheckIns}
            />
          </div>
        </div>
      </div>
    </>
  );
}
