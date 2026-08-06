import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SettingsState {
  hideProfile: boolean;
  strictModeration: boolean;
  setHideProfile: (v: boolean) => void;
  setStrictModeration: (v: boolean) => void;

  aiCheckIns: boolean;
  setAiCheckIns: (v: boolean) => void;

  notifyNewMessage: boolean;
  notifyGentleNudges: boolean;
  notifyWeeklyReflection: boolean;
  setNotifyNewMessage: (v: boolean) => void;
  setNotifyGentleNudges: (v: boolean) => void;
  setNotifyWeeklyReflection: (v: boolean) => void;

  reduceMotion: boolean;
  largeText: boolean;
  highContrast: boolean;
  setReduceMotion: (v: boolean) => void;
  setLargeText: (v: boolean) => void;
  setHighContrast: (v: boolean) => void;

  savedConversationIds: string[];
  toggleSavedConversation: (id: string) => void;
  isSaved: (id: string) => boolean;

  accountEmail: string;
  setAccountEmail: (email: string) => void;

  resetAll: () => void;
}

const defaultSettings = {
  hideProfile: false,
  strictModeration: true,
  aiCheckIns: true,
  notifyNewMessage: true,
  notifyGentleNudges: false,
  notifyWeeklyReflection: true,
  reduceMotion: false,
  largeText: false,
  highContrast: false,
  savedConversationIds: [] as string[],
  accountEmail: "hello@example.com",
};

export const useSettings = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...defaultSettings,

      setHideProfile: (v) => set({ hideProfile: v }),
      setStrictModeration: (v) => set({ strictModeration: v }),

      setAiCheckIns: (v) => set({ aiCheckIns: v }),

      setNotifyNewMessage: (v) => set({ notifyNewMessage: v }),
      setNotifyGentleNudges: (v) => set({ notifyGentleNudges: v }),
      setNotifyWeeklyReflection: (v) => set({ notifyWeeklyReflection: v }),

      setReduceMotion: (v) => set({ reduceMotion: v }),
      setLargeText: (v) => set({ largeText: v }),
      setHighContrast: (v) => set({ highContrast: v }),

      toggleSavedConversation: (id) =>
        set((s) => ({
          savedConversationIds: s.savedConversationIds.includes(id)
            ? s.savedConversationIds.filter((savedId) => savedId !== id)
            : [...s.savedConversationIds, id],
        })),

      isSaved: (id) => get().savedConversationIds.includes(id),

      setAccountEmail: (email) => set({ accountEmail: email }),

      resetAll: () => set({ ...defaultSettings }),
    }),
    {
      name: "seen-settings",
      skipHydration: true,
      partialize: (state) => ({
        hideProfile: state.hideProfile,
        strictModeration: state.strictModeration,
        aiCheckIns: state.aiCheckIns,
        notifyNewMessage: state.notifyNewMessage,
        notifyGentleNudges: state.notifyGentleNudges,
        notifyWeeklyReflection: state.notifyWeeklyReflection,
        reduceMotion: state.reduceMotion,
        largeText: state.largeText,
        highContrast: state.highContrast,
        savedConversationIds: state.savedConversationIds,
        accountEmail: state.accountEmail,
      }),
    },
  ),
);

export function applyAccessibilitySettings({
  reduceMotion,
  largeText,
  highContrast,
}: Pick<SettingsState, "reduceMotion" | "largeText" | "highContrast">) {
  const root = document.documentElement;
  root.classList.toggle("seen-reduce-motion", reduceMotion);
  root.classList.toggle("seen-large-text", largeText);
  root.classList.toggle("seen-high-contrast", highContrast);
}
