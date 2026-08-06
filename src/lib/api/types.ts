import type { ExperienceTag } from "@/lib/mock";
import type { GenderPreference, JourneyDuration, SupportLookingFor } from "@/stores/onboarding";

export interface User {
  id: string;
  username: string;
  email: string;
  pronouns: string;
  location?: string | null;
  languages: string[];
  bio?: string | null;
  hue?: string | null;
  availability?: "now" | "today" | "this-week" | null;
  initial?: string | null;
  onboardingComplete: boolean;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface OnboardingProfile {
  experiences: ExperienceTag[];
  journeyDuration: JourneyDuration | null;
  supportLookingFor: SupportLookingFor | null;
  journeyNotes: string;
  languages: string[];
  pronouns: string;
  location?: string | null;
  genderPreference: GenderPreference | null;
  acknowledgedSafety: boolean;
  acknowledgedModeration: boolean;
  acknowledgedAge18: boolean;
  bio?: string | null;
  availability?: "now" | "today" | "this-week" | null;
}

export interface UserSettings {
  hideProfile: boolean;
  strictModeration: boolean;
  aiPrompts: boolean;
  aiCheckIns: boolean;
  notifyNewMessage: boolean;
  notifyGentleNudges: boolean;
  notifyWeeklyReflection: boolean;
  reduceMotion: boolean;
  largeText: boolean;
  highContrast: boolean;
  savedConversationIds: string[];
  accountEmail: string;
}

export interface ApiPeer {
  id: string;
  name: string;
  pronouns: string;
  bio: string;
  shared: ExperienceTag[];
  compatibility: number;
  similarityScore: number;
  availability?: "now" | "today" | "this-week" | null;
  hue?: string | null;
  initial: string;
}

export interface MatchFoundPayload {
  id: string;
  conversationId: string;
  peer: ApiPeer;
}

export type MatchFindResponse =
  | { status: "queued" }
  | { status: "matched"; match: MatchFoundPayload };

export type MatchCurrentResponse =
  | { status: "none" }
  | { status: "matched"; match: MatchFoundPayload };

export interface ApiReaction {
  emoji: string;
  count: number;
  mine: boolean;
}

export interface ApiMessage {
  id: string;
  from?: "me" | "peer" | null;
  text: string;
  time: string;
  kind?: string | null;
  mediaUrl?: string | null;
  durationMs?: number | null;
  fileName?: string | null;
  replyToId?: string | null;
  replyPreview?: string | null;
  editedAt?: string | null;
  deleted?: boolean;
  forwarded?: boolean;
  reactions?: ApiReaction[];
  readByPeer?: boolean | null;
}

export interface ApiConversationSummary {
  id: string;
  peerId: string;
  peerName: string;
  warmth: number;
  unread: number;
  lastAt: string;
  lastMessagePreview?: string | null;
  saved: boolean;
  muted?: boolean;
  blocked?: boolean;
}

export interface ApiConversationDetail extends ApiConversationSummary {
  peerLastReadAt?: string | null;
  messages: ApiMessage[];
}

export interface MessageSendResponse {
  userMessage: ApiMessage;
  systemMessage?: ApiMessage | null;
  warmth: number;
  distress?: {
    distressDetected: boolean;
    severity?: "low" | "high";
    showCrisisResources: boolean;
    resources?: Array<{ region: string; name: string; contact: string; url: string }>;
  };
}

export type ReportCategory = "harassment" | "spam" | "solicitation" | "misuse" | "other";
