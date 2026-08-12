import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/auth";

export function RequireAuth({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export function RequireOnboardingComplete({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.onboardingComplete) {
    return <Navigate to="/onboarding/welcome" replace />;
  }

  return children;
}

export function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);

  if (user) {
    return <Navigate to={user.onboardingComplete ? "/chat" : "/onboarding/welcome"} replace />;
  }

  return children;
}
