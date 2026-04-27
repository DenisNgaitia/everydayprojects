import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                initial={{ x: -280 }}
                animate={{ x: isOpen ? 0 : -280 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="w-[280px] h-screen glass-strong flex flex-col fixed left-0 top-0 z-50 lg:translate-x-0 lg:z-30"
                style={{ transform: undefined }}
            >
                {/* Always visible on desktop */}
                <div className="hidden lg:flex lg:flex-col lg:h-full">
                    <SidebarContent location={location} onNavigate={onToggle} />
                </div>
                {/* Mobile: animated */}
                <div className="flex flex-col h-full lg:hidden">
                    <SidebarContent location={location} onNavigate={onToggle} />
                </div>
            </motion.aside>

            {/* Desktop: always-visible sidebar */}
            <div className="hidden lg:block w-[280px] h-screen fixed left-0 top-0 z-30 glass-strong">
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
                    <h1 className="text-xl font-bold tracking-wide bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
                        COMRADE OS
                    </h1>
                </div>
                <p className="text-[11px] text-gray-500 ml-12 -mt-1">Campus Life Operating System</p>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navItems.map(({ to, icon, label }) => {
                    const isActive = location.pathname === to;
                    return (
                        <NavLink
                            key={to}
                            to={to}
                            onClick={onNavigate}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                                isActive
                                    ? 'bg-neon-cyan/10 text-neon-cyan'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                            }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="sidebar-active"
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-neon-cyan rounded-r-full"
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                />
                            )}
                            <span className="text-lg">{icon}</span>
                            <span className="font-medium text-sm">{label}</span>
                        </NavLink>
                    );
                })}
            </nav>

            <div className="p-4 mx-3 mb-4 rounded-xl bg-gradient-to-br from-neon-purple/10 to-neon-cyan/10 border border-white/5">
                <p className="text-xs text-gray-400 leading-relaxed">
                    <span className="text-neon-yellow">💡 Tip:</span> Use the AI Assistant to analyze your spending decisions.
                </p>
            </div>
        </>
    );
}