import { useState } from "react";
import { PreferenceRow, SettingsPanel, Toggle } from "@/components/settings/SettingsPanel";

export function NotificationsSettings() {
  const [prefs, setPrefs] = useState({
    newMessage: true,
    gentleNudges: false,
    weeklyReflection: true,
  });

  const update =
    <K extends keyof typeof prefs>(key: K) =>
    (value: boolean) => {
      setPrefs((prev) => ({ ...prev, [key]: value }));
    };

  return (
    <SettingsPanel
      title="Notifications"
      description="Quiet by default. Pick what you'd like us to gently surface."
    >
      <PreferenceRow
        label="New messages"
        hint="A soft tap when your match writes."
        action={
          <Toggle checked={prefs.newMessage} onChange={update("newMessage")} label="New messages" />
        }
      />
      <PreferenceRow
        label="Gentle nudges"
        hint="Suggestions to take a breath or step away if conversations get heavy."
        action={
          <Toggle
            checked={prefs.gentleNudges}
            onChange={update("gentleNudges")}
            label="Gentle nudges"
          />
        }
      />
      <PreferenceRow
        label="Weekly reflection"
        hint="A quiet Sunday email with a single question."
        action={
          <Toggle
            checked={prefs.weeklyReflection}
            onChange={update("weeklyReflection")}
            label="Weekly reflection"
          />
        }
      />
    </SettingsPanel>
  );
}
