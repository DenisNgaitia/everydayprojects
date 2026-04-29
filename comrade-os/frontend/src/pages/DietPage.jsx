import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { setDietMode, getUser } from '../utils/dataService';
import FloatingPanel from '../components/UI/FloatingPanel';
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
        <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >

            <FloatingPanel>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h3 className="text-lg font-semibold">Meal Plan</h3>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">
                            KES {totalCost}/day · {totalCals} kcal
                        </p>
                    </div>
                    <button
                        onClick={toggleMode}
                        className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                            mode === 'survival'
                                ? 'bg-red-500/15 text-[#ef4444] hover:bg-red-500/25'
                                : 'bg-green-500/15 text-green-400 hover:bg-green-500/25'
                        }`}
                    >
                        {mode === 'survival' ? 'Survival Mode' : 'Normal Mode'}
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {meals.map((meal, idx) => (
                        <motion.div
                            key={meal.id || idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="panel text-center hover:bg-[var(--panel)] transition-colors"
                        >
                            <span className="text-3xl block mb-2">{MEAL_ICONS[meal.type] || '🍽️'}</span>
                            <h4 className="font-semibold text-sm mb-1">{meal.name}</h4>
                            <p className="text-xs text-[var(--text-secondary)]">
                                KES {meal.cost} · {meal.calories} kcal
                            </p>
                        </motion.div>
                    ))}
                </div>
            </FloatingPanel>

            {mode === 'survival' && (
                <FloatingPanel>
                    <h4 className="font-semibold text-[var(--text-primary)] mb-2">Survival Tips</h4>
                    <ul className="text-sm text-[var(--text-secondary)] space-y-1">
                        <li>Cook in bulk — githeri and ugali last multiple meals</li>
                        <li>Buy at kibanda, not restaurants</li>
                        <li>Drink water before meals to feel fuller</li>
                        <li>Split meals with roommates to save</li>
                    </ul>
                </FloatingPanel>
            )}
        </motion.div>
    );
}