import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Clock3, Loader2, RefreshCw, Search } from "lucide-react";
import { MatchCard } from "@/components/matching/MatchCard";
import { SeenLogo } from "@/components/brand/SeenLogo";
import { ApiError } from "@/lib/api-client";
import { listConversations } from "@/lib/api/conversations";
import { findMatch, getCurrentMatch, rematch } from "@/lib/api/matching";
import type { MatchFoundPayload } from "@/lib/api/types";
import { apiPeerToDisplay } from "@/lib/peer-mapper";
import { subscribeWs } from "@/lib/ws-client";

const MATCH_STEPS = [
  "Reading what you shared",
  "Looking for shared experience",
  "Checking who is available",
  "Making sure the match feels safe",
  "Almost ready",
] as const;

type MatchPhase = "finding" | "queued" | "results";

function matchErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    if (error.status === 429) {
      return "Too many matching attempts. Please wait a few minutes and try again.";
    }
    return error.message || fallback;
  }
  return fallback;
}

export function MatchingPage() {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<MatchPhase>("finding");
  const [activeStep, setActiveStep] = useState(0);
  const [rematchKey, setRematchKey] = useState(0);
  const [match, setMatch] = useState<MatchFoundPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rematching, setRematching] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadMatch() {
      setError(null);
      try {
        const current = await getCurrentMatch();
        if (cancelled) return;

        if (current.status === "matched") {
          setMatch(current.match);
          setPhase("results");
          return;
        }

        const result = await findMatch();
        if (cancelled) return;

        if (result.status === "matched") {
          setMatch(result.match);
          setPhase("results");
          return;
        }

        const conversations = await listConversations();
        if (cancelled) return;
        if (conversations.length > 0) {
          setPhase("queued");
          setError("You already have a conversation. Open it from the chat page.");
          return;
        }

        setPhase("queued");
      } catch (loadError) {
        if (!cancelled) {
          setError(matchErrorMessage(loadError, "We couldn't start matching right now. Please try again."));
          setPhase("queued");
        }
      }
    }

    void loadMatch();

    return () => {
      cancelled = true;
    };
  }, [rematchKey]);

  useEffect(() => {
    if (phase !== "finding") return;

    const stepDelay = reduce ? 400 : 900;
    const timers: ReturnType<typeof setTimeout>[] = [];

    MATCH_STEPS.forEach((_, index) => {
      if (index === 0) return;
      timers.push(
        setTimeout(() => {
          setActiveStep(index);
        }, stepDelay * index),
      );
    });

    return () => timers.forEach(clearTimeout);
  }, [phase, reduce, rematchKey]);

  useEffect(() => {
    return subscribeWs((event) => {
      if (event.type !== "match.found") return;
      const payload = event.match as MatchFoundPayload;
      setMatch(payload);
      setPhase("results");
    });
  }, []);

  const handleRematch = async () => {
    setRematching(true);
    setError(null);
    setMatch(null);
    setActiveStep(0);
    setPhase("finding");

    try {
      const current = await getCurrentMatch();
      if (current.status === "matched") {
        setMatch(current.match);
        setPhase("results");
        return;
      }

      const result = await rematch();
      if (result.status === "matched") {
        setMatch(result.match);
        setPhase("results");
      } else {
        setPhase("queued");
        setRematchKey((k) => k + 1);
      }
    } catch (rematchError) {
      setError(matchErrorMessage(rematchError, "Rematch failed. Please try again in a moment."));
      setPhase("queued");
    } finally {
      setRematching(false);
    }
  };

  if (phase === "results" && match) {
    const peer = apiPeerToDisplay(match.peer);

    return (
      <div className="min-h-dvh bg-background pb-28">
        <header className="border-b border-border/60 bg-background/80 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-5">
            <Link to="/" className="inline-block">
              <SeenLogo className="h-9 sm:h-10" />
            </Link>
          </div>
        </header>

        <div className="mx-auto max-w-2xl px-5 py-10">
          <p className="eyebrow text-center text-muted-foreground">Match ready</p>
          <h1 className="display-2 mt-3 text-center">Your match is here</h1>
          <p className="mx-auto mt-3 max-w-md text-center text-sm text-muted-foreground">
            Someone whose lived experience aligns closely with yours. Take your time before you reach out.
          </p>

          <ul className="mt-10 space-y-4">
            <MatchCard peer={peer} conversationId={match.conversationId} />
          </ul>
        </div>

        <div className="sticky-bar fixed inset-x-0 bottom-0 z-20 px-6 py-5">
          <div className="mx-auto max-w-2xl">
            <button
              type="button"
              onClick={() => void handleRematch()}
              disabled={rematching}
              className="btn-secondary w-full"
            >
              <RefreshCw className="h-4 w-4" />
              {rematching ? "Finding someone new…" : "Rematch"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "queued") {
    return (
      <div className="grid min-h-dvh place-items-center bg-background px-6 py-16">
        <div className="w-full max-w-md text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-sage-soft text-sage">
            <Clock3 className="h-7 w-7" />
          </span>
          <h1 className="display-2 mt-8">You&apos;re in the queue</h1>
          <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            We&apos;re looking for someone compatible. You&apos;ll be notified here when a match is found — no need to refresh.
          </p>
          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
          <div className="mt-8 flex flex-col gap-3">
            <Link to="/chat" className="btn-primary w-full max-w-sm mx-auto">
              Go to conversations
            </Link>
            <button
              type="button"
              onClick={() => void handleRematch()}
              disabled={rematching}
              className="btn-secondary w-full max-w-sm mx-auto"
            >
              <RefreshCw className="h-4 w-4" />
              {rematching ? "Trying again…" : "Try rematch"}
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
          We&apos;re looking for someone whose lived experience sits close to yours.
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
