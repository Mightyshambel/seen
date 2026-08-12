import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Video,
  VideoOff,
} from "lucide-react";
import {
  acceptCall,
  hangUp,
  rejectCall,
  setIncomingPeerName,
  startCallController,
  toggleCamera,
  toggleMute,
} from "@/lib/call-controller";
import { queryKeys } from "@/hooks/useApiQueries";
import type { ApiConversationDetail, ApiConversationSummary } from "@/lib/api/types";
import { useCallStore } from "@/stores/call";
import { cn } from "@/lib/utils";

function formatElapsed(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function CallOverlayHost() {
  useEffect(() => startCallController(), []);

  const phase = useCallStore((s) => s.phase);
  if (phase === "idle") return null;
  return <CallOverlay />;
}

function CallOverlay() {
  const queryClient = useQueryClient();
  const phase = useCallStore((s) => s.phase);
  const peerName = useCallStore((s) => s.peerName);
  const media = useCallStore((s) => s.media);
  const muted = useCallStore((s) => s.muted);
  const cameraOff = useCallStore((s) => s.cameraOff);
  const startedAt = useCallStore((s) => s.startedAt);
  const conversationId = useCallStore((s) => s.conversationId);
  const localStream = useCallStore((s) => s.localStream);
  const remoteStream = useCallStore((s) => s.remoteStream);
  const endedReason = useCallStore((s) => s.endedReason);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!conversationId) return;
    if (peerName && peerName !== "Peer") return;

    const detail = queryClient.getQueryData<ApiConversationDetail>(
      queryKeys.conversation(conversationId),
    );
    if (detail?.peerName) {
      setIncomingPeerName(detail.peerName);
      return;
    }

    const lists = queryClient.getQueriesData<ApiConversationSummary[]>({ queryKey: ["conversations"] });
    for (const [, rows] of lists) {
      const match = rows?.find((c) => c.id === conversationId);
      if (match?.peerName) {
        setIncomingPeerName(match.peerName);
        break;
      }
    }
  }, [conversationId, peerName, queryClient]);

  useEffect(() => {
    if (phase !== "active") return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  const initial = (peerName || "?").charAt(0).toUpperCase();
  const status =
    phase === "outgoing"
      ? "Calling…"
      : phase === "incoming"
        ? media === "video"
          ? "Incoming video call"
          : "Incoming voice call"
        : phase === "connecting"
          ? "Connecting…"
          : phase === "active"
            ? formatElapsed(now - (startedAt ?? now))
            : endedReason === "reject"
              ? "Call declined"
              : endedReason === "busy"
                ? "Busy"
                : endedReason === "timeout"
                  ? "No answer"
                  : endedReason === "failed"
                    ? "Call failed"
                    : "Call ended";

  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-[oklch(0.18_0.02_268)] text-white">
      {media === "video" && phase === "active" ? (
        <div className="relative min-h-0 flex-1">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="h-full w-full object-cover"
          />
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="absolute bottom-28 right-4 h-36 w-28 rounded-2xl object-cover shadow-lg ring-1 ring-white/20"
          />
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6">
          <span className="grid h-28 w-28 place-items-center rounded-full bg-sage font-serif text-4xl text-white">
            {initial}
          </span>
          <h2 className="mt-6 font-serif text-3xl">{peerName || "Peer"}</h2>
          <p className="mt-2 text-sm text-white/70">{status}</p>
          {media === "video" && (phase === "outgoing" || phase === "connecting") && (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="mt-8 h-40 w-28 rounded-2xl object-cover ring-1 ring-white/20"
            />
          )}
        </div>
      )}

      {/* Always attach remote audio for voice / video */}
      <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />

      {phase !== "ended" && (
        <div className="flex items-center justify-center gap-4 px-6 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-4">
          {phase === "incoming" ? (
            <>
              <button
                type="button"
                aria-label="Decline"
                onClick={() => rejectCall()}
                className="grid h-16 w-16 place-items-center rounded-full bg-clay text-white"
              >
                <PhoneOff className="h-7 w-7" />
              </button>
              <button
                type="button"
                aria-label="Accept"
                onClick={() => void acceptCall()}
                className="grid h-16 w-16 place-items-center rounded-full bg-sage text-white"
              >
                <Phone className="h-7 w-7" />
              </button>
            </>
          ) : (
            <>
              <ControlButton
                label={muted ? "Unmute" : "Mute"}
                onClick={() => toggleMute()}
                active={muted}
              >
                {muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </ControlButton>

              {media === "video" && (
                <ControlButton
                  label={cameraOff ? "Camera on" : "Camera off"}
                  onClick={() => toggleCamera()}
                  active={cameraOff}
                >
                  {cameraOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                </ControlButton>
              )}

              <button
                type="button"
                aria-label="Hang up"
                onClick={() => void hangUp("hangup")}
                className="grid h-16 w-16 place-items-center rounded-full bg-clay text-white shadow-lg"
              >
                <PhoneOff className="h-7 w-7" />
              </button>
            </>
          )}
        </div>
      )}

      {phase === "active" && media === "video" && (
        <p className="pointer-events-none absolute left-0 right-0 top-10 text-center text-sm text-white/80">
          {peerName} · {status}
        </p>
      )}
    </div>
  );
}

function ControlButton({
  children,
  label,
  onClick,
  active,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "grid h-14 w-14 place-items-center rounded-full transition",
        active ? "bg-white text-foreground" : "bg-white/15 text-white hover:bg-white/25",
      )}
    >
      {children}
    </button>
  );
}
