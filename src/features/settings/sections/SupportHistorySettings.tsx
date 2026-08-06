import { Clock } from "lucide-react";
import { SettingsCard, SettingsPageIntro } from "@/components/settings/SettingsShell";
import { useConversations } from "@/hooks/useApiQueries";
import { formatConversationTime } from "@/lib/message-utils";

export function SupportHistorySettings() {
  const { data: conversations = [], isLoading } = useConversations();

  const history = conversations.map((c) => ({
    id: c.id,
    date: formatConversationTime(c.lastAt),
    title: `Matched with ${c.peerName}`,
    note: c.lastMessagePreview ?? "Conversation started",
  }));

  return (
    <>
      <SettingsPageIntro
        title="Support history"
        description="A quiet record of your matches and the shifts in what you've needed."
      />
      <SettingsCard
        icon={<Clock className="h-5 w-5" />}
        title="Your matches"
        description="Past conversations appear here after you connect with someone."
      >
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading your history…</p>
        ) : history.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Your support history will appear here after your first match.
          </p>
        ) : (
          <ol className="space-y-4">
            {history.map((entry) => (
              <li key={entry.id}>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{entry.date}</p>
                <p className="mt-1 text-[14px] font-medium text-foreground">{entry.title}</p>
                <p className="mt-0.5 text-[13px] text-muted-foreground">{entry.note}</p>
              </li>
            ))}
          </ol>
        )}
      </SettingsCard>
    </>
  );
}
