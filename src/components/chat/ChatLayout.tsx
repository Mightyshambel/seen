import { Link, useNavigate } from "react-router-dom";
import {
  Bookmark,
  CheckCheck,
  Heart,
  Inbox,
  PenSquare,
  Pin,
  Search,
  Settings,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { experienceLabels, peers, type Conversation, type PeerMatch } from "@/lib/mock";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/stores/chat";

type NavFilter = "all" | "matches" | "unread" | "saved";

export function ChatLayout({ activeId }: { activeId?: string }) {
  const navigate = useNavigate();
  const conversations = useChatStore((s) => s.conversations);
  const [storeReady, setStoreReady] = useState(false);

  useEffect(() => {
    const persist = useChatStore.persist;
    if (!persist) {
      setStoreReady(true);
      return;
    }

    if (persist.hasHydrated()) {
      setStoreReady(true);
      return;
    }

    const finishHydration = persist.onFinishHydration(() => {
      setStoreReady(true);
    });

    void persist.rehydrate();

    return finishHydration;
  }, []);

  const matchCount = conversations.length;
  const unreadCount = conversations.reduce((n, c) => n + c.unread, 0);

  const sorted = [...conversations].sort((a, b) => {
    if (a.id === "c-maya") return -1;
    if (b.id === "c-maya") return 1;
    return 0;
  });

  if (!storeReady) {
    return (
      <div className="app-shell grid h-dvh place-items-center">
        <p className="text-sm text-muted-foreground">Loading conversations…</p>
      </div>
    );
  }

  return (
    <div className="app-shell flex h-dvh overflow-hidden">
      <ChatSidebar matchCount={matchCount} unreadCount={unreadCount} />

      <aside
        className={cn(
          "app-panel flex w-full flex-col border-r border-border/50 md:w-[340px] md:shrink-0",
          activeId && "hidden md:flex",
        )}
      >
        <div className="flex items-center justify-between px-5 pb-2 pt-5">
          <h1 className="font-serif text-[1.75rem] leading-none tracking-tight text-foreground">
            Conversations
          </h1>
          <Link to="/matching" aria-label="Find a match" className="btn-ghost h-9 w-9 rounded-xl">
            <PenSquare className="h-[18px] w-[18px]" />
          </Link>
        </div>

        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-2.5 shadow-[var(--shadow-soft)] transition-all duration-300 focus-within:border-sage/30 focus-within:ring-[3px] focus-within:ring-sage/10">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search gently..."
              className="w-full bg-transparent text-[14px] text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <ul className="flex-1 overflow-y-auto">
          {sorted.map((c) => (
            <ConversationRow
              key={c.id}
              conversation={c}
              active={c.id === activeId}
              onSelect={() => navigate(`/chat/${c.id}`)}
            />
          ))}
        </ul>
      </aside>

      <main className={cn("min-w-0 flex-1", !activeId && "hidden md:flex")}>
        {activeId ? <ChatPanel conversationId={activeId} /> : <EmptyChatState />}
      </main>
    </div>
  );
}

function ChatSidebar({ matchCount, unreadCount }: { matchCount: number; unreadCount: number }) {
  const items: { id: NavFilter; icon: React.ReactNode; label: string; badge?: number }[] = [
    { id: "all", icon: <Inbox className="h-[18px] w-[18px]" />, label: "All" },
    {
      id: "matches",
      icon: <Users className="h-[18px] w-[18px]" />,
      label: "Matches",
      badge: matchCount,
    },
    {
      id: "unread",
      icon: <Heart className="h-[18px] w-[18px]" />,
      label: "Unread",
      badge: unreadCount,
    },
    { id: "saved", icon: <Bookmark className="h-[18px] w-[18px]" />, label: "Saved" },
  ];

  return (
    <nav className="hidden w-[72px] shrink-0 flex-col items-center border-r border-border/50 bg-card py-6 md:flex">
      <Link to="/" className="mb-8 grid h-10 w-10 place-items-center" aria-label="Seen home">
        <span className="logo-mark h-9 w-9">
          <span className="h-2.5 w-2.5 rounded-full bg-sage" />
        </span>
      </Link>

      <div className="flex flex-1 flex-col items-center gap-2">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="relative flex w-full flex-col items-center gap-1 px-2 py-2 text-muted-foreground transition-all duration-300 hover:text-foreground"
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
            {item.badge ? (
              <span className="absolute right-3 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-sage px-1 text-[10px] font-semibold text-primary-foreground">
                {item.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <Link to="/settings/privacy" aria-label="Settings" className="btn-ghost h-10 w-10 rounded-xl">
        <Settings className="h-[18px] w-[18px]" />
      </Link>
    </nav>
  );
}

function ConversationRow({
  conversation,
  active,
  onSelect,
}: {
  conversation: Conversation;
  active: boolean;
  onSelect: () => void;
}) {
  const peer = peers.find((p) => p.id === conversation.peerId);
  if (!peer) return null;

  const last = conversation.messages
    .filter((m) => m.kind !== "reminder" && m.kind !== "grounding")
    .at(-1);
  const category = getCategory(peer);
  const pinned = conversation.id === "c-maya";

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "flex w-full items-start gap-3 px-4 py-3.5 text-left transition",
          active ? "bg-surface-muted" : "hover:bg-surface-muted/70",
        )}
      >
        <span
          className={cn(
            "grid h-12 w-12 shrink-0 place-items-center rounded-full font-serif text-lg text-white",
            avatarTone(peer.hue),
          )}
        >
          {peer.initial}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold text-foreground">{peer.name}</p>
              <p className="mt-0.5 text-[10px] font-medium tracking-[0.12em] text-muted-foreground">
                {category}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className="text-[12px] text-muted-foreground">{conversation.lastAt}</span>
              {pinned && <Pin className="h-3 w-3 rotate-45 text-muted-foreground" />}
            </div>
          </div>
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="truncate text-[13px] text-muted-foreground">
              {last?.from === "me" && (
                <CheckCheck className="mr-1 inline h-3.5 w-3.5 text-muted-foreground" />
              )}
              {last?.text ?? "Start a conversation"}
            </p>
            {conversation.unread > 0 && (
              <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-sage px-1.5 text-[11px] font-semibold text-primary-foreground">
                {conversation.unread}
              </span>
            )}
          </div>
        </div>
      </button>
    </li>
  );
}

function EmptyChatState() {
  return (
    <div className="app-panel flex h-full flex-col items-center justify-center px-8 text-center">
      <span className="logo-mark grid h-16 w-16 place-items-center font-serif text-2xl text-sage">
        S
      </span>
      <h2 className="mt-6 font-serif text-2xl text-foreground">Choose a conversation</h2>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
        Select someone from your list to continue a gentle, private conversation.
      </p>
    </div>
  );
}

function getCategory(peer: PeerMatch) {
  const tag = peer.shared[0];
  return tag ? experienceLabels[tag].toUpperCase() : "PEER SUPPORT";
}

function avatarTone(hue: string) {
  const tones: Record<string, string> = {
    sage: "bg-sage",
    ocean: "bg-ocean",
    lavender: "bg-lavender",
    sand: "bg-sand",
  };
  return tones[hue] ?? "bg-sage";
}
