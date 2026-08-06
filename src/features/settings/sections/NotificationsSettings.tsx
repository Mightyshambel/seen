import { toast } from "sonner";
import { Bell } from "lucide-react";
import {
  SettingsCard,
  SettingsPageIntro,
  SettingsToggleRow,
} from "@/components/settings/SettingsShell";
import { ApiError } from "@/lib/api-client";
import { ensureNotificationPermission } from "@/lib/message-notifications";
import { syncSettingsPatch } from "@/lib/settings-sync";
import { useSettings } from "@/stores/settings";

export function NotificationsSettings() {
  const notifyNewMessage = useSettings((s) => s.notifyNewMessage);
  const notifyGentleNudges = useSettings((s) => s.notifyGentleNudges);
  const notifyWeeklyReflection = useSettings((s) => s.notifyWeeklyReflection);
  const accountEmail = useSettings((s) => s.accountEmail);
  const setNotifyNewMessage = useSettings((s) => s.setNotifyNewMessage);
  const setNotifyGentleNudges = useSettings((s) => s.setNotifyGentleNudges);
  const setNotifyWeeklyReflection = useSettings((s) => s.setNotifyWeeklyReflection);

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
        title="Notifications"
        description="Quiet by default. Pick what you'd like us to gently surface."
      />
      <SettingsCard
        icon={<Bell className="h-5 w-5" />}
        title="Alerts"
        description="Choose which moments deserve a soft tap."
      >
        <div className="space-y-6">
          <SettingsToggleRow
            label="New messages"
            hint="In-app tap when a match writes — browser alert if this tab is in the background."
            checked={notifyNewMessage}
            onChange={(value) => {
              setNotifyNewMessage(value);
              void (async () => {
                if (value) {
                  await ensureNotificationPermission();
                }
                await persist({ notifyNewMessage: value }, () => setNotifyNewMessage(!value));
              })();
            }}
          />
          <SettingsToggleRow
            label="Gentle nudges"
            hint="If a match’s message suggests things feel heavy, offer a soft pause reminder."
            checked={notifyGentleNudges}
            onChange={(value) => {
              setNotifyGentleNudges(value);
              void persist({ notifyGentleNudges: value }, () => setNotifyGentleNudges(!value));
            }}
          />
          <SettingsToggleRow
            label="Weekly reflection"
            hint={
              accountEmail
                ? `A quiet Sunday email to ${accountEmail} with one gentle question.`
                : "A quiet Sunday email with one gentle question."
            }
            checked={notifyWeeklyReflection}
            onChange={(value) => {
              setNotifyWeeklyReflection(value);
              void persist({ notifyWeeklyReflection: value }, () =>
                setNotifyWeeklyReflection(!value),
              );
            }}
          />
        </div>
      </SettingsCard>
    </>
  );
}
