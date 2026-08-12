import { toast } from "sonner";
import { Accessibility } from "lucide-react";
import {
  SettingsCard,
  SettingsPageIntro,
  SettingsToggleRow,
} from "@/components/settings/SettingsShell";
import { ApiError } from "@/lib/api-client";
import { syncSettingsPatch } from "@/lib/settings-sync";
import { useSettings } from "@/stores/settings";

export function AccessibilitySettings() {
  const reduceMotion = useSettings((s) => s.reduceMotion);
  const largeText = useSettings((s) => s.largeText);
  const highContrast = useSettings((s) => s.highContrast);
  const setReduceMotion = useSettings((s) => s.setReduceMotion);
  const setLargeText = useSettings((s) => s.setLargeText);
  const setHighContrast = useSettings((s) => s.setHighContrast);

  const persist = async (
    patch: Parameters<typeof syncSettingsPatch>[0],
    rollback: () => void,
  ) => {
    try {
      await syncSettingsPatch(patch);
    } catch (error) {
      rollback();
      toast.error(
        error instanceof ApiError ? error.message : "Couldn't save that setting. Try again.",
      );
    }
  };

  return (
    <>
      <SettingsPageIntro
        title="Accessibility"
        description="Motion and contrast follow your system preferences. Larger text is chosen here — use the toggles to go further."
      />
      <SettingsCard
        icon={<Accessibility className="h-5 w-5" />}
        title="Display & motion"
        description="Make reading and movement feel calmer."
      >
        <div className="space-y-6">
          <SettingsToggleRow
            label="Reduce motion"
            hint="Already calms motion when your system asks; turn on to always prefer quiet transitions."
            checked={reduceMotion}
            onChange={(value) => {
              setReduceMotion(value);
              void persist({ reduceMotion: value }, () => setReduceMotion(!value));
            }}
          />
          <SettingsToggleRow
            label="Larger text"
            hint="Increases body text size for easier reading."
            checked={largeText}
            onChange={(value) => {
              setLargeText(value);
              void persist({ largeText: value }, () => setLargeText(!value));
            }}
          />
          <SettingsToggleRow
            label="Higher contrast"
            hint="Already strengthens contrast when your system asks; turn on for stronger separation anytime."
            checked={highContrast}
            onChange={(value) => {
              setHighContrast(value);
              void persist({ highContrast: value }, () => setHighContrast(!value));
            }}
          />
        </div>
      </SettingsCard>
    </>
  );
}
