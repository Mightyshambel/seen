import { Link, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { experienceLabels, type PeerMatch } from "@/lib/mock";
import { useChatStore } from "@/stores/chat";

function availabilityLabel(availability: PeerMatch["availability"]) {
  if (availability === "now") return "Available now";
  if (availability === "today") return "Around today";
  return "This week";
}

export function MatchCard({ peer, rank }: { peer: PeerMatch; rank: number }) {
  const navigate = useNavigate();
  const connectPeer = useChatStore((s) => s.connectPeer);

  const handleConnect = () => {
    const conversationId = connectPeer(peer.id);
    navigate(`/chat/${conversationId}`);
  };

  return (
    <li className="surface-card p-6">
      <div className="flex items-start gap-4">
        <Link
          to={`/match/${peer.id}`}
          className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-sage-soft font-serif text-xl text-sage transition hover:ring-2 hover:ring-sage/30"
        >
          {peer.initial}
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link to={`/match/${peer.id}`} className="font-medium text-foreground hover:underline">
              {peer.name} · {peer.pronouns}
            </Link>
            <span className="rounded-full bg-sage-soft px-2 py-0.5 text-[11px] font-medium text-sage">
              #{rank} match
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {peer.city} · {availabilityLabel(peer.availability)}
          </p>
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{peer.bio}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {peer.shared.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-sage-soft px-2.5 py-1 text-xs text-foreground"
              >
                <Sparkles className="h-3 w-3 text-sage" />
                {experienceLabels[tag]}
              </span>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Understanding</span>
                <span className="font-medium text-foreground">{peer.compatibility}%</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-sage"
                  style={{ width: `${peer.compatibility}%` }}
                />
              </div>
            </div>
            <button type="button" onClick={handleConnect} className="btn-primary shrink-0 px-5 py-2.5 text-xs">
              Connect
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
