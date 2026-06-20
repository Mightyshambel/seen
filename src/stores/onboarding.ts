import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ExperienceTag } from "@/lib/mock";

export type JourneyDuration =
  | "just-beginning"
  | "1-3-months"
  | "3-6-months"
  | "6-12-months"
  | "1-plus-year";

export type SupportLookingFor = "heard" | "advice" | "both";
export type GenderPreference = "none" | "same" | "women" | "men";

interface OnboardingState {
  experiences: ExperienceTag[];
  journeyDuration: JourneyDuration | null;
  supportLookingFor: SupportLookingFor | null;
  journeyNotes: string;
  languages: string[];
  pronouns: string;
  location: string;
  genderPreference: GenderPreference | null;
  acknowledgedSafety: boolean;
  acknowledgedModeration: boolean;
  acknowledgedAge18: boolean;
  setExperiences: (v: ExperienceTag[]) => void;
  toggleExperience: (tag: ExperienceTag) => void;
  setJourneyDuration: (v: JourneyDuration) => void;
  setSupportLookingFor: (v: SupportLookingFor) => void;
  setJourneyNotes: (v: string) => void;
  setLanguages: (v: string[]) => void;
  setPronouns: (v: string) => void;
  setLocation: (v: string) => void;
  setGenderPreference: (v: GenderPreference) => void;
  acknowledgeSafety: () => void;
  setAcknowledgedModeration: (v: boolean) => void;
  setAcknowledgedAge18: (v: boolean) => void;
  reset: () => void;
}

export const useOnboarding = create<OnboardingState>()(
  persist(
    (set) => ({
      experiences: [],
      journeyDuration: null,
      supportLookingFor: null,
      journeyNotes: "",
      languages: ["en"],
      pronouns: "",
      location: "",
      genderPreference: "none",
      acknowledgedSafety: false,
      acknowledgedModeration: false,
      acknowledgedAge18: false,
      setExperiences: (v) => set({ experiences: v }),
      toggleExperience: (tag) =>
        set((s) => ({
          experiences: s.experiences.includes(tag)
            ? s.experiences.filter((x) => x !== tag)
            : [...s.experiences, tag],
        })),
      setJourneyDuration: (v) => set({ journeyDuration: v }),
      setSupportLookingFor: (v) => set({ supportLookingFor: v }),
      setJourneyNotes: (v) => set({ journeyNotes: v }),
      setLanguages: (v) => set({ languages: v }),
      setPronouns: (v) => set({ pronouns: v }),
      setLocation: (v) => set({ location: v }),
      setGenderPreference: (v) => set({ genderPreference: v }),
      acknowledgeSafety: () => set((s) => ({ acknowledgedSafety: !s.acknowledgedSafety })),
      setAcknowledgedModeration: (v) => set({ acknowledgedModeration: v }),
      setAcknowledgedAge18: (v) => set({ acknowledgedAge18: v }),
      reset: () =>
        set({
          experiences: [],
          journeyDuration: null,
          supportLookingFor: null,
          journeyNotes: "",
          languages: ["en"],
          pronouns: "",
          location: "",
          genderPreference: "none",
          acknowledgedSafety: false,
          acknowledgedModeration: false,
          acknowledgedAge18: false,
        }),
    }),
    {
      name: "seen-onboarding",
      skipHydration: true,
    },
  ),
);

export const onboardingSteps = [
  { path: "/onboarding/welcome", label: "Welcome" },
  { path: "/onboarding/experience", label: "Experience" },
  { path: "/onboarding/journey", label: "Journey" },
  { path: "/onboarding/preferences", label: "Preferences" },
  { path: "/onboarding/safety", label: "Safety" },
] as const;
