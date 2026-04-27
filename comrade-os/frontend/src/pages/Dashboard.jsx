import { useAppContext } from '../context/AppContext';
import GlassCard from '../components/UI/GlassCard';
import RiskMeter from '../components/UI/RiskMeter';
import ProgressBar from '../components/UI/ProgressBar';
import AIAvatar from '../components/UI/Avatars';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const statCards = [
    { key: 'finance', path: '/finance', icon: '💰', label: 'Financial Health', color: 'from-emerald-500/10 to-emerald-500/5' },
    { key: 'schedule', path: '/schedule', icon: '⏳', label: 'Time Balance', color: 'from-cyan-500/10 to-cyan-500/5' },
    { key: 'diet', path: '/diet', icon: '🍽️', label: 'Diet Mode', color: 'from-orange-500/10 to-orange-500/5' },
    { key: 'study', path: '/study', icon: '📚', label: 'Study Hub', color: 'from-purple-500/10 to-purple-500/5' },
];

export default function Dashboard() {
    const { state } = useAppContext();
    const navigate = useNavigate();

    if (state.loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="text-center space-y-4">
                    <div className="text-5xl animate-float">🎓</div>
                    <p className="text-gray-400 text-lg">Loading your command center...</p>
                </div>
            </div>
        );
    }

    const expenses = state.finance?.expenses || [];
    const totalExpenses = expenses.reduce((a, e) => a + e.amount, 0);
    const weeklyIncome = state.finance?.incomeWeekly || 2000;
    const survivalProb = Math.max(0, Math.min(100, 100 - (totalExpenses / weeklyIncome) * 100));
    const riskScore = 100 - survivalProb;
    const timeBalance = state.schedule ? (state.schedule.sleepHours + state.schedule.studyHours + state.schedule.freeTimeHours) : 16;
    const balanceOk = timeBalance <= 24;

    return (
        <div className="space-y-6">
            <AIAvatar />

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <GlassCard glow className="cursor-pointer" onClick={() => navigate('/finance')}>
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">💰</span>
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Balance</h3>
                    </div>
                    <div className="text-3xl font-bold neon-text-green mb-3">
                        KES {(state.finance?.balance || 0).toLocaleString()}
                    </div>
                    <RiskMeter score={riskScore} />
                </GlassCard>

                <GlassCard className="cursor-pointer" onClick={() => navigate('/schedule')}>
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">⏳</span>
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Time</h3>
                    </div>
                    <ProgressBar value={timeBalance} max={24} label="Hours allocated" color={balanceOk ? 'green' : 'pink'} />
                    {!balanceOk && <p className="text-xs text-neon-pink mt-2">⚠️ Overbooked!</p>}
                </GlassCard>

                <GlassCard className="cursor-pointer" onClick={() => navigate('/diet')}>
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">🍽️</span>
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Diet</h3>
                    </div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        state.diet?.budgetMode === 'survival'
                            ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                            : 'bg-green-500/15 text-green-400 border border-green-500/30'
                    }`}>
                        {state.diet?.budgetMode === 'survival' ? '🔥 SURVIVAL MODE' : '🥗 Normal Mode'}
                    </span>
                    <p className="text-xs text-gray-500 mt-2">{state.diet?.meals?.length || 0} meals planned</p>
                </GlassCard>

                <GlassCard className="cursor-pointer" onClick={() => navigate('/study')}>
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">📚</span>
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Study</h3>
                    </div>
                    <div className="text-2xl font-bold text-neon-purple">{state.study?.notes?.length || 0}</div>
                    <p className="text-xs text-gray-500">Note sets uploaded</p>
                </GlassCard>
            </div>

            {/* Bottom row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <GlassCard>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <span>🎯</span> Weekly Survival Probability
                    </h3>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-neon-cyan bg-neon-cyan/10 px-2 py-0.5 rounded-full">Survival</span>
                            <span className="text-sm font-bold text-neon-cyan">{survivalProb.toFixed(1)}%</span>
                        </div>
                        <div className="overflow-hidden h-4 rounded-full bg-surface-800">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${survivalProb}%` }}
                                transition={{ duration: 1.2, ease: 'easeOut' }}
                                className="h-full rounded-full bg-gradient-to-r from-neon-cyan to-neon-green"
                                style={{ boxShadow: '0 0 12px rgba(0,240,255,0.3)' }}
                            />
                        </div>
                    </div>

                    {/* Fitness preview */}
                    <div className="mt-4 pt-4 border-t border-white/5">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">💪 Today's Workout</span>
                            <span className="text-neon-yellow font-semibold">{state.fitness?.suggestedWorkout?.type || 'Not set'}</span>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <span>⚡</span> Quick Actions
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => navigate('/ai')} className="btn-primary text-sm py-3">
                            🤖 Ask AI
                        </button>
                        <button onClick={() => navigate('/finance')} className="btn-secondary text-sm py-3">
                            💰 Log Expense
                        </button>
                        <button onClick={() => navigate('/study')} className="btn-secondary text-sm py-3">
                            📚 Upload Notes
                        </button>
                        <button onClick={() => navigate('/fitness')} className="btn-secondary text-sm py-3">
                            💪 Get Workout
                        </button>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}