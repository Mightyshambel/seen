import type { User } from "@/lib/api/types";

export function routeAfterAuth(user: User) {
  if (!user.onboardingComplete) {
    return "/onboarding/welcome";
  }
  return "/chat";
}
