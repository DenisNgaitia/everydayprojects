import { useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import AIAvatar from '../components/UI/Avatars';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { updateFromModules } from '../core/ComradeEngine';

// ─── Animation Presets ────────────────────────────────────────────────────────

const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const fadeIn = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.4 } },
};

// ─── Insight Engine ───────────────────────────────────────────────────────────

/**
 * Derives all three insight collections from a ComradeState snapshot.
 * Pure function — no side effects, no network calls.
 */
function deriveInsights(engineState) {
    const { metrics, modules, user } = engineState;
    const { energyScore, moneyHealth, disciplineScore, academicProgress, survivalProbability } = metrics;
    const { finance, schedule, study, diet, fitness } = modules;

    // ── Critical Actions ────────────────────────────────────────────────
    const actions = [];

    if (moneyHealth < 40) {
        const daysLeft = finance.incomeWeekly > 0
            ? Math.floor((finance.balance / finance.incomeWeekly) * 7)
            : 0;
        actions.push({
            id: 'funds-low',
            icon: '💸',
            label: 'Track your spending',
            detail: `KES ${finance.balance.toLocaleString()} left — roughly ${daysLeft} day${daysLeft !== 1 ? 's' : ''} of runway.`,
            route: '/finance',
            accent: 'pink',
        });
    }

    if (academicProgress < 30) {
        actions.push({
            id: 'study-gap',
            icon: '📖',
            label: 'Add a study note today',
            detail: `Academic progress at ${academicProgress}%. Even one solid note moves the needle.`,
            route: '/study',
            accent: 'cyan',
        });
    } else if (academicProgress < 60) {
        actions.push({
            id: 'study-mid',
            icon: '📚',
            label: 'Keep the study streak alive',
            detail: `${study.notes.length} note${study.notes.length !== 1 ? 's' : ''} logged. Target is 10 — ${Math.max(0, 10 - study.notes.length)} to go.`,
            route: '/study',
            accent: 'cyan',
        });
    }

    if (energyScore < 50) {
        actions.push({
            id: 'energy-low',
            icon: '🔋',
            label: 'Prioritise recovery today',
            detail: `Energy at ${energyScore}%. Sleep quality: ${fitness.lastSleepQuality}/10. Consider a shorter workout or extra rest.`,
            route: '/fitness',
            accent: 'purple',
        });
    }

    if (schedule.studyHours < 3) {
        actions.push({
            id: 'schedule-study',
            icon: '⏱',
            label: 'Block more study time',
            detail: `Only ${schedule.studyHours}h scheduled for study. The recommended minimum is 3h for academic consistency.`,
            route: '/schedule',
            accent: 'cyan',
        });
    }

    if (diet.budgetMode === 'survival') {
        actions.push({
            id: 'diet-survival',
            icon: '🥣',
            label: 'You\'re in survival diet mode',
            detail: 'Caloric intake is limited. Try to restore normal meals when finances allow.',
            route: '/diet',
            accent: 'pink',
        });
    }

    if (actions.length === 0) {
        actions.push({
            id: 'all-clear',
            icon: '✅',
            label: 'All systems nominal',
            detail: `Survival at ${survivalProbability}%. Comrade ${user.name} is operating at full capacity.`,
            route: null,
            accent: 'cyan',
        });
    }

    // ── System Warnings ─────────────────────────────────────────────────
    const warnings = [];

    if (moneyHealth < 30) {
        warnings.push({
            id: 'warn-broke',
            icon: '⚠️',
            severity: 'critical',
            text: `Money health critical (${moneyHealth}%). At current burn rate, funds may run out this week.`,
        });
    }

    if (survivalProbability < 40) {
        warnings.push({
            id: 'warn-survival',
            icon: '🚨',
            severity: 'critical',
            text: `Survival probability is ${survivalProbability}%. Multiple systems are degraded — immediate intervention needed.`,
        });
    }

    if (schedule.sleepHours < 6) {
        warnings.push({
            id: 'warn-sleep',
            icon: '😴',
            severity: 'moderate',
            text: `Sleep scheduled at only ${schedule.sleepHours}h. Chronic under-sleep impairs cognition and decision-making.`,
        });
    }

    if (disciplineScore < 35) {
        warnings.push({
            id: 'warn-discipline',
            icon: '📉',
            severity: 'moderate',
            text: `Discipline score is low (${disciplineScore}/100). Study hours, sleep, and diet consistency need attention.`,
        });
    }

    const totalHours = schedule.sleepHours + schedule.studyHours + schedule.freeTimeHours;
    if (totalHours > 24) {
        warnings.push({
            id: 'warn-time',
            icon: '🕐',
            severity: 'moderate',
            text: `Scheduled hours exceed 24h (${totalHours}h). Your schedule is overloaded — something will slip.`,
        });
    }

    // ── AI Summary ──────────────────────────────────────────────────────
    let statusLine = '';
    let summaryBody = '';

    if (survivalProbability >= 75) {
        statusLine = `Comrade ${user.name} is in strong shape.`;
        summaryBody = `Survival probability: ${survivalProbability}%. Money health is ${moneyHealth >= 60 ? 'solid' : 'manageable'}, energy is ${energyScore >= 60 ? 'high' : 'moderate'}, and academic progress is at ${academicProgress}%. Keep the momentum — discipline compounds.`;
    } else if (survivalProbability >= 50) {
        statusLine = `Comrade ${user.name} is holding — barely.`;
        summaryBody = `Survival probability: ${survivalProbability}%. ${moneyHealth < 50 ? 'Finances need attention. ' : ''}${energyScore < 50 ? 'Recovery should be a priority today. ' : ''}${academicProgress < 50 ? 'Study sessions are falling behind target. ' : ''}Focus on the critical actions above.`;
    } else {
        statusLine = `Comrade ${user.name}, the situation is serious.`;
        summaryBody = `Survival probability: ${survivalProbability}%. Multiple systems are in the red. ${moneyHealth < 30 ? 'Funds are critically low. ' : ''}${energyScore < 30 ? 'You are running on empty. ' : ''}${disciplineScore < 30 ? 'Discipline has broken down. ' : ''}Execute the priority actions immediately.`;
    }

    const pillars = [
        { label: 'Energy', value: energyScore, accent: energyScore >= 60 ? 'cyan' : energyScore >= 35 ? 'purple' : 'pink' },
        { label: 'Money', value: moneyHealth, accent: moneyHealth >= 60 ? 'cyan' : moneyHealth >= 35 ? 'purple' : 'pink' },
        { label: 'Discipline', value: disciplineScore, accent: disciplineScore >= 60 ? 'cyan' : disciplineScore >= 35 ? 'purple' : 'pink' },
        { label: 'Academic', value: academicProgress, accent: academicProgress >= 60 ? 'cyan' : academicProgress >= 35 ? 'purple' : 'pink' },
    ];

    return { actions, warnings, summary: { statusLine, summaryBody, survivalProbability, pillars } };
}

// ─── Score Ring ───────────────────────────────────────────────────────────────

function ScoreRing({ value, label, accent }) {
    const r = 28;
    const circ = 2 * Math.PI * r;
    const offset = circ - (value / 100) * circ;
    const colorMap = {
        cyan: 'var(--accent-cyan)',
        pink: 'var(--accent-pink)',
        purple: 'var(--accent-purple)',
    };
    const color = colorMap[accent] || 'var(--accent-cyan)';

    return (
        <div className="flex flex-col items-center gap-1.5">
            <svg width="72" height="72" className="-rotate-90">
                <circle cx="36" cy="36" r={r} fill="none" stroke="var(--border)" strokeWidth="5" />
                <circle
                    cx="36" cy="36" r={r}
                    fill="none"
                    stroke={color}
                    strokeWidth="5"
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{
                        filter: `drop-shadow(0 0 6px ${color})`,
                        transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16,1,0.3,1)',
                    }}
                />
            </svg>
            <span className="text-[13px] font-bold" style={{ color }}>
                {value}
            </span>
            <span className="label" style={{ marginBottom: 0 }}>{label}</span>
        </div>
    );
}

// ─── Warning Item ─────────────────────────────────────────────────────────────

function WarningItem({ icon, severity, text }) {
    const borderColor = severity === 'critical' ? 'var(--accent-pink)' : 'var(--accent-purple)';
    const glowColor = severity === 'critical' ? 'var(--glow-pink)' : 'rgba(139,92,246,0.2)';
    return (
        <div
            className="flex items-start gap-3 px-4 py-3 rounded-2xl"
            style={{
                background: 'var(--panel)',
                border: `1px solid ${borderColor}`,
                boxShadow: `0 0 14px ${glowColor}`,
            }}
        >
            <span className="text-lg mt-0.5 shrink-0">{icon}</span>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{text}</p>
        </div>
    );
}

// ─── Action Item ──────────────────────────────────────────────────────────────

function ActionItem({ icon, label, detail, route, accent, navigate }) {
    const accentColor = accent === 'pink'
        ? 'var(--accent-pink)' : accent === 'purple'
        ? 'var(--accent-purple)' : 'var(--accent-cyan)';

    return (
        <motion.div
            className="flex items-start gap-4 rounded-2xl px-5 py-4 cursor-pointer"
            style={{
                background: 'var(--panel)',
                border: '1px solid var(--border)',
            }}
            whileHover={route ? {
                borderColor: accentColor,
                boxShadow: `0 0 20px rgba(${accent === 'pink' ? '255,43,214' : accent === 'purple' ? '139,92,246' : '0,229,255'},0.25)`,
                x: 3,
            } : {}}
            onClick={() => route && navigate(route)}
        >
            <span className="text-2xl shrink-0 mt-0.5">{icon}</span>
            <div className="flex-1 min-w-0">
                <p
                    className="font-semibold text-[15px] leading-snug mb-1"
                    style={{ color: accentColor }}
                >
                    {label}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {detail}
                </p>
            </div>
            {route && (
                <span className="text-sm shrink-0 mt-1" style={{ color: 'var(--text-secondary)' }}>→</span>
            )}
        </motion.div>
    );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ label, count, accent }) {
    const accentColor = accent === 'pink' ? 'var(--accent-pink)' : accent === 'purple' ? 'var(--accent-purple)' : 'var(--accent-cyan)';
    return (
        <div className="flex items-center gap-3 mb-4">
            <span
                className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{ color: accentColor, border: `1px solid ${accentColor}`, opacity: 0.9 }}
            >
                {label}
            </span>
            {count !== undefined && (
                <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                    {count} item{count !== 1 ? 's' : ''}
                </span>
            )}
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        </div>
    );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {
    const { state } = useAppContext();
    const navigate = useNavigate();

    // Derive engine state from current AppContext data.
    // useMemo ensures recompute only when the underlying module data changes.
    const engineState = useMemo(() => {
        // updateFromModules() reads fresh from localStorage — always in sync.
        return updateFromModules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.finance, state.schedule, state.diet, state.study, state.fitness]);

    const { actions, warnings, summary } = useMemo(
        () => deriveInsights(engineState),
        [engineState]
    );

    // ── Loading State ────────────────────────────────────────────────────
    if (state.loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                >
                    <motion.div
                        className="text-5xl mb-4"
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                    >
                        🎓
                    </motion.div>
                    <p style={{ color: 'var(--text-secondary)' }}>Initialising ComradeEngine...</p>
                </motion.div>
            </div>
        );
    }

    const survivalColor =
        summary.survivalProbability >= 70 ? 'var(--accent-cyan)'
        : summary.survivalProbability >= 45 ? 'var(--accent-purple)'
        : 'var(--accent-pink)';

    return (
        <motion.div
            className="dashboard"
            variants={stagger}
            initial="hidden"
            animate="show"
        >
            {/* ── Hero Header ─────────────────────────────────────────── */}
            <motion.div variants={fadeUp} className="hero">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '0.5px', color: 'var(--text-primary)', marginBottom: '4px' }}>
                            Good {getGreeting()}, <span style={{ color: 'var(--accent-cyan)' }}>{engineState.user.name}</span>.
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                            {new Date().toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                    </div>

                    {/* Survival Score Badge */}
                    <div
                        className="flex flex-col items-center justify-center rounded-2xl px-5 py-3 shrink-0"
                        style={{
                            background: 'var(--panel)',
                            border: `1px solid ${survivalColor}`,
                            boxShadow: `0 0 20px rgba(${summary.survivalProbability >= 70 ? '0,229,255' : summary.survivalProbability >= 45 ? '139,92,246' : '255,43,214'},0.2)`,
                            minWidth: '90px',
                        }}
                    >
                        <span className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>Survival</span>
                        <span className="text-[28px] font-black leading-none" style={{ color: survivalColor }}>
                            {summary.survivalProbability}
                        </span>
                        <span className="text-[10px] font-semibold" style={{ color: survivalColor, opacity: 0.8 }}>/ 100</span>
                    </div>
                </div>
            </motion.div>

            {/* ── Today's Critical Actions ─────────────────────────────── */}
            <motion.div variants={fadeUp}>
                <SectionHeader label="Critical Actions" count={actions.length} accent="cyan" />
                <motion.div
                    className="flex flex-col gap-3"
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                >
                    <AnimatePresence>
                        {actions.map((action) => (
                            <motion.div key={action.id} variants={fadeIn} layout>
                                <ActionItem {...action} navigate={navigate} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            </motion.div>

            {/* ── System Warnings ──────────────────────────────────────── */}
            <motion.div variants={fadeUp}>
                <SectionHeader label="System Warnings" count={warnings.length} accent="pink" />
                {warnings.length === 0 ? (
                    <div
                        className="px-5 py-4 rounded-2xl text-sm"
                        style={{ background: 'var(--panel)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                    >
                        No active warnings. All parameters within acceptable range.
                    </div>
                ) : (
                    <motion.div
                        className="flex flex-col gap-3"
                        variants={stagger}
                        initial="hidden"
                        animate="show"
                    >
                        <AnimatePresence>
                            {warnings.map((w) => (
                                <motion.div key={w.id} variants={fadeIn} layout>
                                    <WarningItem {...w} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </motion.div>

            {/* ── AI Summary ───────────────────────────────────────────── */}
            <motion.div variants={fadeUp}>
                <SectionHeader label="AI Summary" accent="purple" />
                <div
                    className="rounded-2xl px-5 py-5"
                    style={{
                        background: 'var(--panel)',
                        border: '1px solid var(--border)',
                    }}
                >
                    {/* Status line */}
                    <p
                        className="font-semibold text-[15px] mb-2 leading-snug"
                        style={{ color: 'var(--text-primary)' }}
                    >
                        {summary.statusLine}
                    </p>

                    {/* Body copy */}
                    <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>
                        {summary.summaryBody}
                    </p>

                    {/* Pillar scores */}
                    <div className="flex justify-around pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                        {summary.pillars.map((p) => (
                            <ScoreRing key={p.label} value={p.value} label={p.label} accent={p.accent} />
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* ── Command Bar ──────────────────────────────────────────── */}
            <motion.div variants={fadeUp} className="command-bar">
                <button id="cmd-ask-ai" onClick={() => navigate('/ai')}>Ask AI</button>
                <button id="cmd-log-expense" onClick={() => navigate('/finance')}>Log Expense</button>
                <button id="cmd-add-note" onClick={() => navigate('/study')}>Add Note</button>
                <button id="cmd-workout" onClick={() => navigate('/fitness')}>Workout</button>
            </motion.div>

            {/* Floating AI button */}
            <AIAvatar />
        </motion.div>
    );
}

// ─── Utility ──────────────────────────────────────────────────────────────────

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
}