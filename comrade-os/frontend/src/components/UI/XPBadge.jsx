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
                        className="bg-neon-purple/15 text-neon-purple px-2 py-0.5 rounded-full text-[10px] font-semibold border border-neon-purple/20"
                        title={badge}
                    >
                        🏆 {badge}
                    </span>
                ))}
            </div>

            {/* XP Counter */}
            <div className="flex items-center gap-2 glass px-3 py-1.5 rounded-full">
                <span className="text-sm">⚡</span>
                <div className="flex flex-col leading-tight">
                    <span className="text-xs font-bold text-neon-yellow">{xp} XP</span>
                    <span className="text-[9px] text-gray-500">Lv.{level}</span>
                </div>
                {/* Mini progress to next level */}
                <div className="w-8 h-1.5 bg-surface-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-neon-yellow rounded-full transition-all duration-500"
                        style={{ width: `${xpInLevel}%` }}
                    />
                </div>
            </div>
        </motion.div>
    );
}