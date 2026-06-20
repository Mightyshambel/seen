import { useState } from "react";
import { EyeOff, ShieldCheck } from "lucide-react";
import {
  SettingsCard,
  SettingsPageIntro,
  SettingsToggleRow,
} from "@/components/settings/SettingsShell";

export function PrivacySettings() {
  const [hideProfile, setHideProfile] = useState(false);
  const [strictModeration, setStrictModeration] = useState(true);

  return (
    <>
      <SettingsPageIntro
        title="Safety & Privacy"
        description="Manage how your information is protected and who can connect with you."
      />

      <div className="space-y-5">
        <SettingsCard
          icon={<EyeOff className="h-5 w-5" />}
          title="Anonymity & Visibility"
          description="Seen uses pseudonyms by default. Your real name, location, and contact information are never shared with matches unless you explicitly choose to do so in chat."
        >
          <SettingsToggleRow
            label="Hide my profile from new matches"
            hint="Take a break from meeting new people"
            checked={hideProfile}
            onChange={setHideProfile}
          />
        </SettingsCard>

        <SettingsCard
          icon={<ShieldCheck className="h-5 w-5" />}
          title="AI Moderation"
          description="Our AI gently monitors conversations to ensure a safe environment. It looks for signs of crisis, harassment, or inappropriate behavior."
        >
          <SettingsToggleRow
            label="Strict moderation mode"
            hint="Filter out potentially triggering language"
            checked={strictModeration}
            onChange={setStrictModeration}
          />
        </SettingsCard>
      </div>
    </>
  );
}
