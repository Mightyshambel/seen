import { Link, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CheckCheck,
  MoreHorizontal,
  Paperclip,
  Phone,
  Play,
  Search,
  Send,
  Shield,
  Sparkles,
  X,
} from "lucide-react";
import { conversations as seedConversations, experienceLabels, peers, type Message, type PeerMatch } from "@/lib/mock";
import { useChatStore } from "@/stores/chat";

const distressKeywords = ["kill myself", "end it", "hurt myself", "suicide", "don't want to be here"];

function visibleMessages(messages: Message[]) {
  return messages.filter((m) => m.kind !== "reminder" && m.kind !== "grounding");
}

export function ChatPanel({ conversationId }: { conversationId: string }) {
  const navigate = useNavigate();
  const appendMessage = useChatStore((s) => s.appendMessage);
  const markRead = useChatStore((s) => s.markRead);
  const storedConv = useChatStore((s) => s.conversations.find((c) => c.id === conversationId));
  const seedConv = seedConversations.find((c) => c.id === conversationId);
  const conv = storedConv ?? seedConv;
  const peer = peers.find((p) => p.id === conv?.peerId) as PeerMatch | undefined;

  const messages = useMemo(
    () => visibleMessages(conv?.messages ?? []),
    [conv?.messages],
  );

  const [draft, setDraft] = useState("");
  const [showCrisis, setShowCrisis] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    markRead(conversationId);
  }, [conversationId, markRead]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    if (!menuOpen) return;

    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  if (!conv || !peer) {
    return <Navigate to="/chat" replace />;
  }

  const category = experienceLabels[peer.shared[0]]?.toLowerCase() ?? "peer support";
  const distress = distressKeywords.some((k) => draft.toLowerCase().includes(k));

  const send = () => {
    if (!draft.trim() || !conv) return;
    const message: Message = {
      id: String(Date.now()),
      from: "me",
      text: draft.trim(),
      time: formatTime(new Date()),
    };
    appendMessage(conv.id, message);
    setDraft("");
  };

  return (
    <div className="app-panel flex h-full flex-col">
      <header className="flex items-center gap-3 border-b border-border/50 bg-card px-4 py-4 md:px-6">
        <button
          type="button"
          aria-label="Back to conversations"
          onClick={() => navigate("/chat")}
          className="btn-ghost h-9 w-9 rounded-xl md:hidden"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <h2 className="font-serif text-[1.375rem] leading-tight tracking-tight text-foreground">
            {peer.name}
          </h2>
          <p className="text-[13px] text-muted-foreground">
            <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-sage" />
            here gently · {category}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" aria-label="Call" className="btn-ghost h-9 w-9 rounded-xl">
            <Phone className="h-[18px] w-[18px]" />
          </button>
          <button type="button" aria-label="Search in conversation" className="btn-ghost h-9 w-9 rounded-xl">
            <Search className="h-[18px] w-[18px]" />
          </button>
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              aria-label="More options"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="btn-ghost h-9 w-9 rounded-xl"
            >
              <MoreHorizontal className="h-[18px] w-[18px]" />
            </button>
            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-border bg-card py-1 shadow-[var(--shadow-elevated)]"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setShowCrisis(true);
                    setMenuOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-surface-muted"
                >
                  Crisis resources
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-surface-muted"
                >
                  Pause notifications
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="w-full px-4 py-2.5 text-left text-sm hover:bg-surface-muted"
                >
                  Report quietly
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-5 md:px-8">
        <SystemNotice icon={<Shield className="h-3.5 w-3.5" />}>
          This is a safe space. AI moderation is active to protect you both.
        </SystemNotice>

        <div className="mt-5 space-y-4">
          {messages.map((m, index) => {
            const mine = m.from === "me";
            const showAvatar = !mine && (index === 0 || messages[index - 1]?.from === "me");

            if (m.kind === "voice") {
              return (
                <div key={m.id} className="flex items-end justify-start gap-2">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-secondary text-[11px] font-semibold text-muted-foreground">
                    {peer.initial}
                  </span>
                  <VoiceBubble mine={false} time={m.time} />
                </div>
              );
            }

            if (m.kind === "prompt") {
              return (
                <SystemNotice key={m.id} icon={<Sparkles className="h-3.5 w-3.5 text-lavender" />} centered>
                  {m.text}
                </SystemNotice>
              );
            }

            return (
              <div
                key={m.id}
                className={"flex items-end gap-2 " + (mine ? "justify-end" : "justify-start")}
              >
                {!mine && showAvatar ? (
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-secondary text-[11px] font-semibold text-muted-foreground">
                    {peer.initial}
                  </span>
                ) : !mine ? (
                  <span className="h-7 w-7 shrink-0" />
                ) : null}

                <div
                  className={
                    "max-w-[min(100%,520px)] px-4 py-3 " +
                    (mine
                      ? "rounded-[20px] rounded-br-md bg-foreground text-background shadow-[0_8px_24px_-12px_oklch(0.24_0.02_268_/_0.35)]"
                      : "rounded-[20px] rounded-bl-md bg-secondary text-foreground")
                  }
                >
                  <p className="whitespace-pre-wrap text-[14px] leading-[1.45]">{m.text}</p>
                  <div
                    className={
                      "mt-1.5 flex items-center justify-end gap-1 text-[11px] " +
                      (mine ? "text-background/70" : "text-muted-foreground")
                    }
                  >
                    <span>{m.time}</span>
                    {mine && <CheckCheck className="h-3.5 w-3.5" />}
                  </div>
                </div>
              </div>
            );
          })}

          {messages.length >= 2 && (
            <SystemNotice icon={<Sparkles className="h-3.5 w-3.5 text-lavender" />} centered>
              Seen noticed this is a tender moment. Take a breath before replying.
            </SystemNotice>
          )}

          <div className="flex items-end gap-2">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-secondary text-[11px] font-semibold text-muted-foreground">
              {peer.initial}
            </span>
            <div className="rounded-[18px] rounded-bl-md bg-secondary px-4 py-3">
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:120ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:240ms]" />
              </span>
            </div>
          </div>

          <div ref={endRef} />
        </div>
      </div>

      <div className="border-t border-border/50 bg-card px-4 py-4 md:px-6">
        {distress && (
          <div className="mb-3 rounded-xl bg-clay-soft px-4 py-3 text-[13px] text-foreground/85">
            If you&apos;re in crisis, please reach out to a trained professional.{" "}
            <button type="button" onClick={() => setShowCrisis(true)} className="font-medium underline">
              See resources
            </button>
          </div>
        )}
        <div className="flex items-center gap-3">
          <button type="button" aria-label="Attach file" className="btn-ghost h-10 w-10 shrink-0 rounded-full">
            <Paperclip className="h-5 w-5" />
          </button>
          <div className="flex min-h-[46px] flex-1 items-center rounded-full border border-border/60 bg-surface-muted px-5 transition-all duration-300 focus-within:border-sage/30 focus-within:ring-[3px] focus-within:ring-sage/10">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
              placeholder="Write a gentle message..."
              aria-label="Message"
              className="w-full bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
          <button
            type="button"
            aria-label="Send message"
            onClick={send}
            disabled={!draft.trim()}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-foreground text-background shadow-[0_8px_20px_-8px_oklch(0.24_0.02_268_/_0.35)] transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-35 disabled:hover:translate-y-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>

      {showCrisis && (
        <CrisisDialog onClose={() => setShowCrisis(false)} />
      )}
    </div>
  );
}

function CrisisDialog({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="crisis-dialog-title"
        className="relative max-w-md rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-elevated)]"
      >
        <button
          type="button"
          aria-label="Close dialog"
          onClick={onClose}
          className="btn-ghost absolute right-3 top-3 h-8 w-8 rounded-lg"
        >
          <X className="h-4 w-4" />
        </button>
        <h2 id="crisis-dialog-title" className="font-serif text-2xl pr-8">
          You&apos;re not alone right now.
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          These lines are free, confidential, and staffed by trained humans 24/7.
        </p>
        <ul className="mt-4 space-y-2">
          {[
            ["988 Suicide & Crisis Lifeline (US)", "Call or text 988"],
            ["Samaritans (UK)", "Call 116 123"],
            ["Talk Suicide Canada", "1-833-456-4566"],
          ].map(([name, contact]) => (
            <li key={name} className="rounded-xl border border-border bg-background p-4">
              <p className="text-sm font-medium">{name}</p>
              <p className="text-sm text-muted-foreground">{contact}</p>
            </li>
          ))}
        </ul>
        <Link to="/support" onClick={onClose} className="link-muted mt-4 block text-center text-sm hover:text-sage">
          See all resources
        </Link>
      </div>
    </div>
  );
}

function SystemNotice({
  children,
  icon,
  centered,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  centered?: boolean;
}) {
  return (
    <div
      className={
        "surface-glass flex items-center gap-2 px-4 py-3 text-[12px] leading-relaxed text-muted-foreground " +
        (centered ? "mx-auto max-w-md justify-center text-center" : "")
      }
    >
      {icon}
      <span>{children}</span>
    </div>
  );
}

function VoiceBubble({ mine, time }: { mine: boolean; time: string }) {
  return (
    <div
      className={
        "flex max-w-[280px] items-center gap-3 px-4 py-3 " +
        (mine
          ? "rounded-[20px] rounded-br-md bg-foreground text-background"
          : "rounded-[20px] rounded-bl-md bg-secondary text-foreground")
      }
    >
      <button
        type="button"
        aria-label="Play voice message"
        className={
          "grid h-8 w-8 place-items-center rounded-full " +
          (mine ? "bg-background/15 text-background" : "bg-card text-foreground")
        }
      >
        <Play className="h-3.5 w-3.5" />
      </button>
      <div className="flex flex-1 items-center gap-1">
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className={"w-0.5 rounded-full " + (mine ? "bg-background/50" : "bg-muted-foreground/40")}
            style={{ height: `${8 + ((i * 7) % 16)}px` }}
          />
        ))}
      </div>
      <span className={"text-[11px] " + (mine ? "text-background/70" : "text-muted-foreground")}>
        {time || "1:24"}
      </span>
    </div>
  );
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
}
