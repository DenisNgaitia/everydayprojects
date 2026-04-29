/**
 * BudgetSuggestions.jsx
 * Displays the "You have X days left" survival projection plus
 * context-sensitive budget tips driven by calculateSurvivalDays() output.
 */

import { motion } from 'framer-motion';

function SurvivalMeter({ days }) {
    // Visual urgency: >14 days = safe, 7-14 = caution, 3-7 = danger, <3 = critical
    const isInfinite = days === Infinity || days >= 999;

    const { color, glowColor, label, emoji } = isInfinite
        ? { color: '#00e5ff', glowColor: 'rgba(0,229,255,0.3)', label: 'All Good', emoji: '🟢' }
        : days >= 14
        ? { color: '#00e5ff', glowColor: 'rgba(0,229,255,0.3)', label: 'Safe', emoji: '✅' }
        : days >= 7
        ? { color: '#8b5cf6', glowColor: 'rgba(139,92,246,0.3)', label: 'Caution', emoji: '⚡' }
        : days >= 3
        ? { color: '#ffe500', glowColor: 'rgba(255,229,0,0.3)', label: 'Danger', emoji: '⚠️' }
        : { color: '#ff2bd6', glowColor: 'rgba(255,43,214,0.3)', label: 'Critical', emoji: '🚨' };

    const displayDays = isInfinite ? '∞' : String(days);

    return (
        <motion.div
            className="flex flex-col items-center justify-center rounded-2xl py-7 px-6 text-center"
            style={{
                background: 'var(--panel)',
                border: `1px solid ${color}`,
                boxShadow: `0 0 28px ${glowColor}`,
            }}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
            {/* Status emoji */}
            <motion.div
                className="text-3xl mb-3"
                animate={days < 3 && !isInfinite
                    ? { scale: [1, 1.15, 1] }
                    : {}}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            >
                {emoji}
            </motion.div>

            {/* Days number */}
            <div
                className="font-black leading-none mb-1"
                style={{ fontSize: '56px', color, filter: `drop-shadow(0 0 12px ${color})` }}
            >
                {displayDays}
            </div>
            <div
                className="text-[13px] font-semibold mb-1"
                style={{ color }}
            >
                {isInfinite ? 'days of runway' : `day${days !== 1 ? 's' : ''} of runway`}
            </div>

            {/* Status badge */}
            <span
                className="text-[11px] font-bold uppercase tracking-widest mt-2 px-3 py-1 rounded-full"
                style={{ color, border: `1px solid ${color}`, opacity: 0.9 }}
            >
                {label}
            </span>

            <p className="text-[12px] mt-3" style={{ color: 'var(--text-secondary)' }}>
                You have <strong style={{ color }}>{isInfinite ? 'plenty of' : `${displayDays}`}</strong>{' '}
                {isInfinite ? 'funds' : `day${days !== 1 ? 's' : ''}`} left at your current burn rate.
            </p>
        </motion.div>
    );
}

function StatRow({ label, value, sub, color }) {
    return (
        <div
            className="flex items-center justify-between rounded-xl px-4 py-3"
            style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
        >
            <div>
                <p className="text-[11px] uppercase tracking-widest" style={{ color: 'var(--text-secondary)', marginBottom: '2px' }}>{label}</p>
                {sub && <p className="text-[11px]" style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>{sub}</p>}
            </div>
            <span className="text-[18px] font-bold tabular-nums" style={{ color: color || 'var(--text-primary)' }}>
                {value}
            </span>
        </div>
    );
}

function Tip({ icon, text, urgency }) {
    const borderColor = urgency === 'high' ? 'var(--accent-pink)'
        : urgency === 'medium' ? 'var(--accent-purple)'
        : 'var(--border)';
    return (
        <div
            className="flex items-start gap-3 rounded-xl px-4 py-3"
            style={{ background: 'var(--panel)', border: `1px solid ${borderColor}` }}
        >
            <span className="text-base shrink-0 mt-0.5">{icon}</span>
            <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{text}</p>
        </div>
    );
}

export default function BudgetSuggestions({ survivalData, balance, incomeWeekly }) {
    const { dailyAverage, survivalDays, weeklyBurnRate } = survivalData;

    const isInfinite = survivalDays === Infinity || survivalDays >= 999;

    // ── Contextual budget tips ────────────────────────────────────────────
    const tips = [];

    if (!isInfinite && survivalDays < 3) {
        tips.push({ icon: '🚨', urgency: 'high', text: 'Emergency mode: switch to survival diet, cut all non-essential spending immediately.' });
    }

    if (!isInfinite && survivalDays < 7) {
        tips.push({ icon: '💸', urgency: 'high', text: `At KES ${dailyAverage}/day you'll run out before the week ends. Target KES ${Math.floor(balance / 7)}/day to make it.` });
    }

    if (weeklyBurnRate > incomeWeekly * 0.8) {
        tips.push({ icon: '📊', urgency: 'medium', text: `You've spent ${Math.round((weeklyBurnRate / incomeWeekly) * 100)}% of your weekly income. Consider cutting entertainment and transport.` });
    }

    if (dailyAverage > 0 && dailyAverage < incomeWeekly / 7 * 0.6) {
        tips.push({ icon: '🎯', urgency: 'low', text: `Great discipline — you're spending KES ${dailyAverage}/day vs a KES ${Math.round(incomeWeekly / 7)} daily budget. Keep it up.` });
    }

    if (balance > incomeWeekly) {
        tips.push({ icon: '💰', urgency: 'low', text: 'You have surplus funds this week. Consider saving or investing the remainder.' });
    }

    if (tips.length === 0) {
        tips.push({ icon: '✅', urgency: 'low', text: 'Spending looks balanced. Monitor daily to stay on track.' });
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Central survival countdown */}
            <SurvivalMeter days={survivalDays} />

            {/* Key stats row */}
            <div className="grid grid-cols-2 gap-3">
                <StatRow
                    label="Daily Average"
                    sub="KES / day"
                    value={`${dailyAverage.toLocaleString()}`}
                    color="var(--accent-cyan)"
                />
                <StatRow
                    label="Total Spent"
                    sub="this period"
                    value={`${weeklyBurnRate.toLocaleString()}`}
                    color="var(--accent-pink)"
                />
            </div>

            {/* Budget tips */}
            <div className="flex flex-col gap-2">
                <p className="text-[11px] uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                    Budget Intelligence
                </p>
                {tips.map((t, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08, duration: 0.4 }}
                    >
                        <Tip {...t} />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
