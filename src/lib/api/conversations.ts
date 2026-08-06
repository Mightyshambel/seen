import { api, apiFormData } from "@/lib/api-client";
import type {
  ApiConversationDetail,
  ApiConversationSummary,
  ApiMessage,
  MessageSendResponse,
  ReportCategory,
} from "@/lib/api/types";

export async function listConversations(params?: { q?: string; saved?: boolean; unread?: boolean }) {
  const search = new URLSearchParams();
  if (params?.q) search.set("q", params.q);
  if (params?.saved) search.set("saved", "true");
  if (params?.unread) search.set("unread", "true");
  const query = search.toString();
  const data = await api<{ conversations: ApiConversationSummary[] }>(
    `/conversations${query ? `?${query}` : ""}`,
  );
  return data.conversations;
}

export async function getConversation(conversationId: string) {
  return api<ApiConversationDetail>(`/conversations/${conversationId}`);
}

export async function markConversationRead(conversationId: string) {
  return api<ApiConversationDetail>(`/conversations/${conversationId}/read`, { method: "POST" });
}

export async function toggleConversationSaved(conversationId: string) {
  return api<{ saved: boolean; savedConversationIds: string[] }>(
    `/conversations/${conversationId}/save`,
    { method: "POST" },
  );
}

export async function toggleConversationMute(conversationId: string) {
  return api<{ muted: boolean }>(`/conversations/${conversationId}/mute`, { method: "POST" });
}

export async function blockConversationPeer(conversationId: string) {
  return api<{ blocked: boolean }>(`/conversations/${conversationId}/block`, { method: "POST" });
}

export async function sendMessage(
  conversationId: string,
  text: string,
  options?: { clientMessageId?: string; replyToId?: string },
) {
  return api<MessageSendResponse>(`/conversations/${conversationId}/messages`, {
    method: "POST",
    body: JSON.stringify({
      text,
      clientMessageId: options?.clientMessageId,
      replyToId: options?.replyToId,
    }),
  });
}

export async function sendMediaMessage(
  conversationId: string,
  file: Blob,
  options: {
    kind: "image" | "voice" | "document";
    filename: string;
    caption?: string;
    durationMs?: number;
    clientMessageId?: string;
    replyToId?: string;
  },
) {
  const form = new FormData();
  form.append("file", file, options.filename);
  form.append("kind", options.kind);
  if (options.caption) form.append("caption", options.caption);
  if (options.durationMs != null) form.append("duration_ms", String(options.durationMs));
  if (options.clientMessageId) form.append("client_message_id", options.clientMessageId);
  if (options.replyToId) form.append("reply_to_id", options.replyToId);
  return apiFormData<MessageSendResponse>(`/conversations/${conversationId}/messages/media`, form);
}

export async function editMessage(conversationId: string, messageId: string, text: string) {
  return api<ApiMessage>(`/conversations/${conversationId}/messages/${messageId}`, {
    method: "PATCH",
    body: JSON.stringify({ text }),
  });
}

export async function deleteMessage(
  conversationId: string,
  messageId: string,
  scope: "me" | "everyone",
) {
  return api<{ messageId: string; scope: string; deleted: boolean }>(
    `/conversations/${conversationId}/messages/${messageId}?scope=${scope}`,
    { method: "DELETE" },
  );
}

export async function reactToMessage(conversationId: string, messageId: string, emoji: string) {
  return api<ApiMessage>(`/conversations/${conversationId}/messages/${messageId}/reactions`, {
    method: "POST",
    body: JSON.stringify({ emoji }),
  });
}

export async function forwardMessage(
  conversationId: string,
  messageId: string,
  targetConversationId: string,
) {
  return api<ApiMessage>(`/conversations/${conversationId}/messages/${messageId}/forward`, {
    method: "POST",
    body: JSON.stringify({ conversationId: targetConversationId }),
  });
}

export async function reportConversation(
  conversationId: string,
  options?: { reason?: string; category?: ReportCategory },
) {
  return api<{ id: string }>(`/conversations/${conversationId}/report`, {
    method: "POST",
    body: JSON.stringify({
      reason: options?.reason,
      category: options?.category,
    }),
  });
}
