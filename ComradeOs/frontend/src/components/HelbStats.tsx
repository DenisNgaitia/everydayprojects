"use client";

import { useFinanceStore } from '../store/financeStore';
import { Wallet, TrendingDown, Clock, ShieldAlert } from 'lucide-react';

export default function HelbStats() {
  const { currentBalance, dailyBudget, daysToHelb, statusMessage, syncOfflineData } = useFinanceStore();

  const isBroke = dailyBudget < 100;

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

      {/* Days to HELB */}
      <div className="bg-slate-800/60 border border-slate-700 p-6 rounded-2xl flex flex-col gap-4 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-3 text-slate-400">
          <Clock size={24} />
          <h3 className="font-semibold text-lg">Days to HELB</h3>
        </div>
        <p className="text-4xl font-bold text-blue-400">
          {daysToHelb} Days
        </p>
      </div>

      {/* Status Message */}
      <div className={`col-span-1 md:col-span-3 p-4 rounded-xl flex items-center justify-between border ${isBroke ? 'bg-red-950/40 border-red-800 text-red-200' : 'bg-emerald-950/40 border-emerald-800 text-emerald-200'}`}>
        <div className="flex items-center gap-3">
          <ShieldAlert size={20} />
          <span className="font-medium tracking-wide">{statusMessage}</span>
        </div>
        <button 
          onClick={syncOfflineData}
          className="px-4 py-2 bg-slate-900/50 hover:bg-slate-900 border border-slate-700 rounded-lg text-sm font-semibold transition-all">
          Sync Offline M-Pesa
        </button>
      </div>

    </div>
  );
}
