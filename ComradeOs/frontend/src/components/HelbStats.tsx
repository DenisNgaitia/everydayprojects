"use client";

import { useEffect } from 'react';
import { useFinanceStore } from '@/store/financeStore';
import { useAuthStore } from '@/store/authStore';
import { Wallet, TrendingDown, Clock, ShieldAlert, Loader2 } from 'lucide-react';

export default function HelbStats() {
  const { currentBalance, dailyBudget, daysToHelb, statusMessage, isLoading, error, fetchBurnRate, fetchTransactions, fetchAnalytics, analytics, predictedZeroDate } = useFinanceStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchBurnRate();
      fetchTransactions();
      fetchAnalytics();
    }
  }, [isAuthenticated, fetchBurnRate, fetchTransactions, fetchAnalytics]);

  const isBroke = dailyBudget < 100;

  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-4xl p-6">
        <div className="bg-slate-800/60 border border-slate-700 p-8 rounded-2xl text-center">
          <ShieldAlert size={40} className="mx-auto text-yellow-400 mb-4" />
          <p className="text-slate-300 text-lg font-semibold">Login to view your financial data, comrade.</p>
        </div>
      </div>
    );
  }

  if (isLoading && !analytics) {
    return (
      <div className="w-full max-w-4xl p-6">
        <div className="bg-slate-800/60 border border-slate-700 p-8 rounded-2xl text-center">
          <Loader2 size={32} className="mx-auto text-emerald-400 animate-spin mb-4" />
          <p className="text-slate-400">Loading your financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      
      {/* Current Balance */}
      <div className="bg-slate-800/60 border border-slate-700 p-6 rounded-2xl flex flex-col gap-4 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-3 text-slate-400">
          <Wallet size={24} />
          <h3 className="font-semibold text-lg">M-Pesa Vault</h3>
        </div>
        <p className={`text-4xl font-bold ${isBroke ? 'text-red-400' : 'text-emerald-400'}`}>
          Ksh {currentBalance.toFixed(2)}
        </p>
      </div>

      {/* Daily Burn Rate */}
      <div className="bg-slate-800/60 border border-slate-700 p-6 rounded-2xl flex flex-col gap-4 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-3 text-slate-400">
          <TrendingDown size={24} />
          <h3 className="font-semibold text-lg">Daily Survival</h3>
        </div>
        <p className={`text-4xl font-bold ${isBroke ? 'text-red-400' : 'text-emerald-400'}`}>
          Ksh {dailyBudget.toFixed(2)}
        </p>
      </div>

      {/* Zero Balance Prediction */}
      <div className="bg-slate-800/60 border border-slate-700 p-6 rounded-2xl flex flex-col gap-4 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-3 text-slate-400">
          <Clock size={24} />
          <h3 className="font-semibold text-lg">Zero Balance Date</h3>
        </div>
        <p className={`text-4xl font-bold ${predictedZeroDate === new Date().toISOString().split('T')[0] ? 'text-red-500' : 'text-blue-400'}`}>
          {predictedZeroDate || "Analyzing..."}
        </p>
        {analytics?.ml_prediction?.days_remaining !== undefined && (
          <p className="text-sm text-slate-500">In {analytics.ml_prediction.days_remaining} days</p>
        )}
      </div>

      {/* Analytics Streaks & Averages */}
      {analytics && (
        <div className="col-span-1 md:col-span-3 bg-slate-800/60 border border-slate-700 p-6 rounded-2xl shadow-lg backdrop-blur-sm grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
             <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Category Breakdown</h3>
             <div className="flex flex-col gap-2">
                {Object.entries(analytics.category_breakdown).length > 0 ? (
                  Object.entries(analytics.category_breakdown).map(([category, amount]) => (
                    <div key={category} className="flex justify-between text-slate-300">
                      <span className="capitalize">{category}</span>
                      <span className="font-semibold">Ksh {Number(amount).toFixed(2)}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 text-sm">No spending data yet.</div>
                )}
             </div>
          </div>
          <div className="flex flex-col gap-4">
             <div>
               <h3 className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Average Daily Spend</h3>
               <p className="text-2xl font-bold text-emerald-400">Ksh {analytics.daily_average_spend.toFixed(2)}</p>
             </div>
             {analytics.spending_streak.warning && (
               <div className="bg-red-950/40 border border-red-800 p-3 rounded-lg text-red-400 text-sm flex items-start gap-2">
                  <ShieldAlert size={16} className="mt-0.5 shrink-0" />
                  <p>{analytics.spending_streak.warning}</p>
               </div>
             )}
          </div>
        </div>
      )}

      {/* Status Message */}
      <div className={`col-span-1 md:col-span-3 p-4 rounded-xl flex items-center justify-between border ${isBroke ? 'bg-red-950/40 border-red-800 text-red-200' : 'bg-emerald-950/40 border-emerald-800 text-emerald-200'}`}>
        <div className="flex items-center gap-3">
          <ShieldAlert size={20} />
          <span className="font-medium tracking-wide">{error || statusMessage}</span>
        </div>
        <button 
          onClick={() => {
            fetchBurnRate();
            fetchTransactions();
            fetchAnalytics();
          }}
          className="px-4 py-2 bg-slate-900/50 hover:bg-slate-900 border border-slate-700 rounded-lg text-sm font-semibold transition-all">
          Refresh Data
        </button>
      </div>

    </div>
  );
}
