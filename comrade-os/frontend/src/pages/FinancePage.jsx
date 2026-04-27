import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { addExpense, setIncome, getUser, resetWeeklyFinance } from '../utils/dataService';
import GlassCard from '../components/UI/GlassCard';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#ff6ec7', '#00f0ff', '#ffe500', '#39ff14', '#b026ff'];
const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Airtime', 'Books', 'Other'];

export default function FinancePage() {
    const { state, dispatch } = useAppContext();
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Food');
    const [income, setIncomeVal] = useState(state.finance?.incomeWeekly || 2000);

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

    // Aggregate expenses by category for pie chart
    const expenseData = (state.finance?.expenses || []).reduce((acc, exp) => {
        const existing = acc.find(e => e.name === exp.category);
        if (existing) existing.value += exp.amount;
        else acc.push({ name: exp.category, value: exp.amount });
        return acc;
    }, []);

    // Build balance history from expenses
    const expenses = state.finance?.expenses || [];
    const balanceHistory = [];
    let runningBalance = state.finance?.incomeWeekly || 2000;
    balanceHistory.push({ label: 'Start', balance: runningBalance });
    expenses.forEach((exp, i) => {
        runningBalance -= exp.amount;
        balanceHistory.push({ label: exp.category, balance: Math.max(0, runningBalance) });
    });

    const totalSpent = expenses.reduce((a, e) => a + e.amount, 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl sm:text-3xl font-bold">
                    <span className="bg-gradient-to-r from-neon-green to-neon-cyan bg-clip-text text-transparent">
                        💰 Financial Command
                    </span>
                </h2>
                <button onClick={handleReset} className="btn-secondary text-xs">
                    🔄 Reset Week
                </button>
            </div>

            {/* Balance overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <GlassCard glow>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Current Balance</p>
                    <p className="text-3xl font-bold neon-text-green">KES {(state.finance?.balance || 0).toLocaleString()}</p>
                </GlassCard>
                <GlassCard>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total Spent</p>
                    <p className="text-3xl font-bold text-neon-pink">KES {totalSpent.toLocaleString()}</p>
                </GlassCard>
                <GlassCard>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Weekly Income</p>
                    <p className="text-3xl font-bold text-neon-yellow">KES {(state.finance?.incomeWeekly || 0).toLocaleString()}</p>
                </GlassCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Add expense */}
                <GlassCard>
                    <h3 className="text-lg font-semibold mb-4">Log Expense</h3>
                    <div className="space-y-3">
                        <select
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                            className="input-field w-full"
                        >
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                placeholder="Amount (KES)"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAddExpense()}
                                className="input-field flex-1"
                                min="0"
                            />
                            <button onClick={handleAddExpense} className="btn-primary">
                                Log
                            </button>
                        </div>
                    </div>

                    {/* Set income */}
                    <div className="mt-4 pt-4 border-t border-white/5">
                        <p className="text-sm text-gray-400 mb-2">Weekly Income (KES)</p>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                value={income}
                                onChange={e => setIncomeVal(Number(e.target.value))}
                                className="input-field flex-1"
                                min="0"
                            />
                            <button onClick={handleSetIncome} className="btn-secondary">
                                Set
                            </button>
                        </div>
                    </div>
                </GlassCard>

                {/* Spending pie chart */}
                <GlassCard>
                    <h3 className="text-lg font-semibold mb-4">Spending Breakdown</h3>
                    {expenseData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={expenseData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    innerRadius={40}
                                    label={({ name, value }) => `${name}: ${value}`}
                                    labelLine={false}
                                >
                                    {expenseData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: '#1a1a3e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                                    formatter={(value) => [`KES ${value}`, 'Amount']}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[220px] text-gray-500">
                            <p>No expenses logged yet. Start tracking!</p>
                        </div>
                    )}
                </GlassCard>
            </div>

            {/* Balance trajectory */}
            {balanceHistory.length > 1 && (
                <GlassCard>
                    <h3 className="text-lg font-semibold mb-4">Balance Trajectory</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={balanceHistory}>
                            <XAxis dataKey="label" stroke="#666" fontSize={11} />
                            <YAxis stroke="#666" fontSize={11} />
                            <Tooltip
                                contentStyle={{ background: '#1a1a3e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                                formatter={(value) => [`KES ${value}`, 'Balance']}
                            />
                            <Line
                                type="monotone"
                                dataKey="balance"
                                stroke="#00f0ff"
                                strokeWidth={2}
                                dot={{ r: 4, fill: '#00f0ff' }}
                                activeDot={{ r: 6, fill: '#00f0ff', stroke: '#fff', strokeWidth: 2 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </GlassCard>
            )}

            {/* Recent expenses */}
            {expenses.length > 0 && (
                <GlassCard>
                    <h3 className="text-lg font-semibold mb-4">Recent Expenses</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {[...expenses].reverse().map((exp, idx) => (
                            <div key={exp.id || idx} className="flex items-center justify-between bg-white/3 rounded-lg px-4 py-2.5">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm">
                                        {exp.category === 'Food' ? '🍛' : exp.category === 'Transport' ? '🚌' : exp.category === 'Entertainment' ? '🎮' : exp.category === 'Airtime' ? '📱' : exp.category === 'Books' ? '📖' : '📦'}
                                    </span>
                                    <span className="text-sm">{exp.category}</span>
                                </div>
                                <span className="text-sm font-semibold text-neon-pink">-KES {exp.amount}</span>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            )}
        </div>
    );
}