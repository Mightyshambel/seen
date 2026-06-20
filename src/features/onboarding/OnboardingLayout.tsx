import { ArrowLeft, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { stepTransition } from "@/lib/motion-presets";
import { onboardingSteps, useOnboarding } from "@/stores/onboarding";

export function OnboardingLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [storeReady, setStoreReady] = useState(false);

  useEffect(() => {
    const persist = useOnboarding.persist;
    if (!persist) {
      setStoreReady(true);
      return;
    }

    if (persist.hasHydrated()) {
      setStoreReady(true);
      return;
    }

    const finishHydration = persist.onFinishHydration(() => {
      setStoreReady(true);
    });

    void persist.rehydrate();

    return finishHydration;
  }, []);

  const pathname = location.pathname;
  const idx = Math.max(0, onboardingSteps.findIndex((s) => s.path === pathname));
  const progress = ((idx + 1) / onboardingSteps.length) * 100;
  const back = idx > 0 ? onboardingSteps[idx - 1].path : "/";

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-2xl items-center gap-3 px-5">
          <button
            type="button"
            aria-label="Go back"
            onClick={() => navigate(back)}
            className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex-1">
            <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-sage"
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ duration: reduce ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] as const }}
              />
            </div>
            <p className="mt-1 text-center text-[11px] uppercase tracking-wider text-muted-foreground">
              Step {idx + 1} of {onboardingSteps.length} · {onboardingSteps[idx]?.label}
            </p>
          </div>
          <Link
            to="/"
            aria-label="Exit"
            className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-2xl px-5 pb-32 pt-10">
        {!storeReady ? (
          <div className="py-16 text-center text-sm text-muted-foreground">Loading your progress…</div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={pathname} {...stepTransition(reduce)}>
              <Outlet />
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
