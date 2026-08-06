import { Link, useNavigate } from "react-router-dom";
import {
  Bookmark,
  Heart,
  Inbox,
  MessageCircle,
  PenSquare,
  Phone,
  Search,
  Settings,
  Video,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { SeenLogo } from "@/components/brand/SeenLogo";
import { PageLoader } from "@/components/common/PageLoader";
import { useConversations } from "@/hooks/useApiQueries";
import type { ApiConversationSummary } from "@/lib/api/types";
import { formatConversationTime } from "@/lib/message-utils";
import { cn } from "@/lib/utils";
import { useSettings } from "@/stores/settings";
import { useCallStore } from "@/stores/call";

type NavFilter = "all" | "unread" | "saved";
type MobileTab = "chats" | "calls" | "search" | "settings";

export function ChatLayout({ activeId }: { activeId?: string }) {
  const navigate = useNavigate();
  const isSaved = useSettings((s) => s.isSaved);
  const [activeFilter, setActiveFilter] = useState<NavFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileTab, setMobileTab] = useState<MobileTab>("chats");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const queryParams = useMemo(
    () => ({
      q: searchQuery.trim() || undefined,
      saved: activeFilter === "saved" ? true : undefined,
      unread: activeFilter === "unread" ? true : undefined,
    }),
    [activeFilter, searchQuery],
  );

  const { data: conversations = [], isLoading } = useConversations(queryParams);
  const unreadCount = conversations.reduce((n, c) => n + c.unread, 0);
  const inThread = Boolean(activeId);

  useEffect(() => {
    if (mobileTab === "search") searchInputRef.current?.focus();
  }, [mobileTab]);

  if (isLoading) {
    return (
      <div className="app-shell grid h-dvh place-items-center">
        <PageLoader />
      </div>
    );
  }

  const filterItems: { id: NavFilter; icon: React.ReactNode; label: string; badge?: number }[] = [
    { id: "all", icon: <Inbox className="h-4 w-4" />, label: "All" },
    {
      id: "unread",
      icon: <Heart className="h-4 w-4" />,
      label: "Unread",
      badge: unreadCount || undefined,
    },
    { id: "saved", icon: <Bookmark className="h-4 w-4" />, label: "Personal" },
  ];

  return (
    <div className="app-shell flex h-dvh overflow-hidden">
      <DesktopSidebar
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        items={filterItems}
      />

      <aside
        className={cn(
          "app-panel relative flex w-full flex-col border-r border-border/50 md:w-[340px] md:shrink-0",
          inThread && "hidden md:flex",
        )}
      >
        {/* Mobile: Calls tab */}
        <div className={cn("flex h-full flex-col md:hidden", mobileTab !== "calls" && "hidden")}>
          <CallsPane />
        </div>

        {/* Mobile: Settings shortcut pane */}
        <div className={cn("flex h-full flex-col md:hidden", mobileTab !== "settings" && "hidden")}>
          <SettingsPane />
        </div>

        {/* Chats + Search (search focuses the search field) */}
        <div
          className={cn(
            "flex h-full flex-col",
            (mobileTab === "calls" || mobileTab === "settings") && "hidden md:flex",
          )}
        >
          <div className="flex items-center justify-between px-5 pb-2 pt-5">
            <h1 className="font-serif text-[1.75rem] leading-none tracking-tight text-foreground">
              {mobileTab === "search" ? "Search" : "Chats"}
            </h1>
            <Link
              to="/matching"
              aria-label="Find a match"
              className="hidden h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-surface-muted hover:text-foreground md:inline-grid"
            >
              <PenSquare className="h-[18px] w-[18px]" />
            </Link>
          </div>

          <div className="px-4 pb-3">
            <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-card px-4 py-3 shadow-[var(--shadow-soft)] transition-all duration-300 focus-within:border-sage/30 focus-within:ring-[3px] focus-within:ring-sage/10">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                ref={searchInputRef}
                type="search"
                placeholder="Search chats…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (window.matchMedia("(max-width: 767px)").matches) setMobileTab("search");
                }}
                className="w-full bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>

            {/* All / Unread / Personal — single bordered row */}
            <div className="mt-3 grid grid-cols-3 overflow-hidden rounded-2xl border border-border/60 bg-card">
              {filterItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveFilter(item.id);
                    setMobileTab("chats");
                  }}
                  aria-current={activeFilter === item.id ? "true" : undefined}
                  className={cn(
                    "flex min-h-[3.25rem] flex-col items-center justify-center gap-1 px-2 py-2 text-center transition",
                    activeFilter === item.id
                      ? "bg-sage-soft text-sage"
                      : "text-muted-foreground hover:bg-surface-muted/60",
                  )}
                >
                  <span className="relative">
                    {item.icon}
                    {item.badge ? (
                      <span className="absolute -right-2.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-sage px-1 text-[9px] font-semibold text-primary-foreground">
                        {item.badge}
                      </span>
                    ) : null}
                  </span>
                  <span className="text-[11px] font-semibold tracking-wide">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Bigger Find match CTA — mobile */}
            <Link
              to="/matching"
              className="mt-3 flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-foreground px-4 text-sm font-semibold text-background shadow-[0_10px_24px_-12px_oklch(0.24_0.02_268_/_0.4)] transition hover:-translate-y-0.5 md:hidden"
            >
              <PenSquare className="h-4 w-4" />
              Find a match
            </Link>
          </div>

          <ul className="flex-1 overflow-y-auto pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
            {conversations.length === 0 ? (
              <li className="px-5 py-10 text-center text-sm text-muted-foreground">
                {searchQuery.trim()
                  ? "No chats match that search."
                  : "No conversations here yet."}
              </li>
            ) : (
              conversations.map((c) => (
                <ConversationRow
                  key={c.id}
                  conversation={c}
                  active={c.id === activeId}
                  saved={isSaved(c.id) || c.saved}
                  onSelect={() => navigate(`/chat/${c.id}`)}
                />
              ))
            )}
          </ul>
        </div>

        {/* Mobile bottom tabs — Telegram style */}
        {!inThread && (
          <nav
            className="absolute inset-x-0 bottom-0 z-30 border-t border-border/60 bg-card/95 backdrop-blur-md md:hidden"
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
            aria-label="Main"
          >
            <div className="grid grid-cols-4">
              <TabButton
                label="Chats"
                active={mobileTab === "chats"}
                badge={unreadCount || undefined}
                onClick={() => setMobileTab("chats")}
                icon={<MessageCircle className="h-5 w-5" />}
              />
              <TabButton
                label="Calls"
                active={mobileTab === "calls"}
                onClick={() => setMobileTab("calls")}
                icon={<Phone className="h-5 w-5" />}
              />
              <TabButton
                label="Search"
                active={mobileTab === "search"}
                onClick={() => setMobileTab("search")}
                icon={<Search className="h-5 w-5" />}
              />
              <TabButton
                label="Settings"
                active={mobileTab === "settings"}
                onClick={() => setMobileTab("settings")}
                icon={<Settings className="h-5 w-5" />}
              />
            </div>
          </nav>
        )}
      </aside>

      <main className={cn("min-w-0 flex-1", !activeId && "hidden md:flex")}>
        {activeId ? <ChatPanel conversationId={activeId} /> : <EmptyChatState />}
      </main>
    </div>
  );
}

function TabButton({
  label,
  icon,
  active,
  badge,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex min-h-[3.5rem] flex-col items-center justify-center gap-0.5 px-1 py-2 text-[11px] font-medium transition",
        active ? "text-sage" : "text-muted-foreground",
      )}
    >
      <span className="relative">
        {icon}
        {badge ? (
          <span className="absolute -right-2.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-sage px-1 text-[9px] font-semibold text-primary-foreground">
            {badge > 99 ? "99+" : badge}
          </span>
        ) : null}
      </span>
      {label}
    </button>
  );
}

function CallsPane() {
  const navigate = useNavigate();
  const history = useCallStore((s) => s.history);

  return (
    <div className="flex flex-1 flex-col pb-[calc(4.5rem+env(safe-area-inset-bottom))] pt-5">
      <div className="px-5">
        <h1 className="font-serif text-[1.75rem] leading-none tracking-tight text-foreground">Calls</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Voice and video with your peer. Start a call from any chat.
        </p>
      </div>

      {history.length === 0 ? (
        <div className="mt-10 flex flex-1 flex-col items-center justify-center px-5 text-center">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-surface-muted text-muted-foreground">
            <Phone className="h-7 w-7" />
          </span>
          <p className="mt-5 font-serif text-xl text-foreground">No recent calls</p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Open a conversation and tap the phone or video icon to start.
          </p>
        </div>
      ) : (
        <ul className="mt-4 flex-1 overflow-y-auto">
          {history.map((entry) => (
            <li key={`${entry.id}-${entry.at}`}>
              <button
                type="button"
                onClick={() => navigate(`/chat/${entry.conversationId}`)}
                className="flex w-full items-center gap-3 px-5 py-3.5 text-left hover:bg-surface-muted/70"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sage font-serif text-lg text-white">
                  {entry.peerName.charAt(0).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-[15px] font-semibold text-foreground">
                      {entry.peerName}
                    </span>
                    {entry.media === "video" ? (
                      <Video className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </span>
                  <span className="mt-0.5 block text-[13px] text-muted-foreground">
                    {entry.direction === "in" ? "Incoming" : "Outgoing"} ·{" "}
                    {entry.outcome === "answered"
                      ? entry.durationSec != null
                        ? `${Math.floor(entry.durationSec / 60)}:${String(entry.durationSec % 60).padStart(2, "0")}`
                        : "Answered"
                      : entry.outcome === "missed"
                        ? "Missed"
                        : entry.outcome === "rejected"
                          ? "Declined"
                          : "Failed"}
                  </span>
                </span>
                <span className="shrink-0 text-[12px] text-muted-foreground">
                  {formatConversationTime(entry.at)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SettingsPane() {
  const links = [
    { to: "/settings/account", label: "Account" },
    { to: "/settings/privacy", label: "Privacy" },
    { to: "/settings/notifications", label: "Notifications" },
    { to: "/settings/accessibility", label: "Accessibility" },
    { to: "/settings/ai-personalization", label: "AI personalization" },
    { to: "/support", label: "Crisis & support" },
  ];

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-5 pb-[calc(4.5rem+env(safe-area-inset-bottom))] pt-5">
      <h1 className="font-serif text-[1.75rem] leading-none tracking-tight text-foreground">
        Settings
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">Manage your Seen experience.</p>

      <div className="mt-6 grid grid-cols-1 gap-3">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="flex min-h-12 items-center rounded-2xl border border-border/60 bg-card px-4 text-sm font-semibold text-foreground shadow-[var(--shadow-soft)] transition hover:border-sage/30 hover:bg-sage-soft/40"
          >
            {link.label}
          </Link>
        ))}
      </div>

      <Link
        to="/settings/account"
        className="mt-4 flex min-h-12 items-center justify-center rounded-2xl bg-foreground text-sm font-semibold text-background"
      >
        Open all settings
      </Link>
    </div>
  );
}

function DesktopSidebar({
  activeFilter,
  setActiveFilter,
  items,
}: {
  activeFilter: NavFilter;
  setActiveFilter: (filter: NavFilter) => void;
  items: { id: NavFilter; icon: React.ReactNode; label: string; badge?: number }[];
}) {
  return (
    <nav className="hidden w-[72px] shrink-0 flex-col items-center border-r border-border/50 bg-card py-6 md:flex">
      <Link to="/" className="mb-8" aria-label="Seen home">
        <SeenLogo className="h-10 w-10 sm:h-12 sm:w-12" />
      </Link>

      <div className="flex flex-1 flex-col items-center gap-2">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveFilter(item.id)}
            aria-current={activeFilter === item.id ? "true" : undefined}
            className={cn(
              "relative flex w-full flex-col items-center gap-1 px-2 py-2 transition-all duration-300",
              activeFilter === item.id
                ? "text-sage"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.icon}
            <span className="text-xs font-medium">{item.label}</span>
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
  saved,
  onSelect,
}: {
  conversation: ApiConversationSummary;
  active: boolean;
  saved: boolean;
  onSelect: () => void;
}) {
  const initial = conversation.peerName.charAt(0).toUpperCase() || "?";
  const preview = conversation.lastMessagePreview ?? "Start a conversation";

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
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-sage font-serif text-lg text-white">
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold text-foreground">
                {conversation.peerName}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className="text-[12px] text-muted-foreground">
                {formatConversationTime(conversation.lastAt)}
              </span>
              <div className="flex items-center gap-1">
                {saved && <Bookmark className="h-3 w-3 fill-sage text-sage" />}
              </div>
            </div>
          </div>
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="truncate text-[13px] text-muted-foreground">{preview}</p>
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
      <SeenLogo className="h-16 w-16 sm:h-20 sm:w-20" />
      <h2 className="mt-6 font-serif text-2xl text-foreground">Choose a conversation</h2>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
        Select someone from your list to continue a gentle, private conversation.
      </p>
    </div>
  );
}
