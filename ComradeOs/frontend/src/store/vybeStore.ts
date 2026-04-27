import { create } from 'zustand';
import { vybeApi, PitstopData } from '@/lib/api';

interface VybeState {
  spots: PitstopData[];
  isLoading: boolean;
  error: string | null;

  fetchSpots: (budget?: number) => Promise<void>;
}

export const useVybeStore = create<VybeState>((set) => ({
  spots: [],
  isLoading: false,
  error: null,

  fetchSpots: async (budget?: number) => {
    set({ isLoading: true, error: null });
    try {
      const data = await vybeApi.getSpots(budget);
      set({ spots: data.spots, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.detail || "Failed to fetch Vybe spots." });
    }
  },
}));
