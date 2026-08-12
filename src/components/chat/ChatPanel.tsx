import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Heart,
  MoreHorizontal,
  Phone,
  Search,
  Shield,
  Video,
  X,
} from "lucide-react";
import { PageLoader } from "@/components/common/PageLoader";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { ForwardPicker } from "@/components/chat/ForwardPicker";
import { MessageBubble, messagePreview } from "@/components/chat/MessageBubble";
import { SafetyActionDialog } from "@/components/chat/SafetyActionDialog";
import { queryKeys, useConversation } from "@/hooks/useApiQueries";
import {
  deleteMessage,
  editMessage,
  markConversationRead,
  reactToMessage,
  sendMediaMessage,
  sendMessage,
  toggleConversationMute,
} from "@/lib/api/conversations";
import { ApiError } from "@/lib/api-client";
import type { ApiConversationDetail, ApiMessage } from "@/lib/api/types";
import type { Message } from "@/lib/mock";
import { wireMessage } from "@/lib/message-utils";
import { rememberSentMessage } from "@/lib/message-notifications";
import { crisisResources } from "@/lib/mock";
import { syncSettingsPatch } from "@/lib/settings-sync";
import { useSettings } from "@/stores/settings";
import { subscribeWs } from "@/lib/ws-client";
import { startCall } from "@/lib/call-controller";

function visibleMessages(messages: Message[]) {
  return messages.filter((m) => m.kind !== "grounding" && m.kind !== "prompt");
}

export function ChatPanel({ conversationId }: { conversationId: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: conversation, isLoading, isError, refetch, isFetching } = useConversation(conversationId);
  const setNotifyNewMessage = useSettings((s) => s.setNotifyNewMessage);

  const [showCrisis, setShowCrisis] = useState(false);
  const [safetyMode, setSafetyMode] = useState<"report" | "block" | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [replyTo, setReplyTo] = useState<{ id: string; preview: string } | null>(null);
  const [editing, setEditing] = useState<{ id: string; text: string } | null>(null);
  const [peerTyping, setPeerTyping] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [searchIndex, setSearchIndex] = useState(0);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [forwardMessageId, setForwardMessageId] = useState<string | null>(null);

  const endRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const typingClearRef = useRef<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const messages = useMemo(
    () => visibleMessages((conversation?.messages ?? []).map(wireMessage)),
    [conversation?.messages],
  );

  const searchHits = useMemo(() => {
    const q = searchQ.trim().toLowerCase();
    if (!q) return [] as Message[];
    return messages.filter(
      (m) =>
        !m.deleted &&
        (m.text.toLowerCase().includes(q) ||
          (m.fileName?.toLowerCase().includes(q) ?? false) ||
          (m.replyPreview?.toLowerCase().includes(q) ?? false)),
    );
  }, [messages, searchQ]);

  useEffect(() => {
    if (!conversation || conversation.unread === 0) return;
    void markConversationRead(conversationId).then((updated) => {
      queryClient.setQueryData(queryKeys.conversation(conversationId), updated);
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    });
  }, [conversation, conversationId, queryClient]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, peerTyping]);

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

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    setSearchIndex(0);
    const q = searchQ.trim().toLowerCase();
    if (!q) return;
    const hit = messages.find(
      (m) =>
        !m.deleted &&
        (m.text.toLowerCase().includes(q) ||
          (m.fileName?.toLowerCase().includes(q) ?? false) ||
          (m.replyPreview?.toLowerCase().includes(q) ?? false)),
    );
    if (!hit) return;
    setHighlightId(hit.id);
    requestAnimationFrame(() => {
      document.getElementById(`msg-${hit.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    // Only jump when the query changes, not on every new message
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQ]);

  useEffect(() => {
    return subscribeWs((event) => {
      if (event.type !== "typing" || event.conversationId !== conversationId) return;
      if (typingClearRef.current) window.clearTimeout(typingClearRef.current);
      setPeerTyping(Boolean(event.isTyping));
      if (event.isTyping) {
        typingClearRef.current = window.setTimeout(() => setPeerTyping(false), 3000);
      }
    });
  }, [conversationId]);

  useEffect(() => {
    return () => {
      if (typingClearRef.current) window.clearTimeout(typingClearRef.current);
    };
  }, []);

  const patchMessage = (message: ApiMessage) => {
    queryClient.setQueryData<ApiConversationDetail>(queryKeys.conversation(conversationId), (old) => {
      if (!old) return old;
      return {
        ...old,
        messages: old.messages.map((m) => (m.id === message.id ? message : m)),
      };
    });
  };

  const removeOrMarkDeleted = (messageId: string, scope: "me" | "everyone") => {
    queryClient.setQueryData<ApiConversationDetail>(queryKeys.conversation(conversationId), (old) => {
      if (!old) return old;
      if (scope === "me") {
        return { ...old, messages: old.messages.filter((m) => m.id !== messageId) };
      }
      return {
        ...old,
        messages: old.messages.map((m) =>
          m.id === messageId ? { ...m, deleted: true, text: "", mediaUrl: null } : m,
        ),
      };
    });
  };

  const appendSendResult = (data: Awaited<ReturnType<typeof sendMessage>>) => {
    rememberSentMessage(data.userMessage.id);
    queryClient.setQueryData<ApiConversationDetail>(queryKeys.conversation(conversationId), (old) => {
      if (!old) return old;
      const nextMessages = [...old.messages, data.userMessage];
      if (data.systemMessage) nextMessages.push(data.systemMessage);
      return { ...old, messages: nextMessages, warmth: data.warmth, lastAt: data.userMessage.time };
    });
    void queryClient.invalidateQueries({ queryKey: ["conversations"] });
    if (data.distress?.showCrisisResources) setShowCrisis(true);
  };

  const sendMutation = useMutation({
    mutationFn: ({ text, replyToId }: { text: string; replyToId?: string }) =>
      sendMessage(conversationId, text, { replyToId }),
    onSuccess: appendSendResult,
    onError: (error) => {
      if (error instanceof ApiError && error.status === 422) {
        toast.error("That message couldn't be sent. Please rephrase gently.");
        return;
      }
      toast.error("Message couldn't be sent right now.");
    },
  });

  const sendImage = async (file: File, caption: string, replyToId?: string) => {
    const data = await sendMediaMessage(conversationId, file, {
      kind: "image",
      filename: file.name || "photo.jpg",
      caption,
      replyToId,
    });
    appendSendResult(data);
  };

  const sendDocument = async (file: File, caption: string, replyToId?: string) => {
    const data = await sendMediaMessage(conversationId, file, {
      kind: "document",
      filename: file.name || "document",
      caption,
      replyToId,
    });
    appendSendResult(data);
  };

  const sendVoice = async (blob: Blob, durationMs: number, replyToId?: string) => {
    const data = await sendMediaMessage(conversationId, blob, {
      kind: "voice",
      filename: "voice.webm",
      durationMs,
      replyToId,
    });
    appendSendResult(data);
  };

  const onEditSave = async (messageId: string, text: string) => {
    const updated = await editMessage(conversationId, messageId, text);
    patchMessage(updated);
    setEditing(null);
  };

  const onDelete = async (messageId: string, scope: "me" | "everyone") => {
    try {
      await deleteMessage(conversationId, messageId, scope);
      removeOrMarkDeleted(messageId, scope);
      toast(scope === "everyone" ? "Message unsent." : "Message deleted for you.");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Couldn't delete that message.");
    }
  };

  const onReact = async (messageId: string, emoji: string) => {
    try {
      const updated = await reactToMessage(conversationId, messageId, emoji);
      patchMessage(updated);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Couldn't update reaction.");
    }
  };

  const onMuteToggle = async () => {
    try {
      const result = await toggleConversationMute(conversationId);
      queryClient.setQueryData<ApiConversationDetail>(queryKeys.conversation(conversationId), (old) =>
        old ? { ...old, muted: result.muted } : old,
      );
      void queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast(result.muted ? "Chat muted." : "Chat unmuted.");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Couldn't update mute.");
    }
  };

  const jumpToHit = (index: number) => {
    if (searchHits.length === 0) return;
    const next = ((index % searchHits.length) + searchHits.length) % searchHits.length;
    setSearchIndex(next);
    const id = searchHits[next]?.id;
    if (!id) return;
    setHighlightId(id);
    document.getElementById(`msg-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => setHighlightId(null), 1600);
  };

  if (isLoading) {
    return (
      <div className="app-panel grid h-full place-items-center">
        <PageLoader variant="inline" />
      </div>
    );
  }

  if (isError || !conversation) {
    return (
      <div className="app-panel grid h-full place-items-center px-6">
        <div className="w-full max-w-md text-center">
          <h2 className="font-serif text-2xl text-foreground">We couldn&apos;t open this chat</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Something went wrong loading the conversation. You can try again, or return to your list.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button type="button" onClick={() => void refetch()} disabled={isFetching} className="btn-primary min-h-11">
              {isFetching ? "Trying again…" : "Retry"}
            </button>
            <Link to="/chat" className="btn-secondary min-h-11">
              Back to chat
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const peerInitial = conversation.peerName.charAt(0).toUpperCase() || "?";
  const statusLine = peerTyping
    ? "typing…"
    : conversation.blocked
      ? "blocked"
      : conversation.muted
        ? "muted"
        : null;

  return (
    <div className="app-panel flex h-full flex-col">
      <header className="border-b border-border/50 bg-card">
        <div className="flex items-center gap-3 px-4 py-4 md:px-6">
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
              {conversation.peerName}
            </h2>
            {statusLine && (
              <p className="text-[13px] text-muted-foreground">
                <span
                  className={
                    "mr-1 inline-block h-1.5 w-1.5 rounded-full " +
                    (peerTyping ? "animate-pulse bg-sage" : conversation.blocked ? "bg-clay" : "bg-sage")
                  }
                />
                {statusLine}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1">
            {!conversation.blocked && (
              <>
                <button
                  type="button"
                  aria-label="Voice call"
                  onClick={() =>
                    void startCall({
                      conversationId,
                      peerName: conversation.peerName,
                      media: "audio",
                    })
                  }
                  className="btn-ghost h-9 w-9 rounded-xl"
                >
                  <Phone className="h-[18px] w-[18px]" />
                </button>
                <button
                  type="button"
                  aria-label="Video call"
                  onClick={() =>
                    void startCall({
                      conversationId,
                      peerName: conversation.peerName,
                      media: "video",
                    })
                  }
                  className="btn-ghost h-9 w-9 rounded-xl"
                >
                  <Video className="h-[18px] w-[18px]" />
                </button>
              </>
            )}
            <button
              type="button"
              aria-label="Search in chat"
              aria-pressed={searchOpen}
              onClick={() => {
                setSearchOpen((v) => !v);
                if (searchOpen) {
                  setSearchQ("");
                  setHighlightId(null);
                }
              }}
              className="btn-ghost h-9 w-9 rounded-xl"
            >
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
                  className="absolute right-0 top-full z-50 mt-1 w-52 rounded-xl border border-border bg-card py-1 shadow-[var(--shadow-elevated)]"
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
                    onClick={() => {
                      void onMuteToggle();
                      setMenuOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-surface-muted"
                  >
                    {conversation.muted ? "Unmute chat" : "Mute chat"}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      void syncSettingsPatch({ notifyNewMessage: false });
                      setNotifyNewMessage(false);
                      toast("Message notifications paused.");
                      setMenuOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-surface-muted"
                  >
                    Pause message alerts
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setSafetyMode("report");
                      setMenuOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-surface-muted"
                  >
                    Report quietly
                  </button>
                  {!conversation.blocked && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setSafetyMode("block");
                        setMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-surface-muted"
                    >
                      Block & report
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {searchOpen && (
          <div className="flex items-center gap-2 border-t border-border/40 px-4 py-2.5 md:px-6">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              ref={searchInputRef}
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  jumpToHit(searchIndex + (e.shiftKey ? -1 : 1));
                }
                if (e.key === "Escape") {
                  setSearchOpen(false);
                  setSearchQ("");
                }
              }}
              placeholder="Search messages in this chat"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              aria-label="Search messages in this chat"
            />
            <span className="shrink-0 text-xs text-muted-foreground">
              {searchQ.trim() ? `${searchHits.length === 0 ? 0 : searchIndex + 1}/${searchHits.length}` : ""}
            </span>
            <button
              type="button"
              aria-label="Previous match"
              className="btn-ghost h-8 w-8 rounded-lg"
              disabled={searchHits.length === 0}
              onClick={() => jumpToHit(searchIndex - 1)}
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next match"
              className="btn-ghost h-8 w-8 rounded-lg"
              disabled={searchHits.length === 0}
              onClick={() => jumpToHit(searchIndex + 1)}
            >
              <ChevronDown className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Close search"
              className="btn-ghost h-8 w-8 rounded-lg"
              onClick={() => {
                setSearchOpen(false);
                setSearchQ("");
              }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-5 md:px-8">
        <SystemNotice icon={<Shield className="h-3.5 w-3.5" />}>
          This is a safe space. AI moderation is active to protect you both.
        </SystemNotice>

        <div className="mt-5 space-y-4">
          {messages.map((m, index) => {
            if (m.kind === "reminder") {
              return (
                <SystemNotice key={m.id} icon={<Heart className="h-3.5 w-3.5 text-lavender" />} centered>
                  {m.text}
                </SystemNotice>
              );
            }

            const mine = m.from === "me";
            const showAvatar = !mine && (index === 0 || messages[index - 1]?.from === "me");

            return (
              <MessageBubble
                key={m.id}
                message={m}
                mine={mine}
                peerInitial={peerInitial}
                showAvatar={showAvatar}
                highlighted={highlightId === m.id}
                onReply={() => {
                  setEditing(null);
                  setReplyTo({ id: m.id, preview: messagePreview(m) });
                }}
                onEdit={() => {
                  setReplyTo(null);
                  setEditing({ id: m.id, text: m.text });
                }}
                onDelete={(scope) => void onDelete(m.id, scope)}
                onReact={(emoji) => void onReact(m.id, emoji)}
                onForward={() => setForwardMessageId(m.id)}
              />
            );
          })}

          {peerTyping && (
            <div className="flex items-end gap-2">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-secondary text-[11px] font-semibold text-muted-foreground">
                {peerInitial}
              </span>
              <div className="rounded-[20px] rounded-bl-md bg-secondary px-4 py-3">
                <span className="flex gap-1">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:300ms]" />
                </span>
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>
      </div>

      <ChatComposer
        conversationId={conversationId}
        disabled={sendMutation.isPending}
        blocked={Boolean(conversation.blocked)}
        replyTo={replyTo}
        editing={editing}
        onClearReply={() => setReplyTo(null)}
        onCancelEdit={() => setEditing(null)}
        onSendText={(text, replyToId) => sendMutation.mutate({ text, replyToId })}
        onSendImage={sendImage}
        onSendDocument={sendDocument}
        onSendVoice={sendVoice}
        onEditSave={onEditSave}
      />

      {showCrisis && <CrisisDialog onClose={() => setShowCrisis(false)} />}
      {safetyMode && (
        <SafetyActionDialog
          conversationId={conversationId}
          mode={safetyMode}
          onClose={() => setSafetyMode(null)}
          onDone={({ blocked }) => {
            if (blocked) {
              queryClient.setQueryData<ApiConversationDetail>(
                queryKeys.conversation(conversationId),
                (old) => (old ? { ...old, blocked: true, muted: true } : old),
              );
              void queryClient.invalidateQueries({ queryKey: ["conversations"] });
            }
          }}
        />
      )}
      {forwardMessageId && (
        <ForwardPicker
          conversationId={conversationId}
          messageId={forwardMessageId}
          onClose={() => setForwardMessageId(null)}
        />
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
        className="relative w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-elevated)]"
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
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {crisisResources.map((r) => (
            <li key={r.name} className="rounded-xl border border-border bg-background p-4">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{r.region}</p>
              <p className="mt-1 text-sm font-medium">{r.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{r.contact}</p>
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="btn-secondary mt-4">
                Learn more
              </a>
            </li>
          ))}
        </ul>
        <Link to="/support" onClick={onClose} className="link-muted mt-5 block text-center text-sm hover:text-sage">
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
