import { Link, Navigate, useParams } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Bookmark, Clock, Sparkles } from "lucide-react";
import { emotionalLabels, experienceLabels, getPeerById } from "@/lib/mock";
import { useMountReveal } from "@/lib/motion-presets";
import { useChatStore } from "@/stores/chat";

function availabilityLabel(availability: "now" | "today" | "this-week") {
  if (availability === "now") return "Available now";
  if (availability === "today") return "Around today";
  return "This week";
}

function supportStyleLabel(style: "listener" | "sharer" | "both") {
  if (style === "both") return "open to listening and sharing";
  if (style === "listener") return "here to listen";
  return "would like to share";
}

export function MatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const peer = id ? getPeerById(id) : undefined;
  const reveal = useMountReveal();
  const reduce = useReducedMotion();
  const connectPeer = useChatStore((s) => s.connectPeer);

  if (!peer) {
    return <Navigate to="/matching" replace />;
  }

  const conversationId = `c-${peer.id}`;

  return (
    <div className="min-h-dvh bg-background pb-32">
      <header className="border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-5">
          <Link to="/" className="font-serif text-lg">
            Seen
          </Link>
          <Link to="/matching" className="text-sm text-muted-foreground hover:text-foreground">
            Back
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-5 py-12">
        <motion.p {...reveal(0)} className="eyebrow text-muted-foreground">
          A match has been made
        </motion.p>
        <motion.h1 {...reveal(0.05)} className="display-2 mt-3">
          Meet <em className="italic text-sage">{peer.name}.</em>
        </motion.h1>
        <motion.p {...reveal(0.1)} className="mt-3 max-w-lg text-muted-foreground">
          Someone who&apos;s been where you are, and who has the space today to sit with you for a while.
        </motion.p>

        <motion.article
          {...reveal(0.15)}
          className="mt-10 overflow-hidden rounded-3xl border border-border bg-card shadow-[0_30px_80px_-50px_rgba(20,30,40,0.3)]"
        >
          <div
            className="h-32"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in oklab, var(--sage) 32%, transparent), color-mix(in oklab, var(--lavender) 24%, transparent))",
            }}
          />
          <div className="-mt-10 px-7 pb-7">
            <div className="flex items-end justify-between">
              <span className="grid h-20 w-20 place-items-center rounded-full border-4 border-card bg-sage-soft font-serif text-3xl text-sage">
                {peer.initial}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-soft px-3 py-1 text-xs text-sage">
                <span className="h-1.5 w-1.5 rounded-full bg-sage" /> {availabilityLabel(peer.availability)}
              </span>
            </div>
            <h2 className="display-3 mt-5">
              {peer.name}{" "}
              <span className="ml-1 text-base text-muted-foreground">· {peer.pronouns}</span>
            </h2>
            <p className="text-sm text-muted-foreground">{peer.city}</p>
            <p className="mt-5 font-serif text-lg leading-relaxed italic text-foreground/90">
              &ldquo;{peer.bio}&rdquo;
            </p>

            <div className="mt-7">
              <p className="eyebrow text-muted-foreground">Shared ground</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {peer.shared.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 rounded-full bg-sage-soft px-3 py-1 text-sm text-foreground"
                  >
                    <Sparkles className="h-3 w-3 text-sage" /> {experienceLabels[t]}
                  </span>
                ))}
                {peer.emotional.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 rounded-full bg-lavender-soft px-3 py-1 text-sm text-foreground"
                  >
                    {emotionalLabels[t]} today
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-7">
              <div className="flex items-center justify-between">
                <p className="eyebrow text-muted-foreground">Understanding</p>
                <p className="text-sm font-medium">{peer.compatibility}%</p>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full rounded-full bg-sage"
                  initial={{ width: 0 }}
                  animate={{ width: `${peer.compatibility}%` }}
                  transition={{
                    duration: reduce ? 0 : 1.2,
                    ease: [0.22, 1, 0.36, 1] as const,
                    delay: 0.6,
                  }}
                />
              </div>
              <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" /> Soft pace · {supportStyleLabel(peer.supportStyle)}
              </p>
            </div>
          </div>
        </motion.article>

        <motion.div
          {...reveal(0.25)}
          className="fixed inset-x-0 bottom-0 z-20 border-t border-border/60 bg-background/95 px-5 py-4 backdrop-blur"
        >
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-medium text-foreground/80 hover:text-foreground"
            >
              <Bookmark className="h-4 w-4" /> Save for later
            </button>
            <Link
              to={`/chat/${conversationId}`}
              onClick={() => connectPeer(peer.id)}
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background"
            >
              Start the conversation <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
