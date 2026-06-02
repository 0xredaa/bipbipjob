import { create } from 'zustand';
import type { Credits, JobOffer, JobSector, Match, Plan, User } from '@/types';
import * as api from '@/services/api';

interface AppState {
  // Auth / user
  user: User | null;
  isAuthenticated: boolean;
  /** True once the initial /me hydration has resolved (avoids auth flicker). */
  hydrated: boolean;
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (input: Partial<User> & { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (patch: Partial<User>) => Promise<void>;

  // Credits
  credits: Credits | null;
  refreshCredits: () => Promise<void>;
  selectPlan: (plan: Plan) => Promise<void>;

  // CV file — uploaded at registration, sent to companies on a match
  cvFile: File | null;
  setCvFile: (file: File | null) => void;

  // Sectors the user wants to see on the conveyor (empty = all)
  selectedSectors: JobSector[];
  toggleSector: (sector: JobSector) => void;
  setSectors: (sectors: JobSector[]) => void;

  // Offers
  currentOffer: JobOffer | null;
  loadNextOffer: () => Promise<void>;

  // Matches
  matches: Match[];
  loadMatches: () => Promise<void>;

  // Conveyor actions
  /** Returns true if the match succeeded (a credit was consumed server-side). */
  matchCurrent: () => Promise<boolean>;
  skipCurrent: () => Promise<void>;

  isProcessing: boolean;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  hydrated: false,

  hydrate: async () => {
    try {
      const me = await api.getMe();
      if (me) {
        set({ user: me.user, credits: me.credits, isAuthenticated: true });
        void get().loadMatches();
      } else {
        set({ isAuthenticated: false, user: null });
      }
    } finally {
      set({ hydrated: true });
    }
  },

  login: async (email, password) => {
    const { user, credits } = await api.login(email, password);
    set({ user, credits, isAuthenticated: true });
    void get().loadMatches();
  },

  register: async (input) => {
    const { user, credits } = await api.register(input);
    set({ user, credits, isAuthenticated: true });
  },

  logout: async () => {
    await api.logout().catch(() => {});
    set({
      isAuthenticated: false,
      user: null,
      credits: null,
      matches: [],
      currentOffer: null,
    });
  },

  updateProfile: async (patch) => {
    const { user } = await api.updateProfile(patch);
    set({ user });
  },

  credits: null,
  refreshCredits: async () => {
    try {
      set({ credits: await api.getCredits() });
    } catch {
      /* not authenticated yet — ignore */
    }
  },
  selectPlan: async (plan) => {
    set({ credits: await api.upgradePlan(plan) });
  },

  cvFile: null,
  setCvFile: (file) => set({ cvFile: file }),

  selectedSectors: [],
  toggleSector: (sector) =>
    set((s) => ({
      selectedSectors: s.selectedSectors.includes(sector)
        ? s.selectedSectors.filter((x) => x !== sector)
        : [...s.selectedSectors, sector],
    })),
  setSectors: (sectors) => set({ selectedSectors: sectors }),

  currentOffer: null,
  loadNextOffer: async () => {
    try {
      set({ currentOffer: await api.getNextOffer(get().selectedSectors) });
    } catch {
      set({ currentOffer: null });
    }
  },

  matches: [],
  loadMatches: async () => {
    try {
      set({ matches: await api.getMatches() });
    } catch {
      /* ignore */
    }
  },

  isProcessing: false,

  matchCurrent: async () => {
    const { currentOffer, isProcessing } = get();
    if (!currentOffer || isProcessing) return false;
    set({ isProcessing: true });
    try {
      const res = await api.sendMatch(currentOffer.id);
      if (!res.success) {
        if (res.credits) set({ credits: res.credits });
        return false;
      }
      set((s) => ({
        matches: res.match ? [res.match, ...s.matches] : s.matches,
        credits: res.credits ?? s.credits,
      }));
      return true;
    } catch {
      return false;
    } finally {
      set({ isProcessing: false });
    }
  },

  skipCurrent: async () => {
    if (get().isProcessing) return;
    set({ isProcessing: true });
    try {
      await get().loadNextOffer();
    } finally {
      set({ isProcessing: false });
    }
  },
}));
