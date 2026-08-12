import { create } from "zustand";
import { persist } from "zustand/middleware";
import { conversations as seedConversations, type Conversation, type Message } from "@/lib/mock";

function starterMessages(peerId: string): Message[] {
  const greetings: Record<string, string> = {
    maya: "Hi. Thanks for connecting. No pressure to reply quickly — take your time.",
    noah: "Hey — glad we matched. How are you holding up today?",
    ari: "Hi there. Caregiver life is a lot. I'm glad you're here.",
    june: "Hello. Whatever you're carrying today, you don't have to carry it alone.",
  };
  return [
    {
      id: `${peerId}-welcome`,
      from: "peer",
      text: greetings[peerId] ?? "Hi. Thanks for connecting — I'm glad you're here.",
      time: "now",
    },
  ];
}

interface ChatState {
  conversations: Conversation[];
  connectPeer: (peerId: string) => string;
  appendMessage: (conversationId: string, message: Message) => void;
  markRead: (conversationId: string) => void;
  resetToSeed: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: seedConversations,
      connectPeer: (peerId) => {
        const conversationId = `c-${peerId}`;
        const existing = get().conversations.find((c) => c.id === conversationId);
        if (existing) return conversationId;

        const conversation: Conversation = {
          id: conversationId,
          peerId,
          warmth: 50,
          unread: 1,
          lastAt: "now",
          messages: starterMessages(peerId),
        };

        set({ conversations: [conversation, ...get().conversations] });
        return conversationId;
      },
      appendMessage: (conversationId, message) => {
        set({
          conversations: get().conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  lastAt: "now",
                  messages: [...c.messages, message],
                }
              : c,
          ),
        });
      },
      markRead: (conversationId) => {
        const target = get().conversations.find((c) => c.id === conversationId);
        if (!target || target.unread === 0) return;

        set({
          conversations: get().conversations.map((c) =>
            c.id === conversationId ? { ...c, unread: 0 } : c,
          ),
        });
      },
      resetToSeed: () => set({ conversations: seedConversations }),
    }),
    { name: "seen-chats", skipHydration: true },
  ),
);

export function getConversation(id: string): Conversation | undefined {
  return useChatStore.getState().conversations.find((c) => c.id === id);
}
