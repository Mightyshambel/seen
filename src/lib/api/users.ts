import { api } from "@/lib/api-client";
import type { OnboardingProfile, User, UserSettings } from "@/lib/api/types";

export async function getMe() {
  const data = await api<{ user: User }>("/users/me");
  return data.user;
}

export async function getOnboarding() {
  return api<OnboardingProfile>("/users/me/onboarding");
}

export async function putOnboarding(body: OnboardingProfile) {
  return api<OnboardingProfile>("/users/me/onboarding", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function getSettings() {
  return api<UserSettings>("/users/me/settings");
}

export async function patchSettings(body: Partial<UserSettings>) {
  return api<UserSettings>("/users/me/settings", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function exportAccount() {
  return api<unknown>("/users/me/export");
}

export async function deleteAccount() {
  return api<void>("/users/me", { method: "DELETE" });
}
