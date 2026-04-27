import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { updateFitness, getUser } from '../utils/dataService';
import GlassCard from '../components/UI/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';

export default function FitnessPage() {
    const { state, dispatch } = useAppContext();
    const [sleepQ, setSleepQ] = useState(state.fitness?.lastSleepQuality || 7);
    const [energy, setEnergy] = useState(state.fitness?.energyLevel || 7);
    const [minutes, setMinutes] = useState(state.fitness?.availableMinutes || 45);

    const handleUpdate = () => {
        const updated = updateFitness(sleepQ, energy, minutes);
        dispatch({ type: 'UPDATE_FITNESS', payload: updated });
        dispatch({ type: 'UPDATE_USER', payload: getUser() });
    };

    const workout = state.fitness?.suggestedWorkout;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold">
                <span className="bg-gradient-to-r from-neon-green to-neon-yellow bg-clip-text text-transparent">
                    💪 Fitness System
                </span>
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard>
                    <h3 className="text-lg font-semibold mb-6">Daily Readiness</h3>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm text-gray-400">Sleep Quality (1-10)</label>
                                <span className="text-sm font-bold text-neon-green">{sleepQ}</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={sleepQ}
                                onChange={e => setSleepQ(Number(e.target.value))}
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm text-gray-400">Energy Level (1-10)</label>
                                <span className="text-sm font-bold text-neon-green">{energy}</span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={energy}
                                onChange={e => setEnergy(Number(e.target.value))}
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm text-gray-400">Available Time (min)</label>
                            </div>
                            <input
                                type="number"
                                value={minutes}
                                onChange={e => setMinutes(Number(e.target.value))}
                                className="input-field w-full"
                                min="5"
                                max="120"
                                step="5"
                            />
                        </div>

                        <button onClick={handleUpdate} className="btn-primary w-full">
                            Generate Workout
                        </button>
                    </div>
                </GlassCard>

                <AnimatePresence mode="wait">
                    {workout ? (
                        <motion.div
                            key={`${workout.type}-${workout.duration}`}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                        >
                            <GlassCard glow className="h-full flex flex-col items-center justify-center text-center p-8">
                                <span className="text-6xl mb-4">
                                    {workout.type.toLowerCase().includes('yoga') || workout.type.toLowerCase().includes('stretch') ? '🧘‍♂️' :
                                     workout.type.toLowerCase().includes('hiit') ? '🏃‍♂️' : '🏋️'}
                                </span>
                                <h3 className="text-sm text-gray-400 uppercase tracking-wider font-semibold mb-2">
                                    Suggested Routine
                                </h3>
                                <p className="text-2xl sm:text-3xl font-bold text-neon-yellow mb-4">
                                    {workout.type}
                                </p>
                                <div className="flex items-center justify-center gap-4 text-sm">
                                    <span className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                                        ⏱️ {workout.duration} min
                                    </span>
                                    <span className={`px-3 py-1.5 rounded-lg border font-semibold ${
                                        workout.intensity === 'high' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                        workout.intensity === 'moderate' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                                        'bg-green-500/10 border-green-500/20 text-green-400'
                                    }`}>
                                        ⚡ {workout.intensity} intensity
                                    </span>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ) : (
                        <GlassCard className="h-full flex items-center justify-center text-center text-gray-500 p-8">
                            <div>
                                <span className="text-4xl block mb-4 opacity-50">⚖️</span>
                                <p>Update your readiness scores to get a personalized workout recommendation.</p>
                            </div>
                        </GlassCard>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}