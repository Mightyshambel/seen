import { useEffect, useRef, useState } from "react";
import { FileText, ImagePlus, Mic, Paperclip, Send, Smile, Square, Sticker, X } from "lucide-react";
import { toast } from "sonner";
import { EmojiPicker } from "@/components/chat/EmojiPicker";
import { GifPicker } from "@/components/chat/GifPicker";
import { formatDuration } from "@/lib/media";
import { sendTyping } from "@/lib/ws-client";

type PendingFile = {
  file: File;
  previewUrl?: string;
  kind: "image" | "document";
};

export function ChatComposer({
  conversationId,
  disabled,
  blocked,
  replyTo,
  editing,
  onClearReply,
  onCancelEdit,
  onSendText,
  onSendImage,
  onSendDocument,
  onSendVoice,
  onEditSave,
}: {
  conversationId: string;
  disabled?: boolean;
  blocked?: boolean;
  replyTo?: { id: string; preview: string } | null;
  editing?: { id: string; text: string } | null;
  onClearReply?: () => void;
  onCancelEdit?: () => void;
  onSendText: (text: string, replyToId?: string) => void;
  onSendImage: (file: File, caption: string, replyToId?: string) => Promise<void>;
  onSendDocument: (file: File, caption: string, replyToId?: string) => Promise<void>;
  onSendVoice: (blob: Blob, durationMs: number, replyToId?: string) => Promise<void>;
  onEditSave?: (messageId: string, text: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [gifOpen, setGifOpen] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [pending, setPending] = useState<PendingFile | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordMs, setRecordMs] = useState(0);
  const [sendingMedia, setSendingMedia] = useState(false);

  const imageRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordStartedAt = useRef(0);
  const recordTimer = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const typingTimer = useRef<number | null>(null);
  const typingActive = useRef(false);

  useEffect(() => {
    if (editing) {
      setDraft(editing.text);
      inputRef.current?.focus();
    }
  }, [editing]);

  useEffect(() => {
    return () => {
      if (pending?.previewUrl) URL.revokeObjectURL(pending.previewUrl);
      stopTracks();
      if (recordTimer.current) window.clearInterval(recordTimer.current);
      if (typingTimer.current) window.clearTimeout(typingTimer.current);
      if (typingActive.current) sendTyping(conversationId, false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopTracks = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const clearPending = () => {
    if (pending?.previewUrl) URL.revokeObjectURL(pending.previewUrl);
    setPending(null);
  };

  const pulseTyping = () => {
    if (blocked || disabled) return;
    if (!typingActive.current) {
      typingActive.current = true;
      sendTyping(conversationId, true);
    }
    if (typingTimer.current) window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(() => {
      typingActive.current = false;
      sendTyping(conversationId, false);
    }, 1500);
  };

  const insertEmoji = (emoji: string) => {
    const input = inputRef.current;
    if (!input) {
      setDraft((value) => value + emoji);
      return;
    }
    const start = input.selectionStart ?? draft.length;
    const end = input.selectionEnd ?? draft.length;
    const next = draft.slice(0, start) + emoji + draft.slice(end);
    setDraft(next);
    pulseTyping();
    requestAnimationFrame(() => {
      input.focus();
      const caret = start + emoji.length;
      input.setSelectionRange(caret, caret);
    });
  };

  const onPickImage = (file: File | undefined) => {
    if (!file) return;
    const type = file.type || (file.name.toLowerCase().endsWith(".gif") ? "image/gif" : "");
    if (!type.startsWith("image/")) {
      toast.error("Please choose an image or GIF.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Images need to be under 5MB.");
      return;
    }
    const normalized =
      type === file.type ? file : new File([file], file.name || "image.gif", { type });
    clearPending();
    setPending({ file: normalized, previewUrl: URL.createObjectURL(normalized), kind: "image" });
    setAttachOpen(false);
    setEmojiOpen(false);
    setGifOpen(false);
  };

  const onPickDoc = (file: File | undefined) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Files need to be under 10MB.");
      return;
    }
    clearPending();
    setPending({ file, kind: "document" });
    setAttachOpen(false);
    setEmojiOpen(false);
  };

  const send = async () => {
    if (disabled || sendingMedia || blocked) return;

    if (editing && onEditSave) {
      const text = draft.trim();
      if (!text) return;
      setSendingMedia(true);
      try {
        await onEditSave(editing.id, text);
        setDraft("");
        onCancelEdit?.();
      } catch {
        toast.error("Couldn't edit that message.");
      } finally {
        setSendingMedia(false);
      }
      return;
    }

    if (pending) {
      const caption = draft.trim();
      const file = pending.file;
      const kind = pending.kind;
      const replyToId = replyTo?.id;
      clearPending();
      setDraft("");
      onClearReply?.();
      setSendingMedia(true);
      try {
        if (kind === "image") await onSendImage(file, caption, replyToId);
        else await onSendDocument(file, caption, replyToId);
      } catch {
        toast.error(kind === "image" ? "Couldn't send that photo." : "Couldn't send that file.");
      } finally {
        setSendingMedia(false);
      }
      return;
    }

    const text = draft.trim();
    if (!text) return;
    setDraft("");
    onClearReply?.();
    if (typingActive.current) {
      typingActive.current = false;
      sendTyping(conversationId, false);
    }
    onSendText(text, replyTo?.id);
  };

  const startRecording = async () => {
    if (disabled || recording || pending || blocked || editing) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : undefined;
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        stopTracks();
        if (recordTimer.current) window.clearInterval(recordTimer.current);
        const durationMs = Date.now() - recordStartedAt.current;
        setRecording(false);
        setRecordMs(0);
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        if (blob.size < 500 || durationMs < 400) {
          toast.error("Hold a little longer to send a voice note.");
          return;
        }
        setSendingMedia(true);
        try {
          await onSendVoice(blob, durationMs, replyTo?.id);
          onClearReply?.();
        } catch {
          toast.error("Couldn't send that voice note.");
        } finally {
          setSendingMedia(false);
        }
      };
      mediaRecorderRef.current = recorder;
      recordStartedAt.current = Date.now();
      setRecordMs(0);
      setRecording(true);
      setEmojiOpen(false);
      recorder.start();
      recordTimer.current = window.setInterval(() => {
        setRecordMs(Date.now() - recordStartedAt.current);
      }, 200);
    } catch {
      toast.error("Microphone permission is needed for voice notes.");
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") recorder.stop();
  };

  const cancelRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder) {
      recorder.ondataavailable = null;
      recorder.onstop = () => {
        stopTracks();
        setRecording(false);
        setRecordMs(0);
      };
      if (recorder.state !== "inactive") recorder.stop();
      else {
        stopTracks();
        setRecording(false);
        setRecordMs(0);
      }
    }
    if (recordTimer.current) window.clearInterval(recordTimer.current);
  };

  const canSendText = Boolean(draft.trim()) || Boolean(pending) || Boolean(editing);
  const showMic = !canSendText && !recording && !editing;

  if (blocked) {
    return (
      <div className="border-t border-border/50 bg-card px-4 py-4 text-center text-sm text-muted-foreground">
        You’ve blocked this person. Messaging is turned off.
      </div>
    );
  }

  return (
    <div className="border-t border-border/50 bg-card px-3 py-3 md:px-6">
      {(replyTo || editing) && (
        <div className="mb-2 flex items-center gap-2 rounded-xl border border-border/60 bg-surface-muted px-3 py-2">
          <div className="min-w-0 flex-1 border-l-2 border-sage pl-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-sage">
              {editing ? "Edit message" : "Replying"}
            </p>
            <p className="truncate text-sm text-muted-foreground">
              {editing ? editing.text : replyTo?.preview}
            </p>
          </div>
          <button
            type="button"
            aria-label="Cancel"
            className="btn-ghost h-8 w-8 rounded-full"
            onClick={() => (editing ? onCancelEdit?.() : onClearReply?.())}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {pending && (
        <div className="mb-3 flex items-center gap-3 rounded-2xl border border-border/60 bg-surface-muted p-2">
          {pending.previewUrl ? (
            <img src={pending.previewUrl} alt="" className="h-14 w-14 rounded-xl object-cover" />
          ) : (
            <span className="grid h-14 w-14 place-items-center rounded-xl bg-card">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{pending.file.name}</p>
            <p className="text-xs text-muted-foreground">
              {pending.kind === "image" ? "Photo ready" : "File ready"}
            </p>
          </div>
          <button type="button" aria-label="Remove attachment" className="btn-ghost h-8 w-8 rounded-full" onClick={clearPending}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {recording ? (
        <div className="flex items-center gap-3">
          <button type="button" aria-label="Cancel recording" className="btn-ghost h-10 w-10 rounded-full" onClick={cancelRecording}>
            <X className="h-4 w-4" />
          </button>
          <div className="flex min-h-[46px] flex-1 items-center gap-3 rounded-full border border-clay/30 bg-clay-soft px-4">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-clay" />
            <span className="text-sm font-medium text-foreground">Recording… {formatDuration(recordMs)}</span>
          </div>
          <button
            type="button"
            aria-label="Send voice note"
            onClick={stopRecording}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-foreground text-background"
          >
            <Square className="h-3.5 w-3.5 fill-current" />
          </button>
        </div>
      ) : (
        <div className="relative flex items-end gap-2">
          <EmojiPicker open={emojiOpen} onClose={() => setEmojiOpen(false)} onPick={insertEmoji} />
          <GifPicker open={gifOpen} onClose={() => setGifOpen(false)} onPick={onPickImage} />
          {attachOpen && (
            <div className="absolute bottom-[calc(100%+0.5rem)] left-10 z-40 w-44 overflow-hidden rounded-2xl border border-border bg-card py-1 shadow-[var(--shadow-elevated)]">
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-surface-muted"
                onClick={() => {
                  setAttachOpen(false);
                  imageRef.current?.click();
                }}
              >
                <ImagePlus className="h-4 w-4" /> Photo
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-surface-muted"
                onClick={() => {
                  setAttachOpen(false);
                  setEmojiOpen(false);
                  setGifOpen(true);
                }}
              >
                <Sticker className="h-4 w-4" /> GIF
              </button>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-surface-muted"
                onClick={() => {
                  setAttachOpen(false);
                  docRef.current?.click();
                }}
              >
                <FileText className="h-4 w-4" /> Document
              </button>
            </div>
          )}

          <div className="flex min-h-[46px] flex-1 items-center gap-1 rounded-full border border-border/60 bg-surface-muted px-2 transition-all duration-300 focus-within:border-sage/30 focus-within:ring-[3px] focus-within:ring-sage/10">
            <button
              type="button"
              aria-label="Emoji"
              className="btn-ghost h-9 w-9 shrink-0 rounded-full"
              onClick={() => {
                setEmojiOpen((o) => !o);
                setAttachOpen(false);
                setGifOpen(false);
              }}
              disabled={disabled || sendingMedia}
            >
              <Smile className="h-[18px] w-[18px]" />
            </button>

            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                pulseTyping();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              placeholder={
                editing ? "Edit message…" : pending ? "Add a caption…" : replyTo ? "Write a reply…" : "Message"
              }
              aria-label="Message"
              disabled={disabled || sendingMedia}
              className="w-full bg-transparent py-3 text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
            />

            {!editing && (
              <button
                type="button"
                aria-label="Attach"
                className="btn-ghost h-9 w-9 shrink-0 rounded-full"
                onClick={() => {
                  setAttachOpen((o) => !o);
                  setEmojiOpen(false);
                  setGifOpen(false);
                }}
                disabled={disabled || sendingMedia}
              >
                <Paperclip className="h-[18px] w-[18px]" />
              </button>
            )}
            <input
              ref={imageRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,.gif"
              className="hidden"
              onChange={(e) => {
                onPickImage(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <input
              ref={docRef}
              type="file"
              accept=".pdf,.txt,.doc,.docx,application/pdf,text/plain"
              className="hidden"
              onChange={(e) => {
                onPickDoc(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>

          {showMic ? (
            <button
              type="button"
              aria-label="Record voice note"
              onClick={() => void startRecording()}
              disabled={disabled || sendingMedia}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-foreground text-background shadow-[0_8px_20px_-8px_oklch(0.24_0.02_268_/_0.35)] transition-all hover:-translate-y-0.5 disabled:opacity-35"
            >
              <Mic className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              aria-label="Send message"
              onClick={() => void send()}
              disabled={disabled || sendingMedia || !canSendText}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-foreground text-background shadow-[0_8px_20px_-8px_oklch(0.24_0.02_268_/_0.35)] transition-all hover:-translate-y-0.5 disabled:opacity-35"
            >
              <Send className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
