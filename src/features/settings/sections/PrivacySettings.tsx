import { EyeOff, ShieldCheck } from "lucide-react";
import {
  SettingsCard,
  SettingsPageIntro,
  SettingsToggleRow,
} from "@/components/settings/SettingsShell";
import { syncSettingsPatch } from "@/lib/settings-sync";
import { useSettings } from "@/stores/settings";

export function PrivacySettings() {
  const hideProfile = useSettings((s) => s.hideProfile);
  const strictModeration = useSettings((s) => s.strictModeration);
  const setHideProfile = useSettings((s) => s.setHideProfile);
  const setStrictModeration = useSettings((s) => s.setStrictModeration);

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
            onChange={(value) => {
              setHideProfile(value);
              void syncSettingsPatch({ hideProfile: value });
            }}
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
            onChange={(value) => {
              setStrictModeration(value);
              void syncSettingsPatch({ strictModeration: value });
            }}
          />
        </SettingsCard>
      </div>
    </>
  );
}
