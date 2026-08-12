import { toast } from "sonner";
import { useCallStore } from "@/stores/call";
import {
  fetchIceServers,
  sendCallAnswer,
  sendCallHangup,
  sendCallIce,
  sendCallOffer,
  sendCallRing,
  subscribeWs,
  type CallHangupReason,
  type CallMedia,
  type WsEvent,
} from "@/lib/ws-client";

let pc: RTCPeerConnection | null = null;
let localStream: MediaStream | null = null;
let remoteStream: MediaStream | null = null;
let pendingOffer: RTCSessionDescriptionInit | null = null;
let pendingIce: RTCIceCandidateInit[] = [];
let ringTimeout: number | null = null;
let endedResetTimer: number | null = null;
let started = false;

function clearRingTimeout() {
  if (ringTimeout != null) {
    window.clearTimeout(ringTimeout);
    ringTimeout = null;
  }
}

function scheduleReset() {
  if (endedResetTimer != null) window.clearTimeout(endedResetTimer);
  endedResetTimer = window.setTimeout(() => {
    useCallStore.getState().reset();
  }, 1200);
}

function stopTracks(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

async function ensureLocalMedia(media: CallMedia) {
  if (localStream) return localStream;
  localStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: media === "video",
  });
  useCallStore.getState().setStreams(localStream, remoteStream);
  return localStream;
}

async function ensurePeerConnection(conversationId: string, callId: string) {
  if (pc) return pc;
  const iceServers = await fetchIceServers();
  pc = new RTCPeerConnection({ iceServers });

  remoteStream = new MediaStream();
  useCallStore.getState().setStreams(localStream, remoteStream);

  pc.onicecandidate = (event) => {
    sendCallIce(conversationId, callId, event.candidate ? event.candidate.toJSON() : null);
  };

  pc.ontrack = (event) => {
    event.streams[0]?.getTracks().forEach((track) => {
      remoteStream?.addTrack(track);
    });
    if (!event.streams[0] && event.track) {
      remoteStream?.addTrack(event.track);
    }
    useCallStore.getState().setStreams(localStream, remoteStream);
    if (useCallStore.getState().phase === "connecting") {
      useCallStore.getState().markActive();
    }
  };

  pc.onconnectionstatechange = () => {
    const state = pc?.connectionState;
    if (state === "connected") {
      useCallStore.getState().markActive();
    }
    if (state === "failed" || state === "disconnected") {
      void hangUp("failed");
    }
  };

  return pc;
}

async function attachLocalTracks(media: CallMedia, conversationId: string, callId: string) {
  const stream = await ensureLocalMedia(media);
  const connection = await ensurePeerConnection(conversationId, callId);
  for (const track of stream.getTracks()) {
    const already = connection.getSenders().some((sender) => sender.track?.id === track.id);
    if (!already) connection.addTrack(track, stream);
  }
}

async function flushPendingIce() {
  if (!pc || !pendingIce.length) return;
  const queued = [...pendingIce];
  pendingIce = [];
  for (const candidate of queued) {
    try {
      await pc.addIceCandidate(candidate);
    } catch {
      // ignore late/invalid candidates
    }
  }
}

export async function startCall(input: {
  conversationId: string;
  peerName: string;
  media: CallMedia;
}) {
  const store = useCallStore.getState();
  if (store.phase !== "idle" && store.phase !== "ended") {
    toast.error("You're already in a call.");
    return;
  }

  const callId = crypto.randomUUID();
  store.beginOutgoing({
    callId,
    conversationId: input.conversationId,
    peerName: input.peerName,
    media: input.media,
  });

  try {
    await attachLocalTracks(input.media, input.conversationId, callId);
    sendCallRing(input.conversationId, callId, input.media);

    const connection = await ensurePeerConnection(input.conversationId, callId);
    const offer = await connection.createOffer();
    await connection.setLocalDescription(offer);
    sendCallOffer(input.conversationId, callId, offer.sdp || "", input.media);

    clearRingTimeout();
    ringTimeout = window.setTimeout(() => {
      void hangUp("timeout");
    }, 45000);
  } catch {
    toast.error("Couldn't start the call. Check microphone/camera permission.");
    cleanupLocal(false);
    store.endCall("failed");
    scheduleReset();
  }
}

export async function acceptCall() {
  const store = useCallStore.getState();
  if (store.phase !== "incoming" || !store.callId || !store.conversationId) return;

  store.markConnecting();
  clearRingTimeout();

  try {
    await attachLocalTracks(store.media, store.conversationId, store.callId);
    const connection = await ensurePeerConnection(store.conversationId, store.callId);

    if (pendingOffer) {
      await connection.setRemoteDescription(pendingOffer);
      pendingOffer = null;
      await flushPendingIce();
      const answer = await connection.createAnswer();
      await connection.setLocalDescription(answer);
      sendCallAnswer(store.conversationId, store.callId, answer.sdp || "");
    }
  } catch {
    toast.error("Couldn't answer the call. Check microphone/camera permission.");
    void hangUp("failed");
  }
}

export function rejectCall() {
  const store = useCallStore.getState();
  if (!store.callId || !store.conversationId) return;
  sendCallHangup(store.conversationId, store.callId, "reject");
  cleanupLocal(false);
  store.endCall("reject");
  scheduleReset();
}

export async function hangUp(reason: CallHangupReason = "hangup") {
  const store = useCallStore.getState();
  if (!store.callId || !store.conversationId) {
    cleanupLocal(false);
    store.reset();
    return;
  }
  if (store.phase === "idle" || store.phase === "ended") return;

  sendCallHangup(store.conversationId, store.callId, reason);
  cleanupLocal(false);
  store.endCall(reason);
  scheduleReset();
}

export function toggleMute() {
  const store = useCallStore.getState();
  const next = !store.muted;
  localStream?.getAudioTracks().forEach((track) => {
    track.enabled = !next;
  });
  store.setMuted(next);
}

export function toggleCamera() {
  const store = useCallStore.getState();
  if (store.media !== "video") return;
  const next = !store.cameraOff;
  localStream?.getVideoTracks().forEach((track) => {
    track.enabled = !next;
  });
  store.setCameraOff(next);
}

function cleanupLocal(resetStore: boolean) {
  clearRingTimeout();
  pendingOffer = null;
  pendingIce = [];
  try {
    pc?.close();
  } catch {
    // ignore
  }
  pc = null;
  stopTracks(localStream);
  localStream = null;
  remoteStream = null;
  if (resetStore) useCallStore.getState().reset();
  else useCallStore.getState().setStreams(null, null);
}

async function onSignal(event: WsEvent) {
  if (!event.type.startsWith("call.")) return;

  const store = useCallStore.getState();

  if (event.type === "call.ring") {
    if (store.phase !== "idle" && store.phase !== "ended") {
      sendCallHangup(event.conversationId, event.callId, "busy");
      return;
    }
    store.beginIncoming({
      callId: event.callId,
      conversationId: event.conversationId,
      peerName: event.peerName || "Peer",
      media: event.media === "video" ? "video" : "audio",
    });
    clearRingTimeout();
    ringTimeout = window.setTimeout(() => {
      void hangUp("timeout");
    }, 45000);
    return;
  }

  if (event.type === "call.offer") {
    if (store.callId && store.callId !== event.callId) return;
    pendingOffer = { type: "offer", sdp: event.sdp };

    // Callee accepted before the offer arrived — finish the handshake now.
    if (
      (store.phase === "connecting" || store.phase === "active") &&
      store.conversationId &&
      store.callId
    ) {
      try {
        const connection = await ensurePeerConnection(store.conversationId, store.callId);
        if (!connection.currentRemoteDescription) {
          await connection.setRemoteDescription(pendingOffer);
          pendingOffer = null;
          await flushPendingIce();
          const answer = await connection.createAnswer();
          await connection.setLocalDescription(answer);
          sendCallAnswer(store.conversationId, store.callId, answer.sdp || "");
        }
      } catch {
        void hangUp("failed");
      }
    }
    return;
  }

  if (event.type === "call.answer") {
    if (!pc || !store.callId || store.callId !== event.callId) return;
    clearRingTimeout();
    store.markConnecting();
    try {
      await pc.setRemoteDescription({ type: "answer", sdp: event.sdp });
      await flushPendingIce();
    } catch {
      void hangUp("failed");
    }
    return;
  }

  if (event.type === "call.ice") {
    if (store.callId && store.callId !== event.callId) return;
    if (!event.candidate) return;
    if (!pc || !pc.remoteDescription) {
      pendingIce.push(event.candidate);
      return;
    }
    try {
      await pc.addIceCandidate(event.candidate);
    } catch {
      // ignore
    }
    return;
  }

  if (event.type === "call.hangup") {
    if (store.callId && store.callId !== event.callId) return;
    if (store.phase === "idle" || store.phase === "ended") return;
    cleanupLocal(false);
    store.endCall(event.reason || "hangup");
    scheduleReset();
  }
}

export function startCallController() {
  if (started) return () => undefined;
  started = true;
  const unsubscribe = subscribeWs((event) => {
    void onSignal(event);
  });
  return () => {
    started = false;
    unsubscribe();
    cleanupLocal(true);
  };
}

/** When ringing, attach a better peer name if we know it from the conversation list. */
export function setIncomingPeerName(peerName: string) {
  const store = useCallStore.getState();
  if (store.phase === "incoming" && peerName) {
    useCallStore.setState({ peerName });
  }
}
