import { api } from "@/lib/api-client";
import type { ApiPeer, MatchCurrentResponse, MatchFindResponse } from "@/lib/api/types";

export async function getCurrentMatch() {
  return api<MatchCurrentResponse>("/matching/current");
}

export async function findMatch() {
  return api<MatchFindResponse>("/matching/find", { method: "POST" });
}

export async function rematch() {
  return api<MatchFindResponse>("/matching/rematch", { method: "POST" });
}

export async function getMatchPeer(userId: string) {
  return api<ApiPeer>(`/matching/users/${userId}`);
}
