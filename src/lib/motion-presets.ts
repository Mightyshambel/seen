import { useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Scroll-triggered reveal that stays visible during SSR (no opacity: 0). */
export function scrollReveal(reduce: boolean | null, delay = 0) {
  const offset = reduce ? 0 : 8;

  return {
    initial: { opacity: 1, y: offset },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: {
      duration: reduce ? 0 : 0.6,
      ease: EASE,
      delay: reduce ? 0 : delay,
    },
  };
}

/** Mount-time reveal that stays visible during SSR (no opacity: 0). */
export function mountReveal(reduce: boolean | null, delay = 0, offset = 8) {
  const y = reduce ? 0 : offset;

  return {
    initial: { opacity: 1, y },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: reduce ? 0 : 0.6,
      ease: EASE,
      delay: reduce ? 0 : delay,
    },
  };
}

/** Onboarding step transitions with SSR-safe enter state. */
export function stepTransition(reduce: boolean | null) {
  return {
    initial: { opacity: 1 },
    animate: { opacity: 1 },
    exit: { opacity: reduce ? 1 : 0 },
    transition: { duration: reduce ? 0 : 0.35, ease: EASE },
  };
}

export function useScrollReveal() {
  const reduce = useReducedMotion();
  return (delay = 0) => scrollReveal(reduce, delay);
}

export function useMountReveal() {
  const reduce = useReducedMotion();
  return (delay = 0, offset = 8) => mountReveal(reduce, delay, offset);
}
