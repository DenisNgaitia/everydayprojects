import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { setDietMode, getUser } from '../utils/dataService';
import GlassCard from '../components/UI/GlassCard';
import { motion } from 'framer-motion';

const MEAL_ICONS = { breakfast: '☕', lunch: '🍛', dinner: '🍝', snack: '🍌' };

export default function DietPage() {
    const { state, dispatch } = useAppContext();
    const [mode, setMode] = useState(state.diet?.budgetMode || 'normal');

    const toggleMode = () => {
        const newMode = mode === 'normal' ? 'survival' : 'normal';
        const updated = setDietMode(newMode);
        dispatch({ type: 'UPDATE_DIET', payload: updated });
        dispatch({ type: 'UPDATE_USER', payload: getUser() });
        setMode(newMode);
    };

    const meals = state.diet?.meals || [];
    const totalCost = meals.reduce((a, m) => a + m.cost, 0);
    const totalCals = meals.reduce((a, m) => a + m.calories, 0);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold">
                <span className="bg-gradient-to-r from-neon-orange to-neon-yellow bg-clip-text text-transparent">
                    🍽️ Diet Planner
                </span>
            </h2>

            <GlassCard>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h3 className="text-lg font-semibold">Your Meal Plan</h3>
                        <p className="text-xs text-gray-500 mt-1">
                            Daily: KES {totalCost} • {totalCals} kcal
                        </p>
                    </div>
                    <button
                        onClick={toggleMode}
                        className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                            mode === 'survival'
                                ? 'bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25'
                                : 'bg-green-500/15 border border-green-500/30 text-green-400 hover:bg-green-500/25'
                        }`}
                    >
                        {mode === 'survival' ? '🔥 Survival Mode' : '🥗 Normal Mode'}
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {meals.map((meal, idx) => (
                        <motion.div
                            key={meal.id || idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="glass rounded-xl p-4 text-center hover:bg-white/5 transition-colors"
                        >
                            <span className="text-3xl block mb-2">{MEAL_ICONS[meal.type] || '🍽️'}</span>
                            <h4 className="font-semibold text-sm mb-1">{meal.name}</h4>
                            <p className="text-xs text-gray-400">
                                KES {meal.cost} • {meal.calories} kcal
                            </p>
                            <span className="inline-block mt-2 text-[10px] uppercase tracking-wider text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                                {meal.type}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </GlassCard>

            {mode === 'survival' && (
                <GlassCard>
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">💡</span>
                        <div>
                            <h4 className="font-semibold text-neon-yellow mb-1">Survival Tips</h4>
                            <ul className="text-sm text-gray-400 space-y-1">
                                <li>• Cook in bulk — githeri and ugali last multiple meals</li>
                                <li>• Buy at kibanda, not restaurants</li>
                                <li>• Drink water before meals to feel fuller</li>
                                <li>• Split meals with roommates to save</li>
                            </ul>
                        </div>
                    </div>
                </GlassCard>
            )}
        </div>
    );
}