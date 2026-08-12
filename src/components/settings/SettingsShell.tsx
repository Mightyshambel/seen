import { Link, useNavigate } from "react-router-dom";
import { SeenLogo } from "@/components/brand/SeenLogo";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/api/auth";
import { clearLocalUserData } from "@/lib/session";
import { disconnectWs } from "@/lib/ws-client";
import { queryClient } from "@/app/providers";
import { useAuthStore } from "@/stores/auth";
import {
  Accessibility,
  Bell,
  ChevronRight,
  Clock,
  Heart,
  Info,
  LogOut,
  Shield,
  Sparkles,
  User,
} from "lucide-react";

export const settingsNav = [
  { to: "/settings/privacy", label: "Safety & Privacy", icon: Shield },
  { to: "/settings/preferences", label: "Emotional Preferences", icon: Heart },
  { to: "/settings/ai-personalization", label: "AI Personalization", icon: Sparkles },
  { to: "/settings/account", label: "Account", icon: User },
  { to: "/settings/notifications", label: "Notifications", icon: Bell },
  { to: "/settings/accessibility", label: "Accessibility", icon: Accessibility },
  { to: "/settings/support-history", label: "Support History", icon: Clock },
] as const;

export function SettingsShell({
  children,
  activePath,
}: {
  children: React.ReactNode;
  activePath: string;
}) {
  return (
    <div className="app-shell min-h-dvh">
      <SettingsTopHeader />

      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-12 lg:grid-cols-[272px_1fr] lg:px-8">
        <aside className="lg:sticky lg:top-[5.5rem] lg:self-start">
          <h1 className="font-serif text-[2.625rem] leading-none tracking-tight text-foreground">
            Settings
          </h1>

          <nav aria-label="Settings sections" className="mt-10 space-y-2">
            {settingsNav.map((item) => {
              const active = activePath === item.to;
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3.5 text-[15px] font-medium transition-all duration-300",
                    active ? "settings-nav-active" : "settings-nav-idle",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-[18px] w-[18px]",
                      active ? "text-sage" : "text-muted-foreground",
                    )}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="surface-inset mt-10 p-6">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-sage" />
              <div>
                <p className="text-[14px] font-semibold text-foreground">Need immediate help?</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                  If you&apos;re in crisis or having thoughts of self-harm, please reach out to
                  professional support.
                </p>
                <Link to="/support" className="btn-secondary mt-5 px-4 py-2 text-[13px]">
                  View Crisis Resources
                </Link>
              </div>
            </div>
          </div>
        </aside>

        <section className="min-w-0">{children}</section>
      </div>
    </div>
  );
}

function SettingsTopHeader() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s) => s.clear);

  const handleSignOut = async () => {
    await logout();
    disconnectWs();
    queryClient.clear();
    clearLocalUserData();
    clearAuth();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-surface-muted/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between px-6 lg:px-8">
        <Link to="/chat" className="group inline-flex" aria-label="Back to chat">
          <SeenLogo className="h-12 transition-transform duration-300 group-hover:scale-105 sm:h-14" />
        </Link>

        <div className="flex items-center gap-3">
          <Link to="/matching" className="nav-link hidden text-sm sm:inline">
            Matching
          </Link>
          <Link to="/chat" className="nav-link hidden text-sm sm:inline">
            Chat
          </Link>
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="btn-secondary inline-flex min-h-11 items-center gap-2 px-4 text-sm"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}

export function SettingsPageIntro({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-10">
      <h2 className="font-serif text-[2.125rem] leading-tight tracking-tight text-foreground">
        {title}
      </h2>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

export function SettingsCard({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="surface-card p-8">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-muted-foreground">{icon}</span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[16px] font-semibold text-foreground">{title}</h3>
          <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </div>
      {children ? <div className="mt-6 border-t border-border/60 pt-6">{children}</div> : null}
    </div>
  );
}

export function SettingsToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-[14px] font-medium text-foreground">{label}</p>
        <p className="mt-0.5 text-[13px] text-muted-foreground">{hint}</p>
      </div>
      <SettingsToggle checked={checked} onChange={onChange} label={label} />
    </div>
  );
}

export function SettingsToggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-7 w-12 shrink-0 rounded-full transition-all duration-300",
        checked ? "bg-sage shadow-[var(--shadow-glow-sage)]" : "bg-muted",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-6 w-6 rounded-full bg-card shadow-[var(--shadow-soft)] transition-all duration-300",
          checked ? "left-[22px]" : "left-0.5",
        )}
      />
    </button>
  );
}

export function SettingsLinkRow({
  label,
  value,
  href,
  danger,
  onClick,
}: {
  label: string;
  value?: string;
  href?: string;
  danger?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <>
      <div>
        <p className={cn("text-[14px] font-medium", danger ? "text-destructive" : "text-foreground")}>
          {label}
        </p>
        {value ? <p className="mt-0.5 text-[13px] text-muted-foreground">{value}</p> : null}
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
    </>
  );

  const className =
    "surface-card flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]";

  if (href) {
    return (
      <Link to={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={className} onClick={onClick}>
      {content}
    </button>
  );
}

export function SettingsRadioGroup({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string; hint: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-4">
      {options.map((option) => {
        const active = value === option.value;
        return (
          <label key={option.value} className="flex cursor-pointer items-start gap-3">
            <span
              className={cn(
                "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-colors duration-300",
                active ? "border-sage" : "border-border",
              )}
            >
              {active ? <span className="h-2.5 w-2.5 rounded-full bg-sage" /> : null}
            </span>
            <span className="min-w-0">
              <span className="block text-[14px] font-medium text-foreground">{option.label}</span>
              <span className="mt-0.5 block text-[13px] text-muted-foreground">{option.hint}</span>
            </span>
            <input
              type="radio"
              name="settings-radio"
              value={option.value}
              checked={active}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
          </label>
        );
      })}
    </div>
  );
}
