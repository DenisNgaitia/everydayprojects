import { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import {
    addExpense,
    setIncome,
    getUser,
    resetWeeklyFinance,
    calculateSurvivalDays,
} from '../utils/dataService';
import FloatingPanel from '../components/UI/FloatingPanel';
import BalanceChart from '../components/Finance/BalanceChart';
import ExpenseCategories from '../components/Finance/ExpenseCategories';
import BudgetSuggestions from '../components/Finance/BudgetSuggestions';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Airtime', 'Books', 'Other'];

const CATEGORY_ICONS = {
    Food: '🍛',
    Transport: '🚌',
    Entertainment: '🎮',
    Airtime: '📱',
    Books: '📚',
    Other: '🧾',
};

// ─── Animation Variants ───────────────────────────────────────────────────────

const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionLabel({ children }) {
    return (
        <p
            className="text-[11px] uppercase tracking-widest mb-3"
            style={{ color: 'var(--text-secondary)' }}
        >
            {children}
        </p>
    );
}

// ─── Balance Hero ─────────────────────────────────────────────────────────────

function BalanceHero({ balance, incomeWeekly, totalSpent }) {
    const pctUsed = incomeWeekly > 0 ? Math.min((totalSpent / incomeWeekly) * 100, 100) : 0;
    const pctLeft = 100 - pctUsed;

    const barColor = pctLeft > 50 ? 'var(--accent-cyan)'
        : pctLeft > 25 ? 'var(--accent-purple)'
        : 'var(--accent-pink)';

    return (
        <div
            className="rounded-2xl px-6 py-5"
            style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
        >
            <div className="flex items-start justify-between gap-4 mb-5">
                {/* Balance */}
                <div>
                    <p className="label">Current Balance</p>
                    <motion.h2
                        className="text-[36px] font-black leading-none"
                        style={{ color: barColor }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6 }}
                    >
                        KES {balance.toLocaleString()}
                    </motion.h2>
                </div>
                {/* Income */}
                <div className="text-right">
                    <p className="label">Weekly Income</p>
                    <p className="text-[22px] font-bold" style={{ color: 'var(--text-primary)' }}>
                        KES {incomeWeekly.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Spend progress bar */}
            <div>
                <div className="flex justify-between mb-1.5">
                    <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                        KES {totalSpent.toLocaleString()} spent
                    </span>
                    <span className="text-[11px] font-semibold" style={{ color: barColor }}>
                        {pctLeft.toFixed(0)}% remaining
                    </span>
                </div>
                <div
                    className="relative rounded-full overflow-hidden"
                    style={{ height: '6px', background: 'var(--border)' }}
                >
                    <motion.div
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{
                            background: barColor,
                            boxShadow: `0 0 10px ${barColor}88`,
                        }}
                        initial={{ width: '0%' }}
                        animate={{ width: `${pctUsed}%` }}
                        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    />
                </div>
            </div>
        </div>
    );
}

// ─── Expense List Item ────────────────────────────────────────────────────────

function ExpenseRow({ exp, onDelete }) {
    const icon = CATEGORY_ICONS[exp.category] || '💰';
    const date = exp.date ? new Date(exp.date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' }) : '—';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3 rounded-xl px-4 py-3 group"
            style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
        >
            <span className="text-xl shrink-0">{icon}</span>
            <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {exp.category}
                </p>
                <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{date}</p>
            </div>
            <span className="text-[15px] font-bold tabular-nums" style={{ color: '#ef4444' }}>
                −KES {exp.amount.toLocaleString()}
            </span>
            {onDelete && (
                <button
                    onClick={() => onDelete(exp.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] ml-1 rounded-full w-6 h-6 flex items-center justify-center"
                    style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                    aria-label={`Delete ${exp.category} expense`}
                >
                    ×
                </button>
            )}
        </motion.div>
    );
}

// ─── FinancePage ──────────────────────────────────────────────────────────────

export default function FinancePage() {
    const { state, dispatch } = useAppContext();
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Food');
    const [income, setIncomeVal] = useState(state.finance?.incomeWeekly || 2000);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'breakdown' | 'survival'

    const expenses = state.finance?.expenses || [];
    const balance = state.finance?.balance || 0;
    const incomeWeekly = state.finance?.incomeWeekly || 2000;

    // ── calculateSurvivalDays integration ───────────────────────────────
    const survivalData = useMemo(
        () => calculateSurvivalDays(balance, expenses),
        [balance, expenses]
    );

    // Build balance history for chart
    const balanceHistory = useMemo(() => {
        const history = [{ label: 'Start', balance: incomeWeekly }];
        let running = incomeWeekly;
        expenses.forEach(exp => {
            running = Math.max(0, running - exp.amount);
            history.push({ label: exp.category, balance: running });
        });
        return history;
    }, [expenses, incomeWeekly]);

    const totalSpent = survivalData.weeklyBurnRate;

    // ── Handlers ─────────────────────────────────────────────────────────
    const handleAddExpense = () => {
        if (!amount || Number(amount) <= 0) return;
        const updated = addExpense(category, amount);
        dispatch({ type: 'UPDATE_FINANCE', payload: updated });
        dispatch({ type: 'UPDATE_USER', payload: getUser() });
        setAmount('');
    };

    const handleSetIncome = () => {
        const updated = setIncome(income);
        dispatch({ type: 'UPDATE_FINANCE', payload: updated });
    };

    const handleReset = () => {
        if (confirm('Reset weekly finances? This will clear all expenses and restore your balance.')) {
            const updated = resetWeeklyFinance();
            dispatch({ type: 'UPDATE_FINANCE', payload: updated });
        }
    };

    // ── Tabs ──────────────────────────────────────────────────────────────
    const TABS = [
        { id: 'overview', label: 'Overview' },
        { id: 'breakdown', label: 'Categories' },
        { id: 'survival', label: 'Survival' },
    ];

    return (
        <motion.div
            className="flex flex-col gap-6"
            style={{ maxWidth: '720px', margin: 'auto' }}
            variants={stagger}
            initial="hidden"
            animate="show"
        >
            {/* ── Page Header ──────────────────────────────────────────── */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
                <div>
                    <h1 className="text-[26px] font-bold" style={{ color: 'var(--text-primary)' }}>
                        Financial Command
                    </h1>
                    <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                        {expenses.length} expense{expenses.length !== 1 ? 's' : ''} logged this week
                    </p>
                </div>
                <button id="finance-reset-btn" onClick={handleReset} className="btn-secondary text-xs">
                    Reset Week
                </button>
            </motion.div>

            {/* ── Balance Hero ─────────────────────────────────────────── */}
            <motion.div variants={fadeUp}>
                <BalanceHero
                    balance={balance}
                    incomeWeekly={incomeWeekly}
                    totalSpent={totalSpent}
                />
            </motion.div>

            {/* ── Log Expense Form ─────────────────────────────────────── */}
            <motion.div variants={fadeUp}>
                <FloatingPanel>
                    <SectionLabel>Log Expense</SectionLabel>
                    <div className="flex flex-col gap-3">
                        <div className="flex gap-2">
                            <select
                                id="expense-category"
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                className="input-field"
                                style={{ flex: '0 0 auto', minWidth: '130px' }}
                            >
                                {CATEGORIES.map(c => (
                                    <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
                                ))}
                            </select>
                            <input
                                id="expense-amount"
                                type="number"
                                placeholder="Amount (KES)"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAddExpense()}
                                className="input-field flex-1"
                                min="0"
                            />
                            <button
                                id="expense-log-btn"
                                onClick={handleAddExpense}
                                className="btn-primary shrink-0"
                            >
                                Log
                            </button>
                        </div>

                        {/* Set income */}
                        <div
                            className="flex gap-2 items-center pt-3 mt-1"
                            style={{ borderTop: '1px solid var(--border)' }}
                        >
                            <p className="text-[12px] shrink-0" style={{ color: 'var(--text-secondary)' }}>
                                Weekly income
                            </p>
                            <input
                                id="income-input"
                                type="number"
                                value={income}
                                onChange={e => setIncomeVal(Number(e.target.value))}
                                className="input-field flex-1"
                                min="0"
                            />
                            <button
                                id="income-set-btn"
                                onClick={handleSetIncome}
                                className="btn-secondary shrink-0"
                            >
                                Set
                            </button>
                        </div>
                    </div>
                </FloatingPanel>
            </motion.div>

            {/* ── Tab Switcher ─────────────────────────────────────────── */}
            <motion.div variants={fadeUp}>
                <div className="flex gap-2" role="tablist" aria-label="Finance views">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            id={`finance-tab-${tab.id}`}
                            role="tab"
                            aria-selected={activeTab === tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className="text-[13px] font-medium px-4 py-2 rounded-full transition-all duration-200"
                            style={{
                                background: activeTab === tab.id
                                    ? 'linear-gradient(135deg, var(--accent-pink), var(--accent-purple))'
                                    : 'var(--panel)',
                                border: activeTab === tab.id
                                    ? 'none'
                                    : '1px solid var(--border)',
                                color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
                                boxShadow: activeTab === tab.id ? '0 0 16px var(--glow-pink)' : 'none',
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* ── Tab Panels ───────────────────────────────────────────── */}
            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col gap-4"
                    >
                        {/* Balance trajectory chart */}
                        <FloatingPanel>
                            <SectionLabel>Balance Trajectory</SectionLabel>
                            <BalanceChart balanceHistory={balanceHistory} />
                        </FloatingPanel>

                        {/* Recent expenses list */}
                        <FloatingPanel>
                            <SectionLabel>
                                Recent Expenses
                                {expenses.length > 0 && (
                                    <span className="ml-2 normal-case" style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>
                                        ({expenses.length} total)
                                    </span>
                                )}
                            </SectionLabel>
                            {expenses.length === 0 ? (
                                <p className="text-[13px] text-center py-6" style={{ color: 'var(--text-secondary)' }}>
                                    No expenses yet. Log one above.
                                </p>
                            ) : (
                                <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                                    <AnimatePresence initial={false}>
                                        {[...expenses].reverse().map(exp => (
                                            <ExpenseRow key={exp.id} exp={exp} />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </FloatingPanel>
                    </motion.div>
                )}

                {activeTab === 'breakdown' && (
                    <motion.div
                        key="breakdown"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        <FloatingPanel>
                            <SectionLabel>Spending by Category</SectionLabel>
                            <ExpenseCategories
                                categoryTotals={survivalData.categoryTotals}
                                totalSpent={totalSpent}
                            />
                        </FloatingPanel>
                    </motion.div>
                )}

                {activeTab === 'survival' && (
                    <motion.div
                        key="survival"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        <BudgetSuggestions
                            survivalData={survivalData}
                            balance={balance}
                            incomeWeekly={incomeWeekly}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}