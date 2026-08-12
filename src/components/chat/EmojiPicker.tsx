import { useEffect, useRef } from "react";

const EMOJIS = [
  "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇",
  "🙂", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋",
  "😜", "😝", "😛", "🤑", "🤗", "🤭", "🤫", "🤔", "🤐", "🤨",
  "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "😮", "😯", "😲",
  "😳", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "😈", "👿",
  "💀", "☠️", "💩", "🤡", "👻", "👽", "🤖", "😺", "😸", "😹",
  "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔",
  "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "👍", "👎",
  "👏", "🙌", "👐", "🤝", "🙏", "✌️", "🤞", "🤟", "🤘", "👌",
  "🤌", "🤏", "👈", "👉", "👆", "👇", "☝️", "👋", "🤚", "🔥",
  "⭐", "🌟", "✨", "💫", "🎉", "🎊", "🎈", "🎁", "🏆", "🌸",
  "🌹", "🌻", "🌈", "☀️", "🌙", "⚡", "🌊", "🍀", "🌿", "☕",
];

export function EmojiPicker({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (emoji: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="absolute bottom-[calc(100%+0.5rem)] left-0 z-40 w-[min(100%,20rem)] rounded-2xl border border-border bg-card p-2 shadow-[var(--shadow-elevated)]"
      role="listbox"
      aria-label="Emoji picker"
    >
      <div className="grid max-h-52 grid-cols-8 gap-0.5 overflow-y-auto p-1">
        {EMOJIS.map((emoji, index) => (
          <button
            key={`${emoji}-${index}`}
            type="button"
            className="grid h-9 w-9 place-items-center rounded-lg text-lg transition-colors hover:bg-surface-muted"
            onClick={() => {
              onPick(emoji);
            }}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
