import { create } from 'zustand';

interface FinanceState {
  currentBalance: number;
  dailyBudget: number;
  daysToHelb: number;
  statusMessage: string;
  transactions: any[];
  setFinanceData: (data: Partial<FinanceState>) => void;
  syncOfflineData: () => Promise<void>;
}

export const useFinanceStore = create<FinanceState>((set) => ({
  currentBalance: 450.0, // Mock initial state
  dailyBudget: 32.14,
  daysToHelb: 14,
  statusMessage: "Zii comrade, balance inasoma dust. Enable Vault mode?",
  transactions: [],
  
  setFinanceData: (data) => set((state) => ({ ...state, ...data })),
  
  syncOfflineData: async () => {
    // In a real app, this reads from IndexedDB and POSTs to our FastAPI backend
    console.log("Syncing local M-Pesa data with FastAPI engine...");
    // Mock network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    set({ statusMessage: "Sync complete! Vybes on." });
  }
}));
