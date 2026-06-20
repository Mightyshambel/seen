import { useState } from "react";
import { PreferenceRow, SettingsPanel, Toggle } from "@/components/settings/SettingsPanel";

export function AccessibilitySettings() {
  const [prefs, setPrefs] = useState({
    reduceMotion: false,
    largeText: false,
    highContrast: false,
  });

  const update =
    <K extends keyof typeof prefs>(key: K) =>
    (value: boolean) => {
      setPrefs((prev) => ({ ...prev, [key]: value }));
    };

  return (
    <SettingsPanel
      title="Accessibility"
      description="Adjust Seen to meet you. We follow your system settings by default."
    >
      <PreferenceRow
        label="Reduce motion"
        hint="Replaces transitions with quiet cross-fades."
        action={
          <Toggle
            checked={prefs.reduceMotion}
            onChange={update("reduceMotion")}
            label="Reduce motion"
          />
        }
      />
      <PreferenceRow
        label="Larger text"
        hint="Increases body text size for easier reading."
        action={
          <Toggle checked={prefs.largeText} onChange={update("largeText")} label="Larger text" />
        }
      />
      <PreferenceRow
        label="Higher contrast"
        hint="Stronger separation between text and background."
        action={
          <Toggle
            checked={prefs.highContrast}
            onChange={update("highContrast")}
            label="Higher contrast"
          />
        }
      />
    </SettingsPanel>
  );
}
