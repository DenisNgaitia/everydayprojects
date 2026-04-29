import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import XPBadge from '../UI/XPBadge';
import ThemeToggle from '../UI/ThemeToggle';

export default function Layout({ children }) {
    const { state } = useAppContext();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    return (
        <div className="flex min-h-screen">
            <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(false)} />

            <main className="flex-1 lg:ml-[280px] min-h-screen">
                {/* Top bar */}
                <header className="sticky top-0 z-20 panel-strong px-4 sm:px-6 py-3 flex items-center justify-between">
                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="lg:hidden p-2 rounded-lg transition-colors"
                        style={{ color: 'var(--text-secondary)' }}
                        aria-label="Toggle menu"
                    >
                        <div className="space-y-1.5">
                            <span className="block w-5 h-0.5" style={{ background: 'var(--text-secondary)' }}></span>
                            <span className="block w-4 h-0.5" style={{ background: 'var(--text-secondary)' }}></span>
                            <span className="block w-5 h-0.5" style={{ background: 'var(--text-secondary)' }}></span>
                        </div>
                    </button>

                    {/* Hero */}
                    <div className="hero">
                        <h1>Comrade OS</h1>
                        <p>System Status: Stable</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <XPBadge xp={state.user.xp} badges={state.user.badges} />

                        {/* User info + logout */}
                        {user && (
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold uppercase"
                                    style={{
                                        background: 'linear-gradient(135deg, var(--accent-pink), var(--accent-purple))',
                                        color: '#fff',
                                        boxShadow: '0 0 10px var(--glow-pink)',
                                    }}
                                    title={user.email}
                                >
                                    {user.name?.charAt(0) || 'C'}
                                </div>
                                <button
                                    id="logout-btn"
                                    onClick={handleLogout}
                                    className="text-[11px] font-semibold px-3 py-1.5 rounded-full transition-all"
                                    style={{
                                        color: 'var(--text-secondary)',
                                        border: '1px solid var(--border)',
                                    }}
                                    title="Log out"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                {/* Page content */}
                <div className="p-4 sm:p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}