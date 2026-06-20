import { lazy, Suspense, type ReactNode } from "react";
import { createBrowserRouter, Link, Navigate } from "react-router-dom";
import { AppShell } from "@/app/AppShell";
import { PageLoader } from "@/components/common/PageLoader";

const LandingPage = lazy(() =>
  import("@/features/landing/LandingPage").then((m) => ({ default: m.LandingPage })),
);
const LoginPage = lazy(() =>
  import("@/features/auth/LoginPage").then((m) => ({ default: m.LoginPage })),
);
const SignupPage = lazy(() =>
  import("@/features/auth/SignupPage").then((m) => ({ default: m.SignupPage })),
);
const ResetPasswordPage = lazy(() =>
  import("@/features/auth/ResetPasswordPage").then((m) => ({ default: m.ResetPasswordPage })),
);
const OnboardingLayout = lazy(() =>
  import("@/features/onboarding/OnboardingLayout").then((m) => ({ default: m.OnboardingLayout })),
);
const OnboardingWelcomePage = lazy(() =>
  import("@/features/onboarding/OnboardingWelcomePage").then((m) => ({
    default: m.OnboardingWelcomePage,
  })),
);
const OnboardingExperiencePage = lazy(() =>
  import("@/features/onboarding/OnboardingExperiencePage").then((m) => ({
    default: m.OnboardingExperiencePage,
  })),
);
const OnboardingJourneyPage = lazy(() =>
  import("@/features/onboarding/OnboardingJourneyPage").then((m) => ({
    default: m.OnboardingJourneyPage,
  })),
);
const OnboardingPreferencesPage = lazy(() =>
  import("@/features/onboarding/OnboardingPreferencesPage").then((m) => ({
    default: m.OnboardingPreferencesPage,
  })),
);
const OnboardingSafetyPage = lazy(() =>
  import("@/features/onboarding/OnboardingSafetyPage").then((m) => ({
    default: m.OnboardingSafetyPage,
  })),
);
const MatchingPage = lazy(() =>
  import("@/features/matching/MatchingPage").then((m) => ({ default: m.MatchingPage })),
);
const MatchDetailPage = lazy(() =>
  import("@/features/matching/MatchDetailPage").then((m) => ({ default: m.MatchDetailPage })),
);
const ChatPage = lazy(() =>
  import("@/features/chat/ChatPage").then((m) => ({ default: m.ChatPage })),
);
const SettingsLayout = lazy(() =>
  import("@/features/settings/SettingsLayout").then((m) => ({ default: m.SettingsLayout })),
);
const PrivacySettings = lazy(() =>
  import("@/features/settings/sections/PrivacySettings").then((m) => ({
    default: m.PrivacySettings,
  })),
);
const PreferencesSettings = lazy(() =>
  import("@/features/settings/sections/PreferencesSettings").then((m) => ({
    default: m.PreferencesSettings,
  })),
);
const AiPersonalizationSettings = lazy(() =>
  import("@/features/settings/sections/AiPersonalizationSettings").then((m) => ({
    default: m.AiPersonalizationSettings,
  })),
);
const AccountSettings = lazy(() =>
  import("@/features/settings/sections/AccountSettings").then((m) => ({
    default: m.AccountSettings,
  })),
);
const NotificationsSettings = lazy(() =>
  import("@/features/settings/sections/NotificationsSettings").then((m) => ({
    default: m.NotificationsSettings,
  })),
);
const AccessibilitySettings = lazy(() =>
  import("@/features/settings/sections/AccessibilitySettings").then((m) => ({
    default: m.AccessibilitySettings,
  })),
);
const SupportHistorySettings = lazy(() =>
  import("@/features/settings/sections/SupportHistorySettings").then((m) => ({
    default: m.SupportHistorySettings,
  })),
);
const SupportPage = lazy(() =>
  import("@/features/support/SupportPage").then((m) => ({ default: m.SupportPage })),
);
const PrivacyPage = lazy(() =>
  import("@/features/static/PrivacyPage").then((m) => ({ default: m.PrivacyPage })),
);
const TermsPage = lazy(() =>
  import("@/features/static/TermsPage").then((m) => ({ default: m.TermsPage })),
);
const CookiesPage = lazy(() =>
  import("@/features/static/CookiesPage").then((m) => ({ default: m.CookiesPage })),
);
const NotFoundPage = lazy(() =>
  import("@/features/static/NotFoundPage").then((m) => ({ default: m.NotFoundPage })),
);

function withSuspense(element: ReactNode) {
  return <Suspense fallback={<PageLoader />}>{element}</Suspense>;
}

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: "/", element: withSuspense(<LandingPage />) },
      { path: "/login", element: withSuspense(<LoginPage />) },
      { path: "/signup", element: withSuspense(<SignupPage />) },
      { path: "/reset-password", element: withSuspense(<ResetPasswordPage />) },
      {
        path: "/onboarding",
        element: withSuspense(<OnboardingLayout />),
        children: [
          { index: true, element: <Navigate to="welcome" replace /> },
          { path: "welcome", element: withSuspense(<OnboardingWelcomePage />) },
          { path: "experience", element: withSuspense(<OnboardingExperiencePage />) },
          { path: "journey", element: withSuspense(<OnboardingJourneyPage />) },
          { path: "preferences", element: withSuspense(<OnboardingPreferencesPage />) },
          { path: "safety", element: withSuspense(<OnboardingSafetyPage />) },
        ],
      },
      { path: "/matching", element: withSuspense(<MatchingPage />) },
      { path: "/match/:id", element: withSuspense(<MatchDetailPage />) },
      { path: "/chat", element: withSuspense(<ChatPage />) },
      { path: "/chat/:id", element: withSuspense(<ChatPage />) },
      {
        path: "/settings",
        element: withSuspense(<SettingsLayout />),
        children: [
          { index: true, element: <Navigate to="privacy" replace /> },
          { path: "privacy", element: withSuspense(<PrivacySettings />) },
          { path: "preferences", element: withSuspense(<PreferencesSettings />) },
          { path: "ai-personalization", element: withSuspense(<AiPersonalizationSettings />) },
          { path: "account", element: withSuspense(<AccountSettings />) },
          { path: "notifications", element: withSuspense(<NotificationsSettings />) },
          { path: "accessibility", element: withSuspense(<AccessibilitySettings />) },
          { path: "support-history", element: withSuspense(<SupportHistorySettings />) },
          { path: "trust-safety", element: <Navigate to="/settings/privacy" replace /> },
        ],
      },
      { path: "/support", element: withSuspense(<SupportPage />) },
      { path: "/privacy", element: withSuspense(<PrivacyPage />) },
      { path: "/terms", element: withSuspense(<TermsPage />) },
      { path: "/cookies", element: withSuspense(<CookiesPage />) },
      {
        path: "*",
        element: withSuspense(<NotFoundPage />),
        errorElement: (
          <div className="flex min-h-dvh items-center justify-center bg-background px-6">
            <div className="max-w-md text-center">
              <p className="eyebrow text-muted-foreground">Something interrupted us</p>
              <h1 className="display-3 mt-3 text-foreground">This page didn&apos;t load.</h1>
              <Link to="/" className="btn-primary mt-8">
                Go home
              </Link>
            </div>
          </div>
        ),
      },
    ],
  },
]);
