import type { ApiPeer } from "@/lib/api/types";
import type { PeerMatch } from "@/lib/mock";
import { pronounLabel } from "@/lib/signup-options";

export function apiPeerToDisplay(peer: ApiPeer): PeerMatch {
  return {
    id: peer.id,
    name: peer.name,
    age: 0,
    city: "",
    pronouns: pronounLabel(peer.pronouns),
    bio: peer.bio,
    shared: peer.shared,
    compatibility: peer.compatibility,
    emotional: [],
    supportStyle: "both",
    availability: peer.availability ?? "today",
    hue: peer.hue ?? "sage",
    initial: peer.initial,
  };
}
