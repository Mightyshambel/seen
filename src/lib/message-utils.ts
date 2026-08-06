import type { ApiMessage } from "@/lib/api/types";
import type { Message } from "@/lib/mock";

export function formatMessageTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function wireMessage(message: ApiMessage): Message {
  return {
    id: message.id,
    from: message.from ?? "peer",
    text: message.text,
    time: formatMessageTime(message.time),
    kind: (message.kind as Message["kind"]) ?? undefined,
    mediaUrl: message.mediaUrl ?? undefined,
    durationMs: message.durationMs ?? undefined,
    fileName: message.fileName ?? undefined,
    replyToId: message.replyToId ?? undefined,
    replyPreview: message.replyPreview ?? undefined,
    editedAt: message.editedAt ?? undefined,
    deleted: message.deleted ?? false,
    forwarded: message.forwarded ?? false,
    reactions: message.reactions ?? [],
    readByPeer: message.readByPeer ?? undefined,
  };
}

export function formatConversationTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  if (sameDay) {
    return formatMessageTime(value);
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}
