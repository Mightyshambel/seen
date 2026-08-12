import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { ReportCategory } from "@/lib/api/types";
import { blockConversationPeer, reportConversation } from "@/lib/api/conversations";
import { ApiError } from "@/lib/api-client";

const REASONS: { value: ReportCategory; label: string; hint: string }[] = [
  { value: "harassment", label: "Harassment", hint: "Threats, insults, or intimidation" },
  { value: "spam", label: "Spam", hint: "Repeated unwanted or bot-like messages" },
  { value: "solicitation", label: "Solicitation", hint: "Money, dating, or off-platform contact" },
  { value: "misuse", label: "Misuse of Seen", hint: "Using peer support for the wrong purpose" },
  { value: "other", label: "Other", hint: "Something else — describe it below" },
];

export function SafetyActionDialog({
  conversationId,
  mode,
  onClose,
  onDone,
}: {
  conversationId: string;
  mode: "report" | "block";
  onClose: () => void;
  onDone?: (result: { blocked: boolean }) => void;
}) {
  const [selected, setSelected] = useState<ReportCategory[]>(["misuse"]);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const toggle = (value: ReportCategory) => {
    setSelected((current) => {
      if (current.includes(value)) {
        const next = current.filter((item) => item !== value);
        return next.length === 0 ? current : next;
      }
      return [...current, value];
    });
  };

  const buildReason = () => {
    const labels = REASONS.filter((item) => selected.includes(item.value)).map((item) => item.label);
    const parts = [`Reasons: ${labels.join(", ")}`];
    if (note.trim()) parts.push(note.trim());
    return parts.join("\n");
  };

  const submit = async () => {
    if (selected.includes("other") && !note.trim()) {
      toast.error("Please write a short note for “Other”.");
      return;
    }

    setBusy(true);
    try {
      const category = selected.includes("other")
        ? "other"
        : selected[0] ?? "misuse";
      await reportConversation(conversationId, {
        category,
        reason: buildReason(),
      });

      let blocked = false;
      if (mode === "block") {
        await blockConversationPeer(conversationId);
        blocked = true;
        toast("Reported and blocked. They can’t message you here anymore.");
      } else {
        toast("Report submitted. Our team will review quietly.");
      }

      onDone?.({ blocked });
      onClose();
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : mode === "block"
            ? "Couldn't complete that block."
            : "Couldn't send that report.",
      );
    } finally {
      setBusy(false);
    }
  };

  const title = mode === "block" ? "Block & report" : "Report quietly";
  const subtitle =
    mode === "block"
      ? "Choose why you’re blocking them. We’ll also file a quiet report — they won’t be told."
      : "Choose what feels off. They won’t be notified.";
  const cta = mode === "block" ? "Block & report" : "Submit report";

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
        aria-labelledby="safety-dialog-title"
        className="relative max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-elevated)]"
      >
        <h2 id="safety-dialog-title" className="font-serif text-2xl">
          {title}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>

        <fieldset className="mt-5 space-y-2">
          <legend className="sr-only">Reasons</legend>
          {REASONS.map((item) => {
            const checked = selected.includes(item.value);
            return (
              <label
                key={item.value}
                className={
                  "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors " +
                  (checked ? "border-sage bg-sage-soft" : "border-border hover:bg-surface-muted")
                }
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(item.value)}
                  className="mt-1 h-4 w-4 rounded border-border accent-[var(--palette-sage)]"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-foreground">{item.label}</span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{item.hint}</span>
                </span>
              </label>
            );
          })}
        </fieldset>

        <label className="mt-4 block">
          <span className="text-xs font-medium text-muted-foreground">
            {selected.includes("other") ? "Describe what happened" : "Add details (optional)"}
          </span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="Write the reason in your own words…"
            className="field-soft mt-1.5 w-full resize-none text-sm"
            required={selected.includes("other")}
          />
        </label>

        <div className="mt-5 flex gap-3">
          <button type="button" className="btn-secondary flex-1" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary flex-1"
            onClick={() => void submit()}
            disabled={busy || selected.length === 0}
          >
            {busy ? "Working…" : cta}
          </button>
        </div>
      </div>
    </div>
  );
}
