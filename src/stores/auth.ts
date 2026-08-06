import { create } from "zustand";
import type { User } from "@/lib/api/types";

interface AuthState {
  user: User | null;
  sessionReady: boolean;
  setUser: (user: User | null) => void;
  setSessionReady: (ready: boolean) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  sessionReady: false,
  setUser: (user) => set({ user }),
  setSessionReady: (sessionReady) => set({ sessionReady }),
  clear: () => set({ user: null, sessionReady: true }),
}));
