import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { updateFitness, getUser } from '../utils/dataService';
import FloatingPanel from '../components/UI/FloatingPanel';
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
        <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FloatingPanel>
                    <h3 className="text-lg font-semibold mb-6">Daily Readiness</h3>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm text-[var(--text-secondary)]">Sleep Quality</label>
                                <span className="text-sm font-bold text-[var(--text-primary)]">{sleepQ}/10</span>
                            </div>
                            <input type="range" min="1" max="10" value={sleepQ} onChange={e => setSleepQ(Number(e.target.value))} />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm text-[var(--text-secondary)]">Energy Level</label>
                                <span className="text-sm font-bold text-[var(--text-primary)]">{energy}/10</span>
                            </div>
                            <input type="range" min="1" max="10" value={energy} onChange={e => setEnergy(Number(e.target.value))} />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm text-[var(--text-secondary)]">Available Time (min)</label>
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
                </FloatingPanel>

                <AnimatePresence mode="wait">
                    {workout ? (
                        <motion.div
                            key={`${workout.type}-${workout.duration}`}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                        >
                            <FloatingPanel className="h-full flex flex-col items-center justify-center text-center p-8">
                                <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider font-semibold mb-2">
                                    Suggested Routine
                                </p>
                                <p className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-4">
                                    {workout.type}
                                </p>
                                <div className="flex items-center justify-center gap-4 text-sm">
                                    <span className="bg-[var(--panel)] px-3 py-1.5 rounded-lg">
                                        {workout.duration} min
                                    </span>
                                    <span className={`px-3 py-1.5 rounded-lg font-semibold ${
                                        workout.intensity === 'high' ? 'bg-red-500/10 text-[#ef4444]' :
                                        workout.intensity === 'moderate' ? 'bg-yellow-500/10 text-yellow-400' :
                                        'bg-green-500/10 text-green-400'
                                    }`}>
                                        {workout.intensity}
                                    </span>
                                </div>
                            </FloatingPanel>
                        </motion.div>
                    ) : (
                        <FloatingPanel className="h-full flex items-center justify-center text-center text-[var(--text-secondary)] p-8">
                            <p>Update your readiness scores to get a personalized workout.</p>
                        </FloatingPanel>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}