import { toast } from "sonner";
import type { ApiMessage } from "@/lib/api/types";
import { useAuthStore } from "@/stores/auth";
import { useSettings } from "@/stores/settings";

/** Mirrors backend low/high distress cues — used only for soft peer-side nudges. */
const HEAVY_HINTS = [
  "kill myself",
  "hurt myself",
  "suicide",
  "end it",
  "don't want to be here",
  "do not want to be here",
] as const;

const recentlySentIds = new Set<string>();
const SENT_TTL_MS = 60_000;

function previewText(text: string) {
  const trimmed = text.trim();
  if (trimmed.length <= 80) return trimmed;
  return `${trimmed.slice(0, 77)}…`;
}

function viewingConversation(conversationId: string) {
  return window.location.pathname === `/chat/${conversationId}`;
}

function canUseBrowserNotification() {
  return typeof Notification !== "undefined" && Notification.permission === "granted";
}

function looksHeavy(text: string) {
  const lowered = text.toLowerCase();
  return HEAVY_HINTS.some((hint) => lowered.includes(hint));
}

/** Call after a successful send so we never toast our own outbound message. */
export function rememberSentMessage(messageId: string) {
  recentlySentIds.add(messageId);
  window.setTimeout(() => {
    recentlySentIds.delete(messageId);
  }, SENT_TTL_MS);
}

function isOwnOutboundMessage(message: ApiMessage, senderId?: string) {
  const myId = useAuthStore.getState().user?.id;
  if (myId && senderId && senderId === myId) return true;
  if (message.from === "me") return true;
  if (recentlySentIds.has(message.id)) return true;
  return false;
}

function isPeerChatMessage(message: ApiMessage, senderId?: string) {
  if (isOwnOutboundMessage(message, senderId)) return false;
  if (message.from !== "peer") return false;
  if (message.kind === "reminder" || message.kind === "grounding" || message.kind === "prompt") {
    return false;
  }
  return Boolean(message.text?.trim() || message.mediaUrl);
}

export async function ensureNotificationPermission() {
  if (typeof Notification === "undefined") return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

/** Only for messages from the other person — never the signed-in user's own sends. */
export function notifyIncomingMessage(
  conversationId: string,
  message: ApiMessage,
  senderId?: string,
) {
  if (!isPeerChatMessage(message, senderId)) return;

  const settings = useSettings.getState();

  if (settings.notifyGentleNudges && message.text && looksHeavy(message.text)) {
    toast("This exchange feels heavy. It’s okay to pause and take a breath.", {
      id: `nudge-${conversationId}`,
    });
  }

  if (!settings.notifyNewMessage) return;
  if (viewingConversation(conversationId)) return;

  const body =
    message.kind === "image"
      ? "📷 Photo"
      : message.kind === "voice"
        ? "🎤 Voice message"
        : previewText(message.text || "New message");
  const title = "New message on Seen";

  if (document.visibilityState === "hidden" && canUseBrowserNotification()) {
    try {
      const notification = new Notification(title, {
        body,
        tag: `seen-message-${conversationId}`,
      });
      notification.onclick = () => {
        window.focus();
        window.location.assign(`/chat/${conversationId}`);
        notification.close();
      };
      return;
    } catch {
      // fall through to in-app toast
    }
  }

  toast(title, {
    id: `msg-${conversationId}-${message.id}`,
    description: body,
    action: {
      label: "Open",
      onClick: () => {
        window.location.assign(`/chat/${conversationId}`);
      },
    },
  });
}
