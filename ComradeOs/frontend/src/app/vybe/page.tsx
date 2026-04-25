"use client";

import { useFinanceStore } from '@/store/financeStore';
import { MapPin, ShieldCheck, ShieldAlert, ShoppingBag } from 'lucide-react';

const MOCK_SPOTS = [
  { id: "1", name: "Maina's Kibanda", category: "Food", cost: 150.0, isSafe: true },
  { id: "2", name: "Student Center Lounge", category: "Vybe", cost: 500.0, isSafe: true },
  { id: "3", name: "Campus Library", category: "Study", cost: 0.0, isSafe: true },
  { id: "4", name: "The Emerald Club", category: "Vybe", cost: 1500.0, isSafe: false },
];

export default function VybeMap() {
  const { dailyBudget } = useFinanceStore();

  // Filter spots where cost is less than or equal to current survival budget
  const availableSpots = MOCK_SPOTS.filter(spot => spot.cost <= dailyBudget);
  const tooExpensiveSpots = MOCK_SPOTS.filter(spot => spot.cost > dailyBudget);

  return (
    <main className="flex min-h-screen flex-col items-center bg-slate-900 pt-20 pb-20">
      
      <div className="w-full max-w-4xl px-6 mb-8">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          The Vybe Map
        </h1>
        <p className="text-slate-400 mt-1">
          Showing spots that fit your Daily Survival Budget (Ksh {dailyBudget.toFixed(2)})
        </p>
      </div>

      <div className="w-full max-w-4xl px-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Affordable Spots */}
        <div>
          <h2 className="text-xl font-bold text-emerald-400 mb-4 flex items-center gap-2">
            <MapPin size={20} /> Form yako iko hapa
          </h2>
          <div className="flex flex-col gap-4">
            {availableSpots.length === 0 ? (
              <p className="text-slate-500">Zii comrade. No spots available for this budget. Soma kwa room.</p>
            ) : (
              availableSpots.map(spot => (
                <div key={spot.id} className="bg-slate-800/80 border border-emerald-900/50 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-slate-200">{spot.name}</h3>
                    <div className="flex items-center gap-2 text-xs mt-1">
                      <span className="px-2 py-1 bg-slate-700 rounded-md text-slate-300">{spot.category}</span>
                      {spot.isSafe ? (
                        <span className="text-emerald-500 flex items-center gap-1"><ShieldCheck size={14}/> Safe</span>
                      ) : (
                        <span className="text-yellow-500 flex items-center gap-1"><ShieldAlert size={14}/> Caution</span>
                      )}
                    </div>
                  </div>
                  <div className="text-emerald-400 font-bold">Ksh {spot.cost}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Too Expensive Spots */}
        <div className="opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
          <h2 className="text-xl font-bold text-slate-500 mb-4 flex items-center gap-2">
            <ShieldAlert size={20} /> Imebonda (Out of Budget)
          </h2>
          <div className="flex flex-col gap-4">
            {tooExpensiveSpots.map(spot => (
              <div key={spot.id} className="bg-slate-800/40 border border-slate-700 p-4 rounded-xl flex justify-between items-center cursor-not-allowed">
                <div>
                  <h3 className="font-bold text-slate-400">{spot.name}</h3>
                  <span className="text-xs text-slate-500">{spot.category}</span>
                </div>
                <div className="text-red-400 font-bold">Ksh {spot.cost}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="w-full max-w-4xl px-6 mt-12">
        <h2 className="text-2xl font-bold text-slate-200 mb-6 flex items-center gap-3">
          <ShoppingBag className="text-purple-400" /> Peer Marketplace
        </h2>
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl flex items-center justify-center text-slate-500 h-32">
          Marketplace module loading... (Requires Comrade Pro)
        </div>
      </div>

    </main>
  );
}
