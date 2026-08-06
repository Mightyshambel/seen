import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getConversation, listConversations } from "@/lib/api/conversations";
import { getMatchPeer } from "@/lib/api/matching";
import { getMe, getSettings } from "@/lib/api/users";

export const queryKeys = {
  me: ["me"] as const,
  settings: ["settings"] as const,
  conversations: (params?: { q?: string; saved?: boolean; unread?: boolean }) =>
    ["conversations", params ?? {}] as const,
  conversation: (id: string) => ["conversation", id] as const,
  matchPeer: (userId: string) => ["matchPeer", userId] as const,
};

export function useMe(enabled = true) {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: getMe,
    enabled,
    retry: false,
  });
}

export function useSettingsQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: getSettings,
    enabled,
    retry: false,
  });
}

export function useConversations(params?: { q?: string; saved?: boolean; unread?: boolean }) {
  return useQuery({
    queryKey: queryKeys.conversations(params),
    queryFn: () => listConversations(params),
  });
}

export function useConversation(conversationId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.conversation(conversationId ?? ""),
    queryFn: () => getConversation(conversationId!),
    enabled: Boolean(conversationId),
  });
}

export function useMatchPeer(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.matchPeer(userId ?? ""),
    queryFn: () => getMatchPeer(userId!),
    enabled: Boolean(userId),
  });
}

export function useInvalidateConversations() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["conversations"] });
  };
}
