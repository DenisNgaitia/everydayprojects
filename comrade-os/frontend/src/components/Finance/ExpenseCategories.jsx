/**
 * ExpenseCategories.jsx
 * Renders a compact horizontal-bar breakdown of expenses by category.
 * Zero external libraries — pure SVG + CSS.
 */

import { motion } from 'framer-motion';

// Accent colours cycling per category
const PALETTE = [
    '#00e5ff',  // cyan
    '#ff2bd6',  // pink
    '#8b5cf6',  // purple
    '#39ff14',  // neon-green
    '#ffe500',  // yellow
    '#ff6b35',  // orange
];

// Category emoji icons
const CATEGORY_ICONS = {
    Food: '🍛',
    Transport: '🚌',
    Entertainment: '🎮',
    Airtime: '📱',
    Books: '📚',
    Other: '🧾',
};

export default function ExpenseCategories({ categoryTotals, totalSpent }) {
    if (!categoryTotals || Object.keys(categoryTotals).length === 0) {
        return (
            <div
                className="flex items-center justify-center rounded-2xl"
                style={{
                    height: '120px',
                    background: 'var(--panel)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                    fontSize: '13px',
                }}
            >
                No expenses logged yet.
            </div>
        );
    }

    // Sort categories from highest to lowest spend
    const sorted = Object.entries(categoryTotals)
        .sort(([, a], [, b]) => b - a);

    const safeTotal = totalSpent > 0 ? totalSpent : 1;

    return (
        <div className="flex flex-col gap-3">
            {sorted.map(([category, amount], idx) => {
                const pct = Math.round((amount / safeTotal) * 100);
                const color = PALETTE[idx % PALETTE.length];
                const icon = CATEGORY_ICONS[category] || '💰';

                return (
                    <motion.div
                        key={category}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                        {/* Row header */}
                        <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                                <span className="text-base">{icon}</span>
                                <span
                                    className="text-[13px] font-medium"
                                    style={{ color: 'var(--text-primary)' }}
                                >
                                    {category}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span
                                    className="text-[11px] font-semibold rounded-full px-2 py-0.5"
                                    style={{ color, background: `${color}18`, border: `1px solid ${color}40` }}
                                >
                                    {pct}%
                                </span>
                                <span
                                    className="text-[13px] font-bold tabular-nums"
                                    style={{ color: 'var(--text-primary)', minWidth: '70px', textAlign: 'right' }}
                                >
                                    KES {amount.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Bar track */}
                        <div
                            className="relative rounded-full overflow-hidden"
                            style={{ height: '5px', background: 'var(--border)' }}
                        >
                            <motion.div
                                className="absolute inset-y-0 left-0 rounded-full"
                                style={{
                                    background: color,
                                    boxShadow: `0 0 8px ${color}88`,
                                }}
                                initial={{ width: '0%' }}
                                animate={{ width: `${pct}%` }}
                                transition={{ delay: idx * 0.06 + 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                            />
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
