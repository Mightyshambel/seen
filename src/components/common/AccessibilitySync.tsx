import { useEffect, useState } from "react";
import { applyAccessibilitySettings, useSettings } from "@/stores/settings";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function prefersMoreContrast() {
  return window.matchMedia("(prefers-contrast: more)").matches;
}

export function AccessibilitySync() {
  const reduceMotion = useSettings((s) => s.reduceMotion);
  const largeText = useSettings((s) => s.largeText);
  const highContrast = useSettings((s) => s.highContrast);
  const [hydrated, setHydrated] = useState(() => useSettings.persist?.hasHydrated() ?? false);
  const [systemReduceMotion, setSystemReduceMotion] = useState(prefersReducedMotion);
  const [systemHighContrast, setSystemHighContrast] = useState(prefersMoreContrast);

  useEffect(() => {
    const persist = useSettings.persist;
    if (!persist) {
      setHydrated(true);
      return;
    }

    if (persist.hasHydrated()) {
      setHydrated(true);
      return;
    }

    const finishHydration = persist.onFinishHydration(() => setHydrated(true));
    void persist.rehydrate();
    return finishHydration;
  }, []);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const contrastQuery = window.matchMedia("(prefers-contrast: more)");

    const syncMotion = () => setSystemReduceMotion(motionQuery.matches);
    const syncContrast = () => setSystemHighContrast(contrastQuery.matches);

    syncMotion();
    syncContrast();
    motionQuery.addEventListener("change", syncMotion);
    contrastQuery.addEventListener("change", syncContrast);
    return () => {
      motionQuery.removeEventListener("change", syncMotion);
      contrastQuery.removeEventListener("change", syncContrast);
    };
  }, []);

  useEffect(() => {
    // System prefs always apply; toggles can force the stronger option on.
    const effectiveReduceMotion = systemReduceMotion || reduceMotion;
    const effectiveHighContrast = systemHighContrast || highContrast;

    applyAccessibilitySettings({
      reduceMotion: effectiveReduceMotion,
      largeText: hydrated ? largeText : false,
      highContrast: effectiveHighContrast,
    });
  }, [hydrated, reduceMotion, largeText, highContrast, systemReduceMotion, systemHighContrast]);

  return null;
}
