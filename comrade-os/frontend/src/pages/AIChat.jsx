import { useState, useRef, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { updateFromModules } from '../core/ComradeEngine';
import { generateDailySummary, answerQuestion, generateInsights } from '../utils/comradeAdvisor';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Animation Presets ────────────────────────────────────────────────────────

const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const fadeUp = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

// ─── Score Ring (compact) ─────────────────────────────────────────────────────

function MiniRing({ score, label, color }) {
    const r = 18;
    const circ = 2 * Math.PI * r;
    const offset = circ - (score / 100) * circ;

    return (
        <div className="flex flex-col items-center gap-1">
            <svg width="44" height="44" className="-rotate-90">
                <circle cx="22" cy="22" r={r} fill="none" stroke="var(--border)" strokeWidth="3" />
                <circle
                    cx="22" cy="22" r={r}
                    fill="none" stroke={color}
                    strokeWidth="3"
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.8s ease', filter: `drop-shadow(0 0 4px ${color})` }}
                />
            </svg>
            <span className="text-[12px] font-bold" style={{ color }}>{score}</span>
            <span className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>{label}</span>
        </div>
    );
}

// ─── Pillar colour helper ─────────────────────────────────────────────────────

function pillarColor(tier) {
    return tier === 'strong' ? 'var(--accent-cyan)'
         : tier === 'moderate' ? 'var(--accent-purple)'
         : 'var(--accent-pink)';
}

// ─── Insight Card ─────────────────────────────────────────────────────────────

function InsightCard({ insight, navigate }) {
    const borderColor = insight.priority <= 1
        ? 'var(--accent-pink)'
        : insight.priority <= 2
        ? 'var(--accent-purple)'
        : 'var(--border)';

    const glowColor = insight.priority <= 1
        ? 'var(--glow-pink)'
        : insight.priority <= 2
        ? 'rgba(139,92,246,0.15)'
        : 'transparent';

    return (
        <motion.div
            variants={fadeUp}
            className="flex items-start gap-3 rounded-2xl px-4 py-3 group"
            style={{
                background: 'var(--panel)',
                border: `1px solid ${borderColor}`,
                boxShadow: `0 0 14px ${glowColor}`,
                cursor: insight.route ? 'pointer' : 'default',
            }}
            whileHover={insight.route ? { x: 3, borderColor: 'var(--accent-cyan)' } : {}}
            onClick={() => insight.route && navigate(insight.route)}
        >
            <span className="text-lg shrink-0 mt-0.5">{insight.icon}</span>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                        style={{ color: borderColor, border: `1px solid ${borderColor}` }}>
                        {insight.category}
                    </span>
                    {insight.priority <= 1 && (
                        <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--accent-pink)' }}>
                            CRITICAL
                        </span>
                    )}
                </div>
                <p className="text-[14px] font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>{insight.title}</p>
                <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{insight.body}</p>
                {insight.action && (
                    <span className="inline-block mt-2 text-[11px] font-semibold px-3 py-1 rounded-full"
                        style={{ color: 'var(--accent-cyan)', border: '1px solid var(--accent-cyan)' }}>
                        {insight.action} →
                    </span>
                )}
            </div>
        </motion.div>
    );
}

// ─── Module Summary Row ───────────────────────────────────────────────────────

function ModuleRow({ icon, label, text }) {
    return (
        <div
            className="flex items-start gap-3 rounded-xl px-4 py-3"
            style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
        >
            <span className="text-lg shrink-0 mt-0.5">{icon}</span>
            <div className="flex-1 min-w-0">
                <p className="text-[11px] uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-secondary)' }}>{label}</p>
                <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-primary)' }}>{text}</p>
            </div>
        </div>
    );
}

// ─── Chat Message ─────────────────────────────────────────────────────────────

function ChatMessage({ msg, navigate }) {
    if (msg.type === 'user') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-end"
            >
                <div className="max-w-[80%] rounded-2xl px-5 py-3" style={{ background: 'var(--border)' }}>
                    <p className="text-[14px]" style={{ color: 'var(--text-primary)' }}>{msg.text}</p>
                </div>
            </motion.div>
        );
    }

    // Bot message with structured answer
    const { category, answer, suggestions, relatedInsights } = msg.data;

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
        >
            <div className="max-w-[90%] rounded-2xl px-5 py-4 flex flex-col gap-3" style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
                {/* Category badge */}
                <span className="inline-block self-start text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{ color: 'var(--accent-purple)', border: '1px solid var(--accent-purple)' }}>
                    {category}
                </span>

                {/* Main answer */}
                <p className="text-[14px] leading-relaxed" style={{ color: 'var(--text-primary)' }}>{answer}</p>

                {/* Suggestions */}
                {suggestions?.length > 0 && (
                    <div className="flex flex-col gap-1.5 mt-1">
                        <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>Recommended actions</p>
                        {suggestions.map((s, i) => (
                            <div key={i} className="flex items-start gap-2 text-[13px]" style={{ color: 'var(--accent-cyan)' }}>
                                <span className="shrink-0 mt-0.5">→</span>
                                <span>{s}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Related insights (collapsed) */}
                {relatedInsights?.length > 0 && (
                    <details className="mt-1">
                        <summary className="text-[11px] cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                            {relatedInsights.length} related insight{relatedInsights.length !== 1 ? 's' : ''}
                        </summary>
                        <div className="flex flex-col gap-2 mt-2">
                            {relatedInsights.slice(0, 3).map((ins) => (
                                <div key={ins.id}
                                    className="flex items-start gap-2 rounded-xl px-3 py-2 cursor-pointer"
                                    style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid var(--border)' }}
                                    onClick={() => ins.route && navigate(ins.route)}>
                                    <span className="shrink-0">{ins.icon}</span>
                                    <div>
                                        <p className="text-[12px] font-semibold" style={{ color: 'var(--text-primary)' }}>{ins.title}</p>
                                        <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{ins.body.substring(0, 80)}…</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </details>
                )}
            </div>
        </motion.div>
    );
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="rounded-2xl px-5 py-3 flex gap-1.5" style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
                {[0, 150, 300].map(delay => (
                    <motion.span
                        key={delay}
                        className="w-2 h-2 rounded-full"
                        style={{ background: 'var(--accent-purple)' }}
                        animate={{ y: [-2, 2, -2] }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: delay / 1000 }}
                    />
                ))}
            </div>
        </motion.div>
    );
}

// ─── Quick Ask Chip ───────────────────────────────────────────────────────────

const QUICK_ASKS = [
    { text: 'Can I afford to go out tonight?', icon: '🍻' },
    { text: 'Should I study or rest?', icon: '📖' },
    { text: 'How is my money looking?', icon: '💸' },
    { text: 'What should I eat today?', icon: '🍛' },
    { text: 'How am I doing overall?', icon: '🎯' },
];

// ═══════════════════════════════════════════════════════════════════════════════
//  AIChat Page — Daily Summary + Ask Mode
// ═══════════════════════════════════════════════════════════════════════════════

export default function AIChat() {
    const { state } = useAppContext();
    const navigate = useNavigate();
    const [mode, setMode] = useState('summary'); // 'summary' | 'ask'
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);

    // ── Engine state ─────────────────────────────────────────────────────
    const engineState = useMemo(() => {
        return updateFromModules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.finance, state.schedule, state.diet, state.study, state.fitness]);

    const summary = useMemo(() => generateDailySummary(engineState), [engineState]);

    // Auto-scroll chat
    useEffect(() => {
        if (mode === 'ask') chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, mode]);

    // ── Ask handler ──────────────────────────────────────────────────────
    const handleAsk = async (question) => {
        if (!question?.trim() || loading) return;
        const text = question.trim();
        setMessages(prev => [...prev, { type: 'user', text }]);
        setInput('');
        setLoading(true);

        // Simulate thinking delay (200–600ms)
        await new Promise(r => setTimeout(r, 200 + Math.random() * 400));

        const result = answerQuestion(text, engineState);
        setMessages(prev => [...prev, { type: 'bot', data: result }]);
        setLoading(false);
    };

    // ── Survival colour ──────────────────────────────────────────────────
    const survColor = summary.survivalProbability >= 70 ? 'var(--accent-cyan)'
        : summary.survivalProbability >= 45 ? 'var(--accent-purple)'
        : 'var(--accent-pink)';

    // ══════════════════════════════════════════════════════════════════════
    return (
        <motion.div
            className="flex flex-col"
            style={{ maxWidth: '780px', margin: 'auto', height: 'calc(100vh - 100px)' }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
            {/* ── Header + Mode Toggle ──────────────────────────────────── */}
            <div className="flex items-center justify-between mb-5 shrink-0">
                <div>
                    <h1 className="text-[22px] font-bold" style={{ color: 'var(--text-primary)' }}>
                        AI Command Centre
                    </h1>
                    <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                        {summary.dayOfWeek}, {summary.date}
                    </p>
                </div>
                <div className="flex gap-1 rounded-full p-1" style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
                    {[
                        { id: 'summary', label: '📋 Brief', ariaLabel: 'Daily Summary' },
                        { id: 'ask', label: '💬 Ask', ariaLabel: 'Ask mode' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            id={`ai-mode-${tab.id}`}
                            aria-label={tab.ariaLabel}
                            onClick={() => setMode(tab.id)}
                            className="text-[12px] font-semibold px-4 py-1.5 rounded-full transition-all"
                            style={{
                                background: mode === tab.id
                                    ? 'linear-gradient(135deg, var(--accent-pink), var(--accent-purple))'
                                    : 'transparent',
                                color: mode === tab.id ? '#fff' : 'var(--text-secondary)',
                                boxShadow: mode === tab.id ? '0 0 12px var(--glow-pink)' : 'none',
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Content Area ──────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto pr-1">
                <AnimatePresence mode="wait">
                    {mode === 'summary' ? (
                        <motion.div
                            key="summary"
                            variants={stagger}
                            initial="hidden"
                            animate="show"
                            exit={{ opacity: 0, y: -10 }}
                            className="flex flex-col gap-5 pb-6"
                        >
                            {/* ── Hero Greeting ────────────────────────────── */}
                            <motion.div variants={fadeUp}>
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-[18px] font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                                            {summary.greeting}, <span style={{ color: 'var(--accent-cyan)' }}>{summary.userName}</span>.
                                        </h2>
                                        <p className="text-[14px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                            {summary.headline}
                                        </p>
                                    </div>
                                    {/* Survival badge */}
                                    <div className="flex flex-col items-center rounded-2xl px-4 py-3 shrink-0"
                                        style={{ background: 'var(--panel)', border: `1px solid ${survColor}`, boxShadow: `0 0 18px ${survColor}33` }}>
                                        <span className="text-[9px] uppercase tracking-widest mb-1" style={{ color: 'var(--text-secondary)' }}>Survival</span>
                                        <span className="text-[28px] font-black leading-none" style={{ color: survColor }}>{summary.survivalProbability}</span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* ── Pillar Rings ─────────────────────────────── */}
                            <motion.div variants={fadeUp} className="flex justify-around py-2">
                                {summary.pillars.map(p => (
                                    <MiniRing
                                        key={p.label}
                                        score={p.score}
                                        label={p.label}
                                        color={pillarColor(p.tier)}
                                    />
                                ))}
                            </motion.div>

                            {/* ── Status Overview ──────────────────────────── */}
                            <motion.div variants={fadeUp} className="rounded-2xl px-5 py-4"
                                style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}>
                                <p className="text-[11px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>System Status</p>
                                <p className="text-[14px] leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                                    {summary.overallStatus}
                                </p>
                            </motion.div>

                            {/* ── Priority Insights ────────────────────────── */}
                            {summary.insights.length > 0 && (
                                <motion.div variants={fadeUp}>
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                                            style={{ color: 'var(--accent-cyan)', border: '1px solid var(--accent-cyan)' }}>
                                            Actionable Insights
                                        </span>
                                        <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                                            {summary.insights.length} item{summary.insights.length !== 1 ? 's' : ''}
                                        </span>
                                        <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                                    </div>
                                    <motion.div
                                        className="flex flex-col gap-3"
                                        variants={stagger}
                                        initial="hidden"
                                        animate="show"
                                    >
                                        {summary.insights.map(ins => (
                                            <InsightCard key={ins.id} insight={ins} navigate={navigate} />
                                        ))}
                                    </motion.div>
                                </motion.div>
                            )}

                            {/* ── Module Summaries ─────────────────────────── */}
                            <motion.div variants={fadeUp}>
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                                        style={{ color: 'var(--accent-purple)', border: '1px solid var(--accent-purple)' }}>
                                        Module Report
                                    </span>
                                    <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <ModuleRow icon="💰" label="Finance" text={summary.financeSummary} />
                                    <ModuleRow icon="📚" label="Study" text={summary.studySummary} />
                                    <ModuleRow icon="🍛" label="Diet" text={summary.dietSummary} />
                                    <ModuleRow icon="💪" label="Fitness" text={summary.fitnessSummary} />
                                    <ModuleRow icon="🕐" label="Schedule" text={`${summary.scheduleInfo.sleepHours}h sleep, ${summary.scheduleInfo.studyHours}h study, ${summary.scheduleInfo.freeHours}h free time.`} />
                                </div>
                            </motion.div>

                            {/* ── Quick Ask CTAs ───────────────────────────── */}
                            <motion.div variants={fadeUp}>
                                <p className="text-[11px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-secondary)' }}>
                                    Ask a follow-up
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {QUICK_ASKS.slice(0, 3).map((qa, i) => (
                                        <button
                                            key={i}
                                            id={`quick-ask-${i}`}
                                            onClick={() => { setMode('ask'); setTimeout(() => handleAsk(qa.text), 100); }}
                                            className="flex items-center gap-1.5 text-[12px] font-medium px-3 py-2 rounded-full transition-all"
                                            style={{ background: 'var(--panel)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                                        >
                                            <span>{qa.icon}</span>
                                            <span>{qa.text}</span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="ask"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex flex-col gap-3 pb-3"
                        >
                            {/* Intro message if no messages yet */}
                            {messages.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center text-center py-10 gap-4"
                                >
                                    <div className="text-4xl">🤖</div>
                                    <div>
                                        <p className="text-[15px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                                            Ask anything about your situation
                                        </p>
                                        <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                                            I'll analyse your ComradeEngine state and give you actionable advice.
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap justify-center gap-2 mt-2">
                                        {QUICK_ASKS.map((qa, i) => (
                                            <button
                                                key={i}
                                                id={`ask-chip-${i}`}
                                                onClick={() => handleAsk(qa.text)}
                                                className="flex items-center gap-1.5 text-[12px] font-medium px-3 py-2 rounded-full transition-all"
                                                style={{ background: 'var(--panel)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                                            >
                                                <span>{qa.icon}</span>
                                                <span>{qa.text}</span>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Chat messages */}
                            <AnimatePresence initial={false}>
                                {messages.map((msg, idx) => (
                                    <ChatMessage key={idx} msg={msg} navigate={navigate} />
                                ))}
                            </AnimatePresence>

                            {loading && <TypingIndicator />}
                            <div ref={chatEndRef} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Input Area (visible in Ask mode) ─────────────────────── */}
            {mode === 'ask' && (
                <motion.div
                    className="flex gap-2 pt-3 shrink-0"
                    style={{ borderTop: '1px solid var(--border)' }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <input
                        id="ai-ask-input"
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleAsk(input)}
                        placeholder="e.g., Should I spend KES 500 tonight?"
                        className="flex-1 input-field"
                        disabled={loading}
                    />
                    <button
                        id="ai-ask-send"
                        onClick={() => handleAsk(input)}
                        disabled={loading || !input.trim()}
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Send
                    </button>
                </motion.div>
            )}
        </motion.div>
    );
}