import HelbStats from '@/components/HelbStats';
import { ShieldAlert } from 'lucide-react';

export default function Dashboard() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-slate-900 pt-20">
      
      <div className="w-full max-w-4xl px-6 mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
            Comrade Central
          </h1>
          <p className="text-slate-400 mt-1">Survive, Grind, Thrive.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-950/50 border border-emerald-800 rounded-full text-emerald-400 text-sm font-bold">
          <ShieldAlert size={16} />
          Rep: 420
        </div>
      </div>

      <HelbStats />

      {/* Placeholder for future modules like The Forge and Sanctuary */}
      <div className="w-full max-w-4xl px-6 mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl">
          <h3 className="text-xl font-bold text-slate-200 mb-4">The Forge (Quests)</h3>
          <div className="text-slate-500 text-sm flex flex-col gap-3">
            <div className="p-3 bg-slate-800 rounded-lg border border-slate-700 flex justify-between">
              <span>OS Assignment 2</span>
              <span className="text-emerald-500">+50 XP</span>
            </div>
            <div className="p-3 bg-slate-800 rounded-lg border border-slate-700 flex justify-between">
              <span>Database Mock CAT</span>
              <span className="text-emerald-500">+100 XP</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl">
          <h3 className="text-xl font-bold text-slate-200 mb-4">Vybe Map</h3>
          <div className="h-32 bg-slate-800 rounded-lg border border-slate-700 flex items-center justify-center text-slate-500">
            Map loading... (Waiting for coordinates)
          </div>
        </div>

      </div>

    </main>
  );
}
