import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
    { to: '/', icon: '📊', label: 'Dashboard' },
    { to: '/ai', icon: '🤖', label: 'AI Assistant' },
    { to: '/finance', icon: '💰', label: 'Finance' },
    { to: '/schedule', icon: '⏳', label: 'Schedule' },
    { to: '/diet', icon: '🍽️', label: 'Diet' },
    { to: '/study', icon: '📚', label: 'Study' },
    { to: '/fitness', icon: '💪', label: 'Fitness' }
];

export default function Sidebar({ isOpen, onToggle }) {
    const location = useLocation();

    return (
        <>
            {/* Mobile overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onToggle}
                        className="fixed inset-0 z-40 lg:hidden"
                        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                initial={{ x: -280 }}
                animate={{ x: isOpen ? 0 : -280 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-[280px] h-screen flex flex-col fixed left-0 top-0 z-50 lg:translate-x-0 lg:z-30"
                style={{
                    background: 'var(--bg-secondary)',
                    borderRight: '1px solid var(--border)',
                }}
            >
                <SidebarContent location={location} onNavigate={onToggle} />
            </motion.aside>

            {/* Desktop: always-visible sidebar */}
            <div
                className="hidden lg:block w-[280px] h-screen fixed left-0 top-0 z-30"
                style={{
                    background: 'var(--bg-secondary)',
                    borderRight: '1px solid var(--border)',
                }}
            >
                <SidebarContent location={location} onNavigate={() => {}} />
            </div>
        </>
    );
}

function SidebarContent({ location, onNavigate }) {
    return (
        <>
            <div className="p-6 pb-2">
                <div className="flex items-center gap-3 mb-1">
                    <span className="text-3xl">🎓</span>
                    <h1 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '1.5px', color: 'var(--text-primary)' }}>
                        COMRADE OS
                    </h1>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '48px', marginTop: '-2px' }}>
                    Campus Life Operating System
                </p>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navItems.map(({ to, icon, label }) => {
                    const isActive = location.pathname === to;
                    return (
                        <NavLink
                            key={to}
                            to={to}
                            onClick={onNavigate}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl relative"
                            style={{
                                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                                background: 'transparent',
                                borderLeft: isActive ? '3px solid var(--accent-pink)' : '3px solid transparent',
                                transition: 'all 0.2s ease',
                                boxShadow: isActive ? '0 0 15px var(--glow-pink)' : 'none',
                            }}
                        >
                            <span className="text-lg">{icon}</span>
                            <span style={{ fontWeight: isActive ? 600 : 500, fontSize: '14px' }}>{label}</span>
                        </NavLink>
                    );
                })}
            </nav>

            <div
                className="mx-3 mb-4 p-4 rounded-xl"
                style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
            >
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    <span style={{ color: 'var(--text-primary)' }}>💡 Tip:</span> Use the AI Assistant to analyze your spending decisions.
                </p>
            </div>
        </>
    );
}