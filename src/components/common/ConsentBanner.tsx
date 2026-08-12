import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart3, ChevronDown, ShieldCheck, Sparkles } from "lucide-react";

const STORAGE_KEY = "seen-consent-prefs";
const LEGACY_STORAGE_KEY = "seen-cookie-prefs";
const OPEN_EVENT = "seen:open-consent";
const LEGACY_OPEN_EVENT = "seen:open-cookies";

type Consent = {
  necessary: true;
  analytics: boolean;
  personalization: boolean;
  decidedAt: string;
};

type CategoryKey = "necessary" | "analytics" | "personalization";

const CATEGORIES: Array<{
  key: CategoryKey;
  label: string;
  description: string;
  icon: typeof ShieldCheck;
  required?: boolean;
}> = [
  {
    key: "necessary",
    label: "Necessary",
    description:
      "Keep you signed in, remember your session, and protect your account. These can't be turned off — Seen won't work without them.",
    icon: ShieldCheck,
    required: true,
  },
  {
    key: "analytics",
    label: "Analytics",
    description:
      "Privacy-respecting, aggregated usage data so we can understand which moments feel supportive. No ad networks, no cross-site tracking.",
    icon: BarChart3,
  },
  {
    key: "personalization",
    label: "Personalization",
    description:
      "Remember your theme, reduced-motion choice, and accessibility preferences so the experience stays calm across visits.",
    icon: Sparkles,
  },
];

function readStoredConsent(): Consent | null {
  try {
    for (const key of [STORAGE_KEY, LEGACY_STORAGE_KEY]) {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored) as Consent;
        if (key === LEGACY_STORAGE_KEY) {
          localStorage.setItem(STORAGE_KEY, stored);
          localStorage.removeItem(LEGACY_STORAGE_KEY);
        }
        return parsed;
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function openConsentPreferences() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(OPEN_EVENT));
  }
}

/** @deprecated Use openConsentPreferences — kept for callers that still use the old name. */
export const openCookiePreferences = openConsentPreferences;

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [prefs, setPrefs] = useState<{ analytics: boolean; personalization: boolean }>({
    analytics: false,
    personalization: false,
  });

  useEffect(() => {
    const handleOpen = () => {
      const stored = readStoredConsent();
      if (stored) {
        setPrefs({ analytics: stored.analytics, personalization: stored.personalization });
      }
      setExpanded(true);
      setVisible(true);
    };

    window.addEventListener(OPEN_EVENT, handleOpen);
    window.addEventListener(LEGACY_OPEN_EVENT, handleOpen);

    const stored = readStoredConsent();
    if (!stored) {
      const t = setTimeout(() => setVisible(true), 600);
      return () => {
        clearTimeout(t);
        window.removeEventListener(OPEN_EVENT, handleOpen);
        window.removeEventListener(LEGACY_OPEN_EVENT, handleOpen);
      };
    }

    return () => {
      window.removeEventListener(OPEN_EVENT, handleOpen);
      window.removeEventListener(LEGACY_OPEN_EVENT, handleOpen);
    };
  }, []);

  const persist = (consent: Consent) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setVisible(false);
    setExpanded(false);
  };

  const acceptAll = () =>
    persist({
      necessary: true,
      analytics: true,
      personalization: true,
      decidedAt: new Date().toISOString(),
    });

  const necessaryOnly = () =>
    persist({
      necessary: true,
      analytics: false,
      personalization: false,
      decidedAt: new Date().toISOString(),
    });

  const saveChoices = () =>
    persist({
      necessary: true,
      analytics: prefs.analytics,
      personalization: prefs.personalization,
      decidedAt: new Date().toISOString(),
    });

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] flex justify-center px-4 pb-4 sm:pb-6">
      <div className="w-full max-w-xl rounded-2xl border border-border/70 bg-background/95 p-5 shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sage-soft">
            <ShieldCheck className="h-4 w-4 text-sage" strokeWidth={1.6} />
          </span>
          <div className="flex-1">
            <p className="font-serif text-lg leading-snug">A quiet note about cookies.</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Choose what&apos;s right for you. You can change this any time.{" "}
              <Link to="/cookies" className="underline underline-offset-4 hover:text-foreground">
                Learn more
              </Link>
              .
            </p>

            {expanded && (
              <ul id="consent-categories" className="mt-4 space-y-2">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const checked =
                    cat.required ? true : prefs[cat.key as "analytics" | "personalization"];
                  return (
                    <li
                      key={cat.key}
                      className="rounded-xl border border-border/70 bg-card/60 p-3"
                    >
                      <label className="flex items-start gap-3">
                        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-muted">
                          <Icon className="h-3.5 w-3.5 text-foreground/70" strokeWidth={1.7} />
                        </span>
                        <span className="flex-1">
                          <span className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium">{cat.label}</span>
                            <Toggle
                              checked={checked}
                              disabled={!!cat.required}
                              onChange={(v) => setPrefs((p) => ({ ...p, [cat.key]: v }))}
                              label={cat.label}
                            />
                          </span>
                          <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                            {cat.description}
                          </span>
                          {cat.required && (
                            <span className="mt-1 inline-block text-[10px] uppercase tracking-wider text-muted-foreground/80">
                              Always on
                            </span>
                          )}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={acceptAll}
                className="inline-flex min-h-11 items-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition hover:opacity-90"
              >
                Accept all
              </button>
              {!expanded ? (
                <>
                  <button
                    type="button"
                    onClick={necessaryOnly}
                    className="inline-flex min-h-11 items-center rounded-full border border-border bg-card px-5 text-sm font-medium text-foreground/90 transition hover:bg-muted"
                  >
                    Necessary only
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpanded(true)}
                    className="inline-flex min-h-11 items-center gap-1 rounded-full border border-border bg-card px-5 text-sm font-medium text-foreground/90 transition hover:bg-muted"
                  >
                    Customize
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={saveChoices}
                  className="inline-flex min-h-11 items-center rounded-full border border-border bg-card px-5 text-sm font-medium text-foreground/90 transition hover:bg-muted"
                >
                  Save my choices
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center ${
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
      }`}
    >
      <span
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
          checked ? "bg-sage" : "bg-muted"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-background shadow transition ${
            checked ? "translate-x-[22px]" : "translate-x-[4px]"
          }`}
        />
      </span>
    </button>
  );
}
