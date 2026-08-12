import { create } from "zustand";
import type { CallHangupReason, CallMedia } from "@/lib/ws-client";

export type CallPhase = "idle" | "outgoing" | "incoming" | "connecting" | "active" | "ended";

export type CallHistoryEntry = {
  id: string;
  conversationId: string;
  peerName: string;
  media: CallMedia;
  direction: "out" | "in";
  outcome: "answered" | "missed" | "rejected" | "failed";
  at: string;
  durationSec?: number;
};

type CallState = {
  phase: CallPhase;
  callId: string | null;
  conversationId: string | null;
  peerName: string;
  media: CallMedia;
  muted: boolean;
  cameraOff: boolean;
  startedAt: number | null;
  endedReason: CallHangupReason | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  history: CallHistoryEntry[];
  setPhase: (phase: CallPhase) => void;
  setStreams: (local: MediaStream | null, remote: MediaStream | null) => void;
  setMuted: (muted: boolean) => void;
  setCameraOff: (off: boolean) => void;
  beginOutgoing: (input: {
    callId: string;
    conversationId: string;
    peerName: string;
    media: CallMedia;
  }) => void;
  beginIncoming: (input: {
    callId: string;
    conversationId: string;
    peerName: string;
    media: CallMedia;
  }) => void;
  markConnecting: () => void;
  markActive: () => void;
  endCall: (reason?: CallHangupReason) => void;
  reset: () => void;
  pushHistory: (entry: Omit<CallHistoryEntry, "id" | "at"> & { id?: string; at?: string }) => void;
};

const HISTORY_KEY = "seen.call.history";

function loadHistory(): CallHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CallHistoryEntry[];
    return Array.isArray(parsed) ? parsed.slice(0, 40) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: CallHistoryEntry[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, 40)));
  } catch {
    // ignore quota
  }
}

export const useCallStore = create<CallState>((set, get) => ({
  phase: "idle",
  callId: null,
  conversationId: null,
  peerName: "",
  media: "audio",
  muted: false,
  cameraOff: false,
  startedAt: null,
  endedReason: null,
  localStream: null,
  remoteStream: null,
  history: typeof window !== "undefined" ? loadHistory() : [],

  setPhase: (phase) => set({ phase }),
  setStreams: (localStream, remoteStream) => set({ localStream, remoteStream }),
  setMuted: (muted) => set({ muted }),
  setCameraOff: (cameraOff) => set({ cameraOff }),

  beginOutgoing: ({ callId, conversationId, peerName, media }) =>
    set({
      phase: "outgoing",
      callId,
      conversationId,
      peerName,
      media,
      muted: false,
      cameraOff: false,
      startedAt: null,
      endedReason: null,
    }),

  beginIncoming: ({ callId, conversationId, peerName, media }) =>
    set({
      phase: "incoming",
      callId,
      conversationId,
      peerName,
      media,
      muted: false,
      cameraOff: false,
      startedAt: null,
      endedReason: null,
    }),

  markConnecting: () => set({ phase: "connecting" }),
  markActive: () => set({ phase: "active", startedAt: Date.now() }),

  endCall: (reason = "hangup") => {
    const state = get();
    if (state.phase === "idle") return;

    const durationSec =
      state.startedAt != null ? Math.max(0, Math.round((Date.now() - state.startedAt) / 1000)) : undefined;

    let outcome: CallHistoryEntry["outcome"] = "answered";
    if (state.phase === "incoming" && (reason === "timeout" || reason === "hangup")) outcome = "missed";
    if (reason === "reject") outcome = "rejected";
    if (reason === "failed" || reason === "busy") outcome = "failed";
    if (state.phase === "outgoing" && reason !== "hangup") outcome = reason === "reject" ? "rejected" : "missed";

    if (state.conversationId && state.callId) {
      get().pushHistory({
        id: state.callId,
        conversationId: state.conversationId,
        peerName: state.peerName || "Peer",
        media: state.media,
        direction: state.phase === "incoming" ? "in" : "out",
        outcome: state.phase === "active" || state.phase === "connecting" ? "answered" : outcome,
        durationSec,
      });
    }

    set({
      phase: "ended",
      endedReason: reason,
      localStream: null,
      remoteStream: null,
      startedAt: null,
    });
  },

  reset: () =>
    set({
      phase: "idle",
      callId: null,
      conversationId: null,
      peerName: "",
      media: "audio",
      muted: false,
      cameraOff: false,
      startedAt: null,
      endedReason: null,
      localStream: null,
      remoteStream: null,
    }),

  pushHistory: (entry) => {
    const next: CallHistoryEntry = {
      id: entry.id ?? crypto.randomUUID(),
      at: entry.at ?? new Date().toISOString(),
      conversationId: entry.conversationId,
      peerName: entry.peerName,
      media: entry.media,
      direction: entry.direction,
      outcome: entry.outcome,
      durationSec: entry.durationSec,
    };
    const history = [next, ...get().history.filter((h) => h.id !== next.id)].slice(0, 40);
    saveHistory(history);
    set({ history });
  },
}));
