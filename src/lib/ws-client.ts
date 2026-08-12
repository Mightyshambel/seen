import { BASE_URL, api, ensureRefreshedToken, getAccessToken } from "@/lib/api-client";
import type { ApiMessage } from "@/lib/api/types";

type WsHandler = (event: WsEvent) => void;

export type CallMedia = "audio" | "video";

export type CallHangupReason = "hangup" | "busy" | "reject" | "failed" | "timeout";

export type WsEvent =
  | { type: "message.new"; conversationId: string; senderId?: string; message: ApiMessage }
  | { type: "message.updated"; conversationId: string; message: ApiMessage }
  | { type: "message.deleted"; conversationId: string; messageId: string; scope?: string }
  | { type: "message.reaction"; conversationId: string; message: ApiMessage }
  | { type: "message.read"; conversationId: string; userId?: string; readAt?: string; unread?: number }
  | { type: "typing"; conversationId: string; userId?: string; isTyping?: boolean }
  | { type: "match.found"; match: unknown }
  | {
      type: "call.ring";
      conversationId: string;
      callId: string;
      media?: CallMedia;
      fromUserId?: string;
      peerName?: string;
    }
  | {
      type: "call.offer";
      conversationId: string;
      callId: string;
      sdp: string;
      media?: CallMedia;
      fromUserId?: string;
    }
  | {
      type: "call.answer";
      conversationId: string;
      callId: string;
      sdp: string;
      fromUserId?: string;
    }
  | {
      type: "call.ice";
      conversationId: string;
      callId: string;
      candidate: RTCIceCandidateInit | null;
      fromUserId?: string;
    }
  | {
      type: "call.hangup";
      conversationId: string;
      callId: string;
      reason?: CallHangupReason;
      fromUserId?: string;
    };

let socket: WebSocket | null = null;
let handlers = new Set<WsHandler>();
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

function wsUrl() {
  const base = BASE_URL.replace(/^http/, "ws");
  return `${base}/ws`;
}

async function getTicket() {
  const data = await api<{ ticket: string; expiresIn: number }>("/ws/ticket", { method: "POST" });
  return data.ticket;
}

function dispatch(event: WsEvent) {
  for (const handler of handlers) {
    handler(event);
  }
}

async function connectInternal() {
  if (socket?.readyState === WebSocket.OPEN || socket?.readyState === WebSocket.CONNECTING) {
    return;
  }

  const token = await ensureRefreshedToken();
  if (!token) {
    return;
  }

  const ticket = await getTicket();
  socket = new WebSocket(wsUrl());

  socket.onopen = () => {
    socket?.send(JSON.stringify({ type: "auth", ticket }));
  };

  socket.onmessage = (message) => {
    try {
      const data = JSON.parse(message.data as string) as { type: string; [key: string]: unknown };
      if (data.type === "auth.ok") {
        return;
      }
      dispatch(data as WsEvent);
    } catch {
      // ignore malformed frames
    }
  };

  socket.onclose = () => {
    socket = null;
    if (getAccessToken()) {
      reconnectTimer = setTimeout(() => {
        void connectInternal();
      }, 3000);
    }
  };
}

export function sendWs(payload: Record<string, unknown>) {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
  }
}

export function sendTyping(conversationId: string, isTyping: boolean) {
  sendWs({ type: "typing", conversationId, isTyping });
}

export function sendCallRing(conversationId: string, callId: string, media: CallMedia) {
  sendWs({ type: "call.ring", conversationId, callId, media });
}

export function sendCallOffer(
  conversationId: string,
  callId: string,
  sdp: string,
  media: CallMedia,
) {
  sendWs({ type: "call.offer", conversationId, callId, sdp, media });
}

export function sendCallAnswer(conversationId: string, callId: string, sdp: string) {
  sendWs({ type: "call.answer", conversationId, callId, sdp });
}

export function sendCallIce(
  conversationId: string,
  callId: string,
  candidate: RTCIceCandidateInit | null,
) {
  sendWs({ type: "call.ice", conversationId, callId, candidate });
}

export function sendCallHangup(
  conversationId: string,
  callId: string,
  reason: CallHangupReason = "hangup",
) {
  sendWs({ type: "call.hangup", conversationId, callId, reason });
}

export function subscribeWs(handler: WsHandler) {
  handlers.add(handler);
  return () => {
    handlers.delete(handler);
  };
}

export function connectWs() {
  void connectInternal();
}

export function disconnectWs() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  handlers.clear();
  socket?.close();
  socket = null;
}

export async function fetchIceServers(): Promise<RTCIceServer[]> {
  try {
    const data = await api<{ iceServers: RTCIceServer[] }>("/calls/ice-servers");
    return data.iceServers?.length
      ? data.iceServers
      : [{ urls: "stun:stun.l.google.com:19302" }];
  } catch {
    return [{ urls: "stun:stun.l.google.com:19302" }];
  }
}
