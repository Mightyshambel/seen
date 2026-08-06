import { patchSettings } from "@/lib/api/users";
import type { UserSettings } from "@/lib/api/types";
import { useSettings } from "@/stores/settings";

export function applySettingsToStore(settings: UserSettings) {
  useSettings.setState({
    hideProfile: settings.hideProfile,
    strictModeration: settings.strictModeration,
    aiCheckIns: settings.aiCheckIns,
    notifyNewMessage: settings.notifyNewMessage,
    notifyGentleNudges: settings.notifyGentleNudges,
    notifyWeeklyReflection: settings.notifyWeeklyReflection,
    reduceMotion: settings.reduceMotion,
    largeText: settings.largeText,
    highContrast: settings.highContrast,
    savedConversationIds: settings.savedConversationIds,
    accountEmail: settings.accountEmail,
  });
}

export async function syncSettingsPatch(body: Partial<UserSettings>) {
  const updated = await patchSettings(body);
  applySettingsToStore(updated);
  return updated;
}
