export type ExperienceTag =
  | "grief"
  | "addiction-recovery"
  | "trauma"
  | "burnout"
  | "loneliness"
  | "breakup"
  | "caregiving"
  | "life-transition";

export const experienceLabels: Record<ExperienceTag, string> = {
  grief: "Grief & loss",
  "addiction-recovery": "Addiction recovery",
  trauma: "Trauma",
  burnout: "Burnout",
  loneliness: "Loneliness",
  breakup: "Breakup recovery",
  caregiving: "Caregiving stress",
  "life-transition": "Life transition",
};

export type EmotionalState =
  | "heavy"
  | "tender"
  | "numb"
  | "anxious"
  | "hopeful"
  | "tired"
  | "lonely"
  | "steady";

export const emotionalLabels: Record<EmotionalState, string> = {
  heavy: "Heavy",
  tender: "Tender",
  numb: "Numb",
  anxious: "Anxious",
  hopeful: "Hopeful",
  tired: "Tired",
  lonely: "Lonely",
  steady: "Steady",
};

export type SupportStyle = "listener" | "sharer" | "both";

export interface PeerMatch {
  id: string;
  name: string;
  pronouns: string;
  age: number;
  city: string;
  bio: string;
  shared: ExperienceTag[];
  emotional: EmotionalState[];
  compatibility: number;
  availability: "now" | "today" | "this-week";
  supportStyle: SupportStyle;
  initial: string;
  hue: string;
}

export const peers: PeerMatch[] = [
  {
    id: "maya",
    name: "Maya",
    pronouns: "she/her",
    age: 31,
    city: "Portland, OR",
    bio: "Lost my mom last spring. Some days are softer than others. Looking for someone who just gets it without trying to fix it.",
    shared: ["grief", "life-transition"],
    emotional: ["tender", "tired"],
    compatibility: 94,
    availability: "now",
    supportStyle: "both",
    initial: "M",
    hue: "sage",
  },
  {
    id: "noah",
    name: "Noah",
    pronouns: "he/him",
    age: 28,
    city: "Brooklyn, NY",
    bio: "18 months sober. Some weeks the quiet is louder than the craving. Here to listen and to be heard.",
    shared: ["addiction-recovery", "loneliness"],
    emotional: ["steady", "hopeful"],
    compatibility: 87,
    availability: "today",
    supportStyle: "listener",
    initial: "N",
    hue: "ocean",
  },
  {
    id: "ari",
    name: "Ari",
    pronouns: "they/them",
    age: 34,
    city: "Austin, TX",
    bio: "Caregiver for my dad. Burnout is real and so is the love. Looking for honest, low-pressure conversations.",
    shared: ["caregiving", "burnout"],
    emotional: ["tired", "heavy"],
    compatibility: 91,
    availability: "this-week",
    supportStyle: "sharer",
    initial: "A",
    hue: "lavender",
  },
  {
    id: "june",
    name: "June",
    pronouns: "she/they",
    age: 26,
    city: "Chicago, IL",
    bio: "A long breakup, a longer becoming. Trying to remember who I was before. Open to slow, kind conversations.",
    shared: ["breakup", "life-transition"],
    emotional: ["tender", "hopeful"],
    compatibility: 82,
    availability: "now",
    supportStyle: "both",
    initial: "J",
    hue: "sand",
  },
];

export function getPeerById(id: string): PeerMatch | undefined {
  return peers.find((p) => p.id === id);
}

export interface Message {
  id: string;
  from: "me" | "peer";
  text: string;
  time: string;
  kind?: "text" | "prompt" | "grounding" | "reminder" | "voice" | "image" | "document";
  mediaUrl?: string;
  durationMs?: number;
  fileName?: string;
  replyToId?: string;
  replyPreview?: string;
  editedAt?: string;
  deleted?: boolean;
  forwarded?: boolean;
  reactions?: Array<{ emoji: string; count: number; mine: boolean }>;
  readByPeer?: boolean;
}

export interface Conversation {
  id: string;
  peerId: string;
  warmth: number;
  unread: number;
  lastAt: string;
  messages: Message[];
}

export const conversations: Conversation[] = [
  {
    id: "c-maya",
    peerId: "maya",
    warmth: 78,
    unread: 1,
    lastAt: "17:05",
    messages: [
      {
        id: "1",
        from: "peer",
        text: "Hi. I saw we matched through grief. No pressure to say anything profound.",
        time: "10:42",
      },
      { id: "2", from: "me", text: "Thank you. Evenings are the hardest for me.", time: "10:48" },
      {
        id: "3",
        from: "peer",
        text: "The quiet after they're gone is its own kind of grief.",
        time: "10:50",
      },
      { id: "v", from: "peer", kind: "voice", text: "voice note", time: "1:24" },
      {
        id: "4",
        from: "me",
        text: "That really resonates. Some days I just need someone who gets it.",
        time: "10:53",
      },
      {
        id: "5",
        from: "peer",
        text: "I'm here. Whenever. Even if it's just to say it was a hard day.",
        time: "10:54",
      },
    ],
  },
  {
    id: "c-noah",
    peerId: "noah",
    warmth: 64,
    unread: 0,
    lastAt: "Mon",
    messages: [
      {
        id: "1",
        from: "me",
        text: "Hey. Saw we share some ground. How's today treating you?",
        time: "8:10 PM",
      },
      { id: "2", from: "peer", text: "Honestly steady. Meeting earlier helped. You?", time: "8:14 PM" },
    ],
  },
  {
    id: "c-ari",
    peerId: "ari",
    warmth: 52,
    unread: 0,
    lastAt: "Yesterday",
    messages: [
      {
        id: "1",
        from: "peer",
        text: "Caregiver burnout is such a specific kind of tired. Glad to find someone who gets it.",
        time: "Yesterday",
      },
    ],
  },
];

export const partners = [
  {
    name: "Open Path Collective",
    description:
      "Affordable therapy access for communities who need peer support alongside professional care.",
    initial: "O",
  },
  {
    name: "GriefShare Network",
    description: "Local grief circles and warmline partners helping people find company in loss.",
    initial: "G",
  },
  {
    name: "Mindful Recovery Alliance",
    description:
      "Recovery-focused organizations connecting lived experience with gentle accountability.",
    initial: "M",
  },
  {
    name: "Caregiver Relief Project",
    description:
      "Support networks for unpaid caregivers navigating burnout and isolation together.",
    initial: "C",
  },
];

export const testimonials = [
  {
    quote:
      "It was the first time I felt heard without being fixed. We just sat together in it.",
    name: "Lena",
    context: "matched through grief support",
  },
  {
    quote:
      "I was skeptical of another app. Seen is quieter, slower, more human. It changed something for me.",
    name: "Theo",
    context: "matched through burnout",
  },
  {
    quote:
      "Knowing someone else was awake at 2am, going through the same thing, made the room feel less empty.",
    name: "Sam",
    context: "matched through breakup recovery",
  },
];

export const faqs = [
  {
    q: "Is Seen therapy?",
    a: "No. Seen is peer support — real people who've been through similar experiences. We're a companion to professional care, never a replacement.",
  },
  {
    q: "How are matches made?",
    a: "We use the experiences you share, the emotional state you're in, and your support style to find someone who can meet you where you are.",
  },
  {
    q: "Is it private?",
    a: "Yes. Only your first name and pronouns are visible. Conversations are end-to-end encrypted and never sold or used for advertising.",
  },
  {
    q: "What if I'm in crisis?",
    a: "Seen isn't an emergency service. If you're in crisis, our safety layer surfaces region-aware hotlines instantly, and we'll always point you toward professional support.",
  },
  {
    q: "Can I block or report?",
    a: "Yes, with one tap and no friction. Reports are reviewed by trained moderators within hours.",
  },
  {
    q: "Can I pause or leave a conversation?",
    a: "Any time. Mute, block, or step away without explanation. Your pace is yours.",
  },
];

export const crisisResources = [
  {
    region: "Global",
    name: "Find a Helpline",
    contact: "Directory by country",
    url: "https://findahelpline.com",
  },
  {
    region: "Italy",
    name: "Telefono Amico",
    contact: "Call 02 2327 2327",
    url: "https://www.telefonoamico.it",
  },
  {
    region: "Germany",
    name: "Telefonseelsorge",
    contact: "Call 0800 111 0 111",
    url: "https://www.telefonseelsorge.de",
  },
  {
    region: "United States",
    name: "988 Suicide & Crisis Lifeline",
    contact: "Call or text 988",
    url: "https://988lifeline.org",
  },
  {
    region: "Netherlands",
    name: "113 Zelfmoordpreventie",
    contact: "Call 0800-0113",
    url: "https://www.113.nl",
  },
  {
    region: "Saudi Arabia",
    name: "National Center for Mental Health",
    contact: "Call 920 033 360",
    url: "https://www.ncmh.org.sa",
  },
];
