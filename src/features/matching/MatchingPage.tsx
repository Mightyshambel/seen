import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Loader2, RefreshCw, Search } from "lucide-react";
import { MatchCard } from "@/components/matching/MatchCard";
import { peers } from "@/lib/mock";

const MATCH_STEPS = [
  "Profile vectorised with SBERT",
  "Computing cosine similarity...",
  "Ranking top matches",
  "Adaptive filter — needs evolution check",
  "Safety layer verified · Match ready",
] as const;

export function MatchingPage() {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<"finding" | "results">("finding");
  const [activeStep, setActiveStep] = useState(0);
  const [rematchKey, setRematchKey] = useState(0);

  const topMatches = useMemo(
    () => [...peers].sort((a, b) => b.compatibility - a.compatibility).slice(0, 3),
    [],
  );

  useEffect(() => {
    if (phase !== "finding") return;

    const stepDelay = reduce ? 400 : 900;
    const finalDelay = reduce ? 500 : 1200;

    const timers: ReturnType<typeof setTimeout>[] = [];

    MATCH_STEPS.forEach((_, index) => {
      if (index === 0) return;
      timers.push(
        setTimeout(() => {
          setActiveStep(index);
        }, stepDelay * index),
      );
    });

    timers.push(
      setTimeout(() => {
        setPhase("results");
      }, stepDelay * (MATCH_STEPS.length - 1) + finalDelay),
    );

    return () => timers.forEach(clearTimeout);
  }, [phase, reduce, rematchKey]);

  const handleRematch = () => {
    setActiveStep(0);
    setPhase("finding");
    setRematchKey((k) => k + 1);
  };

  if (phase === "results") {
    return (
      <div className="min-h-dvh bg-background pb-28">
        <header className="border-b border-border/60 bg-background/80 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-5">
            <Link to="/" className="font-serif text-lg">
              Seen
            </Link>
          </div>
        </header>

        <div className="mx-auto max-w-2xl px-5 py-10">
          <p className="eyebrow text-center text-muted-foreground">Match ready</p>
          <h1 className="display-2 mt-3 text-center">Your top matches</h1>
          <p className="mx-auto mt-3 max-w-md text-center text-sm text-muted-foreground">
            Three people whose lived experience aligns closely with yours. Choose who feels right today.
          </p>

          <ul className="mt-10 space-y-4">
            {topMatches.map((peer, index) => (
              <MatchCard key={peer.id} peer={peer} rank={index + 1} />
            ))}
          </ul>
        </div>

        <div className="sticky-bar fixed inset-x-0 bottom-0 z-20 px-6 py-5">
          <div className="mx-auto max-w-2xl">
            <button type="button" onClick={handleRematch} className="btn-secondary w-full">
              <RefreshCw className="h-4 w-4" />
              Rematch
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-background px-6 py-16">
      <div className="w-full max-w-md text-center">
        <div className="relative mx-auto h-28 w-28">
          {[0, 1].map((i) => (
            <motion.span
              key={i}
              className="absolute inset-0 rounded-full border border-border/80"
              animate={reduce ? {} : { scale: [1, 1.35 + i * 0.15], opacity: [0.45, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.5, ease: "easeOut" }}
            />
          ))}
          <span className="absolute inset-0 grid place-items-center">
            <span className="glow-sage grid h-16 w-16 place-items-center rounded-full bg-sage text-primary-foreground">
              <Search className="h-6 w-6" strokeWidth={2.2} />
            </span>
          </span>
        </div>

        <h1 className="display-2 mt-10">Finding your match</h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Our NLP engine is analysing your profile and computing semantic similarity across our community.
        </p>

        <ul className="mx-auto mt-10 max-w-sm space-y-4 text-left">
          {MATCH_STEPS.map((step, index) => {
            const complete = index < activeStep;
            const current = index === activeStep;
            const pending = index > activeStep;

            return (
              <motion.li
                key={step}
                initial={{ opacity: 0.4 }}
                animate={{ opacity: pending ? 0.45 : 1 }}
                className="flex items-center gap-3"
              >
                <span
                  className={
                    "grid h-7 w-7 shrink-0 place-items-center rounded-full " +
                    (complete
                      ? "bg-sage text-primary-foreground"
                      : current
                        ? "bg-sage/15 text-sage"
                        : "bg-muted text-muted-foreground")
                  }
                >
                  {complete ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  ) : current ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  )}
                </span>
                <span
                  className={
                    "text-sm " +
                    (complete || current ? "font-medium text-foreground" : "text-muted-foreground")
                  }
                >
                  {step}
                </span>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
