import type { OnboardingProfile } from "@/lib/api/types";
import { putOnboarding } from "@/lib/api/users";
import { useOnboarding } from "@/stores/onboarding";

export function applyOnboardingToStore(profile: OnboardingProfile) {
  useOnboarding.setState({
    experiences: profile.experiences,
    journeyDuration: profile.journeyDuration,
    supportLookingFor: profile.supportLookingFor,
    journeyNotes: profile.journeyNotes,
    languages: profile.languages,
    pronouns: profile.pronouns,
    location: profile.location ?? "",
    genderPreference: profile.genderPreference,
    acknowledgedSafety: profile.acknowledgedSafety,
    acknowledgedModeration: profile.acknowledgedModeration,
    acknowledgedAge18: profile.acknowledgedAge18,
  });
}

export function onboardingProfileFromStore(
  patch: Partial<OnboardingProfile> = {},
): OnboardingProfile {
  const state = useOnboarding.getState();
  return {
    experiences: state.experiences,
    journeyDuration: state.journeyDuration,
    supportLookingFor: state.supportLookingFor,
    journeyNotes: state.journeyNotes,
    languages: state.languages,
    pronouns: state.pronouns,
    location: state.location || null,
    genderPreference: state.genderPreference,
    acknowledgedSafety: state.acknowledgedSafety,
    acknowledgedModeration: state.acknowledgedModeration,
    acknowledgedAge18: state.acknowledgedAge18,
    ...patch,
  };
}

export async function syncOnboardingPatch(patch: Partial<OnboardingProfile>) {
  const updated = await putOnboarding(onboardingProfileFromStore(patch));
  applyOnboardingToStore(updated);
  return updated;
}

export function resetOnboardingStore() {
  useOnboarding.getState().reset();
  void useOnboarding.persist?.clearStorage();
}
