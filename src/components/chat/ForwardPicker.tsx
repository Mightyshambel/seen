import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useConversations } from "@/hooks/useApiQueries";
import { forwardMessage } from "@/lib/api/conversations";
import { ApiError } from "@/lib/api-client";

export function ForwardPicker({
  conversationId,
  messageId,
  onClose,
  onDone,
}: {
  conversationId: string;
  messageId: string;
  onClose: () => void;
  onDone?: () => void;
}) {
  const { data: conversations = [], isLoading } = useConversations();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const targets = useMemo(
    () =>
      conversations.filter(
        (c) =>
          c.id !== conversationId &&
          !c.blocked &&
          (!q.trim() || c.peerName.toLowerCase().includes(q.trim().toLowerCase())),
      ),
    [conversations, conversationId, q],
  );

  const forward = async (targetId: string) => {
    setBusyId(targetId);
    try {
      await forwardMessage(conversationId, messageId, targetId);
      toast("Message forwarded.");
      onDone?.();
      onClose();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Couldn't forward that message.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="forward-title"
        className="relative max-h-[80dvh] w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-elevated)]"
      >
        <div className="border-b border-border/60 px-5 py-4">
          <h2 id="forward-title" className="font-serif text-xl">
            Forward to…
          </h2>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search conversations"
            className="field-soft mt-3 w-full text-sm"
            aria-label="Search conversations"
          />
        </div>
        <ul className="max-h-[50dvh] overflow-y-auto py-1">
          {isLoading && (
            <li className="px-5 py-4 text-sm text-muted-foreground">Loading…</li>
          )}
          {!isLoading && targets.length === 0 && (
            <li className="px-5 py-4 text-sm text-muted-foreground">No other chats to forward to.</li>
          )}
          {targets.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                disabled={busyId !== null}
                onClick={() => void forward(c.id)}
                className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-surface-muted disabled:opacity-50"
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-sm font-semibold text-muted-foreground">
                  {c.peerName.charAt(0).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{c.peerName}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {busyId === c.id ? "Forwarding…" : c.lastMessagePreview || "Open chat"}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div className="border-t border-border/60 px-5 py-3">
          <button type="button" className="btn-secondary w-full" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
