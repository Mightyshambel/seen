import { toast } from "sonner";
import { SettingsPageIntro, SettingsToggleRow } from "@/components/settings/SettingsShell";
import { ApiError } from "@/lib/api-client";
import { syncSettingsPatch } from "@/lib/settings-sync";
import { useSettings } from "@/stores/settings";

export function AiPersonalizationSettings() {
  const aiCheckIns = useSettings((s) => s.aiCheckIns);
  const setAiCheckIns = useSettings((s) => s.setAiCheckIns);

  const persist = async (value: boolean, rollback: () => void) => {
    try {
      await syncSettingsPatch({ aiCheckIns: value });
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
        title="AI Personalization"
        description="Optional gentle check-ins in quieter chats — not a chatbot, and this doesn’t change who you’re matched with."
      />

      <div className="surface-card p-6">
        <SettingsToggleRow
          label="Emotional check-ins"
          hint="When you reopen a quieter chat, occasionally leave a soft check-in note."
          checked={aiCheckIns}
          onChange={(value) => {
            setAiCheckIns(value);
            void persist(value, () => setAiCheckIns(!value));
          }}
        />
      </div>
    </>
  );
}
