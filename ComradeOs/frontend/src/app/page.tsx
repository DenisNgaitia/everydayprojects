import { ShieldAlert, BookOpen, MapPin, BrainCircuit } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 lg:p-24 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950">
      
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-800 bg-slate-900/50 pb-6 pt-8 backdrop-blur-2xl lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-slate-800/30 lg:p-4 text-emerald-400 font-bold tracking-widest uppercase">
          ComradeOS v1.0.0
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-slate-900 via-slate-900/80 lg:static lg:h-auto lg:w-auto lg:bg-none">
          <span className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0 text-slate-400">
            By <span className="font-bold text-white tracking-wider">DenisNgaitia</span>
          </span>
        </div>
      </div>

      <div className="relative flex flex-col place-items-center mt-20 mb-16 lg:mt-32">
        <h1 className="text-6xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600 mb-6 drop-shadow-lg text-center">
          Survive.<br/>Grind.<br/>Thrive.
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl text-center font-sans">
          The ultimate campus life engine for Kenyan students. Gamified survival, HELB vaults, and a zero-judgment sanctuary.
        </p>
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left gap-6">
        
        <div className="group rounded-2xl border border-transparent px-5 py-6 transition-colors hover:border-emerald-800 hover:bg-emerald-950/30 bg-slate-800/40 backdrop-blur-sm shadow-xl">
          <div className="flex items-center gap-3 mb-3 text-emerald-400">
            <BookOpen size={28} />
            <h2 className="text-2xl font-semibold">The Forge</h2>
          </div>
          <p className="m-0 max-w-[30ch] text-sm text-slate-400">
            Academic RPG. Convert CATs into boss fights. Grind for Rep.
          </p>
        </div>

        <div className="group rounded-2xl border border-transparent px-5 py-6 transition-colors hover:border-red-800 hover:bg-red-950/30 bg-slate-800/40 backdrop-blur-sm shadow-xl">
          <div className="flex items-center gap-3 mb-3 text-red-400">
            <ShieldAlert size={28} />
            <h2 className="text-2xl font-semibold">HELB Vault</h2>
          </div>
          <p className="m-0 max-w-[30ch] text-sm text-slate-400">
            Financial guardian. Daily burn rates and M-Pesa tracking locally.
          </p>
        </div>

        <div className="group rounded-2xl border border-transparent px-5 py-6 transition-colors hover:border-purple-800 hover:bg-purple-950/30 bg-slate-800/40 backdrop-blur-sm shadow-xl">
          <div className="flex items-center gap-3 mb-3 text-purple-400">
            <BrainCircuit size={28} />
            <h2 className="text-2xl font-semibold">Sanctuary</h2>
          </div>
          <p className="m-0 max-w-[30ch] text-sm text-slate-400">
            Zero-knowledge vent terminal. Clear your head safely.
          </p>
        </div>

        <div className="group rounded-2xl border border-transparent px-5 py-6 transition-colors hover:border-blue-800 hover:bg-blue-950/30 bg-slate-800/40 backdrop-blur-sm shadow-xl">
          <div className="flex items-center gap-3 mb-3 text-blue-400">
            <MapPin size={28} />
            <h2 className="text-2xl font-semibold">Vybe Map</h2>
          </div>
          <p className="m-0 max-w-[30ch] text-sm text-slate-400">
            Where is the form? Find spots based on your current budget.
          </p>
        </div>

      </div>

      <div className="mt-20 flex gap-4">
        <button className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-full transition-all shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)]">
          Join the Beta
        </button>
        <button className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold rounded-full transition-all border border-slate-700">
          View Docs
        </button>
      </div>

    </main>
  );
}
