import { getOnboarding, getSettings } from "@/lib/api/users";
import type { User } from "@/lib/api/types";
import { applyOnboardingToStore, resetOnboardingStore } from "@/lib/onboarding-sync";
import { applySettingsToStore } from "@/lib/settings-sync";
import { connectWs } from "@/lib/ws-client";
import { queryClient } from "@/app/providers";
import { queryKeys } from "@/hooks/useApiQueries";
import { useAuthStore } from "@/stores/auth";
import { useSettings } from "@/stores/settings";

const LOCAL_USER_KEYS = ["seen-onboarding", "seen-settings", "seen-chats"] as const;

/** Wipe persisted client state so the next account starts clean. */
export function clearLocalUserData() {
  resetOnboardingStore();
  useSettings.getState().resetAll();
  void useSettings.persist?.clearStorage();

  for (const key of LOCAL_USER_KEYS) {
    localStorage.removeItem(key);
  }
}

export async function completeAuthSession(user: User) {
  useAuthStore.getState().setUser(user);
  queryClient.setQueryData(queryKeys.me, user);

  try {
    const [settings, onboarding] = await Promise.all([getSettings(), getOnboarding()]);
    applySettingsToStore(settings);
    applyOnboardingToStore(onboarding);
    queryClient.setQueryData(queryKeys.settings, settings);
  } catch {
    // settings/onboarding optional on first signup before server rows exist
  }

  connectWs();
}

export async function hydrateSessionFromApi() {
  const [settings, onboarding] = await Promise.all([getSettings(), getOnboarding()]);
  applySettingsToStore(settings);
  applyOnboardingToStore(onboarding);
  queryClient.setQueryData(queryKeys.settings, settings);
}
