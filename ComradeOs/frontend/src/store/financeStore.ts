/**
 * ComradeOS — Finance Store (Zustand)
 * Manages financial state with real API integration.
 * All mock data has been eliminated.
 */

import { create } from 'zustand';
import { financeApi, BurnRateData, TransactionData, MpesaTransaction } from '@/lib/api';

interface FinanceState {
  currentBalance: number;
  dailyBudget: number;
  daysToHelb: number;
  statusMessage: string;
  transactions: TransactionData[];
  predictedZeroDate: string | null;
  analytics: any | null; // Stores the full AnalyticsData object
  isLoading: boolean;
  error: string | null;
  isOffline: boolean;

  fetchBurnRate: (daysToHelb?: number) => Promise<void>;
  fetchTransactions: () => Promise<void>;
  fetchAnalytics: () => Promise<void>;
  syncOfflineData: (transactions: MpesaTransaction[]) => Promise<void>;
  setDaysToHelb: (days: number) => void;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  currentBalance: 0,
  dailyBudget: 0,
  daysToHelb: 14,
  statusMessage: "Loading your financial data...",
  transactions: [],
  predictedZeroDate: null,
  analytics: null,
  isLoading: false,
  error: null,
  isOffline: false,

  fetchBurnRate: async (daysToHelb?: number) => {
    set({ isLoading: true, error: null, isOffline: false });
    try {
      const days = daysToHelb ?? get().daysToHelb;
      const data: BurnRateData = await financeApi.getBurnRate(days);
      set({
        currentBalance: data.current_balance,
        dailyBudget: data.daily_survival_budget,
        daysToHelb: data.days_to_helb,
        statusMessage: data.status_message,
        isLoading: false,
      });
      // Cache for offline fallback
      if (typeof window !== 'undefined') localStorage.setItem('comradeos_burn_rate', JSON.stringify(data));
    } catch (err: any) {
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('comradeos_burn_rate');
        if (cached) {
          const data = JSON.parse(cached);
          set({
            currentBalance: data.current_balance,
            dailyBudget: data.daily_survival_budget,
            daysToHelb: data.days_to_helb,
            statusMessage: "Offline Mode (Cached Data)",
            isOffline: true,
            isLoading: false,
          });
          return;
        }
      }
      set({ isLoading: false, error: err.detail || "Failed to fetch burn rate.", isOffline: true });
    }
  },

  fetchTransactions: async () => {
    try {
      const data = await financeApi.getTransactions();
      set({ transactions: data.transactions, isOffline: false });
      if (typeof window !== 'undefined') localStorage.setItem('comradeos_transactions', JSON.stringify(data.transactions));
    } catch (err: any) {
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('comradeos_transactions');
        if (cached) {
          set({ transactions: JSON.parse(cached), isOffline: true });
          return;
        }
      }
      set({ error: err.detail || "Failed to fetch transactions.", isOffline: true });
    }
  },

  fetchAnalytics: async () => {
    try {
      const data = await financeApi.getAnalytics();
      set({ 
        analytics: data, 
        predictedZeroDate: data.ml_prediction.predicted_date,
        isOffline: false
      });
      if (typeof window !== 'undefined') localStorage.setItem('comradeos_analytics', JSON.stringify(data));
    } catch (err: any) {
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('comradeos_analytics');
        if (cached) {
          const data = JSON.parse(cached);
          set({ analytics: data, predictedZeroDate: data.ml_prediction.predicted_date, isOffline: true });
          return;
        }
      }
      set({ error: err.detail || "Failed to fetch analytics.", isOffline: true });
    }
  },

  syncOfflineData: async (transactions: MpesaTransaction[]) => {
    set({ isLoading: true, error: null });
    
    // 1. Optimistic UI Update
    const currentTxns = get().transactions;
    let newBalance = get().currentBalance;
    
    // Create optimistic transactions
    const optimisticTxns = transactions.map(t => {
      if (t.type === 'in') newBalance += t.amount;
      if (t.type === 'out') newBalance -= t.amount;
      
      return {
        id: `optimistic_${Math.random().toString(36).substr(2, 9)}`,
        amount: t.amount,
        type: t.type,
        category: t.category,
        description: t.description || "",
        mpesa_receipt: t.mpesa_receipt,
        timestamp: t.timestamp
      } as TransactionData;
    });

    set({ 
      transactions: [...optimisticTxns, ...currentTxns],
      currentBalance: newBalance,
      statusMessage: "Syncing..." 
    });

    // 2. Perform actual API sync
    try {
      const result = await financeApi.syncTransactions(transactions);
      set({ statusMessage: result.message, isLoading: false, isOffline: false });
      
      // Refresh real data from backend to ensure consistency
      await get().fetchBurnRate();
      await get().fetchTransactions();
      await get().fetchAnalytics();
    } catch (err: any) {
      // If network fails, keep the optimistic updates but flag as offline
      set({ 
        isLoading: false, 
        isOffline: true,
        error: "Network unavailable. Transactions cached locally.",
        statusMessage: "Offline: Changes saved locally."
      });
    }
  },

  setDaysToHelb: (days: number) => {
    set({ daysToHelb: days });
  },
}));
