import { useState } from 'react';
import Sidebar from './Sidebar';
import { useAppContext } from '../../context/AppContext';
import XPBadge from '../UI/XPBadge';

export default function Layout({ children }) {
    const { state } = useAppContext();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen">
            <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(false)} />

            <main className="flex-1 lg:ml-[280px] min-h-screen">
                {/* Top bar */}
                <header className="sticky top-0 z-20 glass-strong px-4 sm:px-6 py-3 flex items-center justify-between">
                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
                        aria-label="Toggle menu"
                    >
                        <div className="space-y-1.5">
                            <span className="block w-5 h-0.5 bg-gray-300"></span>
                            <span className="block w-4 h-0.5 bg-gray-300"></span>
                            <span className="block w-5 h-0.5 bg-gray-300"></span>
                        </div>
                    </button>

                    <div className="flex items-center gap-2">
                        <h2 className="text-lg sm:text-xl font-semibold">
                            <span className="text-gray-400 font-normal hidden sm:inline">Welcome back, </span>
                            <span className="bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent font-bold">
                                {state.user.name}
                            </span>
                        </h2>
                    </div>

                    <XPBadge xp={state.user.xp} badges={state.user.badges} />
                </header>

                {/* Page content */}
                <div className="p-4 sm:p-6 lg:p-8 animate-fade-in">
                    {children}
                </div>
            </main>
        </div>
    );
}