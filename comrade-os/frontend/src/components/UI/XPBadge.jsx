import { motion } from 'framer-motion';

export default function XPBadge({ xp, badges = [] }) {
    const level = Math.floor(xp / 100) + 1;
    const xpInLevel = xp % 100;

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-3"
        >
            {/* Badges */}
            <div className="hidden sm:flex items-center gap-1.5">
                {badges.map((badge, i) => (
                    <span
                        key={i}
                        className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        style={{ background: 'var(--panel)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                        title={badge}
                    >
                        🏆 {badge}
                    </span>
                ))}
            </div>

            {/* XP Counter */}
            <div className="flex items-center gap-2 panel px-3 py-1.5 rounded-full">
                <span className="text-sm">⚡</span>
                <div className="flex flex-col leading-tight">
                    <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{xp} XP</span>
                    <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>Lv.{level}</span>
                </div>
                {/* Mini progress to next level */}
                <div className="w-8 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                    <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${xpInLevel}%`, background: 'var(--accent-purple)' }}
                    />
                </div>
            </div>
        </motion.div>
    );
}