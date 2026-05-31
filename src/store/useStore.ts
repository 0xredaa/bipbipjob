import { create } from 'zustand';
import type { CVAnalysis, Credits, JobOffer, JobSector, Match, Plan, User } from '@/types';
import { MOCK_USER } from '@/services/mockData';
import {
  analyzeCV,
  consumeCredit,
  getCredits,
  getNextOffer,
  sendMatch,
  upgradePlan,
} from '@/services/api';

interface AppState {
  // Auth / user
  user: User | null;
  isAuthenticated: boolean;
  login: (user?: Partial<User>) => void;
  logout: () => void;
  register: (user: Partial<User>) => void;

  // Credits
  credits: Credits | null;
  refreshCredits: () => Promise<void>;
  /** Switch plan (used by the post-registration plan picker & upgrade). */
  selectPlan: (plan: Plan) => Promise<void>;

  // CV analysis
  isAnalyzing: boolean;
  runCVAnalysis: () => Promise<CVAnalysis>;

  // Sectors the user wants to see on the conveyor (empty = all)
  selectedSectors: JobSector[];
  toggleSector: (sector: JobSector) => void;
  setSectors: (sectors: JobSector[]) => void;

  // Offers
  currentOffer: JobOffer | null;
  loadNextOffer: () => Promise<void>;

  // Matches
  matches: Match[];

  // Actions on the conveyor
  /** Returns true if the match succeeded (a credit was consumed). */
  matchCurrent: () => Promise<boolean>;
  skipCurrent: () => Promise<void>;

  // UI flags
  isProcessing: boolean;
}

export const useStore = create<AppState>((set, get) => ({
  user: MOCK_USER,
  isAuthenticated: true,

  login: (user) =>
    set({ isAuthenticated: true, user: { ...MOCK_USER, ...user } }),
  logout: () => set({ isAuthenticated: false, user: null }),
  register: (user) =>
    set({
      isAuthenticated: true,
      user: { ...MOCK_USER, ...user, id: `usr_${Date.now()}` },
    }),

  credits: null,
  refreshCredits: async () => {
    const credits = await getCredits();
    set({ credits });
  },
  selectPlan: async (plan) => {
    const credits = await upgradePlan(plan);
    set({ credits });
  },

  isAnalyzing: false,
  runCVAnalysis: async () => {
    set({ isAnalyzing: true });
    try {
      const { user } = get();
      const analysis = await analyzeCV({
        job: user?.job,
        contract: user?.contract,
        firstName: user?.firstName,
      });
      set((s) => ({
        user: s.user ? { ...s.user, cvAnalysis: analysis } : s.user,
        // Pre-select the suggested sectors so the machine is relevant out of the box.
        selectedSectors: analysis.suggestedSectors,
      }));
      return analysis;
    } finally {
      set({ isAnalyzing: false });
    }
  },

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
    const offer = await getNextOffer(get().selectedSectors);
    set({ currentOffer: offer });
  },

  matches: [],

  isProcessing: false,

  matchCurrent: async () => {
    const { currentOffer, isProcessing } = get();
    if (!currentOffer || isProcessing) return false;

    set({ isProcessing: true });
    try {
      const consumed = await consumeCredit();
      if (!consumed.success) {
        return false;
      }

      const result = await sendMatch(currentOffer.id);
      const match: Match = {
        id: `match_${Date.now()}`,
        offer: currentOffer,
        matchedAt: new Date().toISOString(),
        emailStatus: result.emailSent ? 'sent' : 'pending',
      };

      set((s) => ({
        matches: [match, ...s.matches],
        credits: s.credits
          ? { ...s.credits, remaining: consumed.remaining }
          : s.credits,
      }));

      // Simulate the email lifecycle (sent -> delivered -> opened).
      window.setTimeout(() => {
        set((s) => ({
          matches: s.matches.map((m) =>
            m.id === match.id ? { ...m, emailStatus: 'delivered' } : m,
          ),
        }));
      }, 2200);

      return true;
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
