import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Check,
  CheckCheck,
  FileText,
  MoreHorizontal,
  Pause,
  Play,
} from "lucide-react";
import type { Message } from "@/lib/mock";
import { formatDuration, mediaSrc } from "@/lib/media";

const QUICK_REACTIONS = ["❤️", "🫂", "🙏", "✨", "👍"];

export function messagePreview(m: Message): string {
  if (m.deleted) return "Deleted message";
  if (m.kind === "voice") return "Voice message";
  if (m.kind === "image") return m.text || "Photo";
  if (m.kind === "document") return m.fileName || m.text || "Document";
  return m.text || "Message";
}

export function MessageBubble({
  message: m,
  mine,
  peerInitial,
  showAvatar,
  highlighted,
  onReply,
  onEdit,
  onDelete,
  onReact,
  onForward,
}: {
  message: Message;
  mine: boolean;
  peerInitial: string;
  showAvatar: boolean;
  highlighted?: boolean;
  onReply: () => void;
  onEdit: () => void;
  onDelete: (scope: "me" | "everyone") => void;
  onReact: (emoji: string) => void;
  onForward: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const receipt =
    mine &&
    (m.readByPeer ? (
      <CheckCheck className="h-3.5 w-3.5 text-sage" aria-label="Read" />
    ) : (
      <Check className="h-3.5 w-3.5 opacity-70" aria-label="Sent" />
    ));

  const meta = (
    <div
      className={
        "mt-1.5 flex items-center justify-end gap-1 text-[11px] " +
        (mine ? "text-background/70" : "text-muted-foreground")
      }
    >
      {m.editedAt && !m.deleted ? <span>edited</span> : null}
      <span>{m.time}</span>
      {receipt}
    </div>
  );

  const reactions =
    m.reactions && m.reactions.length > 0 ? (
      <div className={"mt-1 flex flex-wrap gap-1 " + (mine ? "justify-end" : "justify-start")}>
        {m.reactions.map((r) => (
          <button
            key={r.emoji}
            type="button"
            onClick={() => onReact(r.mine ? "" : r.emoji)}
            className={
              "rounded-full border px-2 py-0.5 text-xs " +
              (r.mine
                ? "border-sage/40 bg-sage-soft text-foreground"
                : "border-border bg-card text-foreground")
            }
          >
            {r.emoji} {r.count > 1 ? r.count : ""}
          </button>
        ))}
      </div>
    ) : null;

  const actions = !m.deleted && (
    <div className="relative shrink-0 self-center" ref={menuRef}>
      <button
        type="button"
        aria-label="Message actions"
        className="btn-ghost h-7 w-7 rounded-full opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
        onClick={() => setMenuOpen((v) => !v)}
      >
        <MoreHorizontal className="h-3.5 w-3.5" />
      </button>
      {menuOpen && (
        <div
          role="menu"
          className={
            "absolute z-40 w-44 overflow-hidden rounded-xl border border-border bg-card py-1 shadow-[var(--shadow-elevated)] " +
            (mine ? "right-0" : "left-0")
          }
        >
          <div className="flex justify-around border-b border-border/60 px-2 py-1.5">
            {QUICK_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className="rounded-lg px-1.5 py-1 text-base hover:bg-surface-muted"
                onClick={() => {
                  onReact(emoji);
                  setMenuOpen(false);
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
          <ActionItem
            label="Reply"
            onClick={() => {
              onReply();
              setMenuOpen(false);
            }}
          />
          {mine && m.kind !== "voice" && m.kind !== "image" && m.kind !== "document" && (
            <ActionItem
              label="Edit"
              onClick={() => {
                onEdit();
                setMenuOpen(false);
              }}
            />
          )}
          <ActionItem
            label="Forward"
            onClick={() => {
              onForward();
              setMenuOpen(false);
            }}
          />
          <ActionItem
            label="Delete for me"
            onClick={() => {
              onDelete("me");
              setMenuOpen(false);
            }}
          />
          {mine && (
            <ActionItem
              label="Unsend"
              danger
              onClick={() => {
                onDelete("everyone");
                setMenuOpen(false);
              }}
            />
          )}
        </div>
      )}
    </div>
  );

  let body: React.ReactNode;

  if (m.deleted) {
    body = (
      <div
        className={
          "max-w-[min(100%,520px)] px-4 py-3 italic " +
          (mine
            ? "rounded-[20px] rounded-br-md bg-foreground/80 text-background/80"
            : "rounded-[20px] rounded-bl-md bg-secondary text-muted-foreground")
        }
      >
        <p className="text-[14px]">Message deleted</p>
        {meta}
      </div>
    );
  } else if (m.kind === "voice") {
    body = <VoiceBubble mine={mine} time={m.time} mediaUrl={m.mediaUrl} durationMs={m.durationMs} receipt={receipt} />;
  } else if (m.kind === "image") {
    body = (
      <ImageBubble mine={mine} text={m.text} mediaUrl={m.mediaUrl} meta={meta} />
    );
  } else if (m.kind === "document") {
    body = (
      <a
        href={mediaSrc(m.mediaUrl)}
        target="_blank"
        rel="noopener noreferrer"
        className={
          "flex max-w-[min(100%,320px)] items-center gap-3 px-4 py-3 " +
          (mine
            ? "rounded-[20px] rounded-br-md bg-foreground text-background"
            : "rounded-[20px] rounded-bl-md bg-secondary text-foreground")
        }
      >
        <span
          className={
            "grid h-10 w-10 place-items-center rounded-xl " +
            (mine ? "bg-background/15" : "bg-card")
          }
        >
          <FileText className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{m.fileName || "Document"}</span>
          {m.text ? <span className="mt-0.5 block truncate text-xs opacity-70">{m.text}</span> : null}
          {meta}
        </span>
      </a>
    );
  } else {
    body = (
      <div
        className={
          "max-w-[min(100%,520px)] px-4 py-3 " +
          (mine
            ? "rounded-[20px] rounded-br-md bg-foreground text-background shadow-[0_8px_24px_-12px_oklch(0.24_0.02_268_/_0.35)]"
            : "rounded-[20px] rounded-bl-md bg-secondary text-foreground")
        }
      >
        {m.forwarded && (
          <p className={"mb-1 text-[11px] font-medium " + (mine ? "text-background/60" : "text-muted-foreground")}>
            Forwarded
          </p>
        )}
        {m.replyPreview && (
          <div
            className={
              "mb-2 rounded-lg border-l-2 px-2.5 py-1.5 text-[12px] " +
              (mine ? "border-background/40 bg-background/10 text-background/80" : "border-sage bg-card/60 text-muted-foreground")
            }
          >
            {m.replyPreview}
          </div>
        )}
        <p className="whitespace-pre-wrap text-[14px] leading-[1.45]">{m.text}</p>
        {meta}
      </div>
    );
  }

  return (
    <div
      id={`msg-${m.id}`}
      className={
        "group flex items-end gap-1 scroll-mt-24 " +
        (mine ? "justify-end" : "justify-start") +
        (highlighted ? " animate-pulse rounded-2xl ring-2 ring-sage/50 ring-offset-2 ring-offset-background" : "")
      }
    >
      {!mine && showAvatar ? (
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-secondary text-[11px] font-semibold text-muted-foreground">
          {peerInitial}
        </span>
      ) : !mine ? (
        <span className="h-7 w-7 shrink-0" />
      ) : null}

      {mine && actions}

      <div className="min-w-0">
        {body}
        {reactions}
      </div>

      {!mine && actions}
    </div>
  );
}

function ActionItem({
  label,
  onClick,
  danger,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={
        "w-full px-3 py-2 text-left text-sm hover:bg-surface-muted " +
        (danger ? "text-clay" : "")
      }
    >
      {label}
    </button>
  );
}

function ImageBubble({
  mine,
  text,
  mediaUrl,
  meta,
}: {
  mine: boolean;
  text?: string;
  mediaUrl?: string;
  meta: React.ReactNode;
}) {
  const [failed, setFailed] = useState(false);
  const src = mediaSrc(mediaUrl);

  return (
    <div
      className={
        "max-w-[min(100%,280px)] overflow-hidden " +
        (mine
          ? "rounded-[18px] rounded-br-md bg-foreground text-background shadow-[0_8px_24px_-12px_oklch(0.24_0.02_268_/_0.35)]"
          : "rounded-[18px] rounded-bl-md bg-secondary text-foreground")
      }
    >
      {src && !failed ? (
        <a href={src} target="_blank" rel="noopener noreferrer">
          <img
            src={src}
            alt={text || "Shared photo"}
            className="max-h-72 w-full object-contain bg-black/5"
            onError={() => setFailed(true)}
          />
        </a>
      ) : (
        <div
          className={
            "grid h-40 place-items-center px-4 text-center text-sm " +
            (mine ? "text-background/70" : "text-muted-foreground")
          }
        >
          Media unavailable
        </div>
      )}
      {text ? <p className="whitespace-pre-wrap px-3 pt-2 text-[14px] leading-[1.45]">{text}</p> : null}
      <div className="px-3 pb-2">{meta}</div>
    </div>
  );
}

function VoiceBubble({
  mine,
  time,
  mediaUrl,
  durationMs,
  receipt,
}: {
  mine: boolean;
  time: string;
  mediaUrl?: string;
  durationMs?: number;
  receipt: React.ReactNode;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const src = mediaSrc(mediaUrl);

  useEffect(() => {
    const audio = new Audio(src);
    audioRef.current = audio;
    const onEnded = () => setPlaying(false);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.pause();
      audio.removeEventListener("ended", onEnded);
      audioRef.current = null;
    };
  }, [src]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio || !src) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    void audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => {
        toast.error("Couldn't play that voice note.");
      });
  };

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
        aria-label={playing ? "Pause voice message" : "Play voice message"}
        onClick={toggle}
        className={
          "grid h-8 w-8 place-items-center rounded-full " +
          (mine ? "bg-background/15 text-background" : "bg-card text-foreground")
        }
      >
        {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
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
      <div className={"text-right text-[11px] " + (mine ? "text-background/70" : "text-muted-foreground")}>
        <div>{formatDuration(durationMs)}</div>
        <div className="flex items-center justify-end gap-1">
          <span>{time}</span>
          {receipt}
        </div>
      </div>
    </div>
  );
}
