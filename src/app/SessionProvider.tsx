import { useQueryClient } from "@tanstack/react-query";
import { useEffect, type ReactNode } from "react";
import { PageLoader } from "@/components/common/PageLoader";
import { refreshSession } from "@/lib/api/auth";
import { getMe } from "@/lib/api/users";
import { notifyIncomingMessage } from "@/lib/message-notifications";
import { hydrateSessionFromApi } from "@/lib/session";
import { connectWs, disconnectWs, subscribeWs } from "@/lib/ws-client";
import { queryKeys } from "@/hooks/useApiQueries";
import { useAuthStore } from "@/stores/auth";
import { useSettings } from "@/stores/settings";

export function SessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const sessionReady = useAuthStore((s) => s.sessionReady);
  const setUser = useAuthStore((s) => s.setUser);
  const setSessionReady = useAuthStore((s) => s.setSessionReady);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        await refreshSession();
        const user = await getMe();
        if (cancelled) return;
        setUser(user);
        await hydrateSessionFromApi();
        queryClient.setQueryData(queryKeys.me, user);
        connectWs();
      } catch {
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setSessionReady(true);
        }
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
      disconnectWs();
    };
  }, [queryClient, setSessionReady, setUser]);

  useEffect(() => {
    const unsubscribe = subscribeWs((event) => {
      if (event.type === "message.new") {
        const muted = Boolean(
          (
            queryClient.getQueryData(queryKeys.conversation(event.conversationId)) as
              | { muted?: boolean }
              | undefined
          )?.muted,
        );
        if (!muted && useSettings.getState().notifyNewMessage) {
          notifyIncomingMessage(event.conversationId, event.message, event.senderId);
        }
        void queryClient.invalidateQueries({ queryKey: ["conversations"] });
        void queryClient.invalidateQueries({
          queryKey: queryKeys.conversation(event.conversationId),
        });
        return;
      }
      if (
        event.type === "message.read" ||
        event.type === "message.updated" ||
        event.type === "message.deleted" ||
        event.type === "message.reaction"
      ) {
        void queryClient.invalidateQueries({ queryKey: ["conversations"] });
        if ("conversationId" in event) {
          void queryClient.invalidateQueries({
            queryKey: queryKeys.conversation(event.conversationId),
          });
        }
        return;
      }
      if (event.type === "match.found") {
        void queryClient.invalidateQueries({ queryKey: ["conversations"] });
      }
    });

    return unsubscribe;
  }, [queryClient]);

  if (!sessionReady) {
    return <PageLoader />;
  }

  return children;
}
