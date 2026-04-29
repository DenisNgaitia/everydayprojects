import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { updateSchedule, getUser } from '../utils/dataService';
import FloatingPanel from '../components/UI/FloatingPanel';
import ProgressBar from '../components/UI/ProgressBar';
import { motion } from 'framer-motion';

export default function SchedulePage() {
    const { state, dispatch } = useAppContext();
    const [sleep, setSleep] = useState(state.schedule?.sleepHours || 7);
    const [study, setStudy] = useState(state.schedule?.studyHours || 4);
    const [free, setFree] = useState(state.schedule?.freeTimeHours || 5);

    const handleUpdate = () => {
        const updated = updateSchedule(sleep, study, free);
        dispatch({ type: 'UPDATE_SCHEDULE', payload: updated });
        dispatch({ type: 'UPDATE_USER', payload: getUser() });
    };

    const total = sleep + study + free;
    const remaining = 24 - total;
    const optimal = state.schedule?.optimalSchedule || [];

    return (
        <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FloatingPanel>
                    <h3 className="text-lg font-semibold mb-6">Daily Distribution</h3>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm text-[var(--text-secondary)]">Sleep</label>
                                <span className="text-sm font-bold text-[var(--text-primary)]">{sleep}h</span>
                            </div>
                            <input type="range" min="3" max="12" value={sleep} onChange={e => setSleep(Number(e.target.value))} />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm text-[var(--text-secondary)]">Study</label>
                                <span className="text-sm font-bold text-[var(--text-primary)]">{study}h</span>
                            </div>
                            <input type="range" min="0" max="14" value={study} onChange={e => setStudy(Number(e.target.value))} />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm text-[var(--text-secondary)]">Free Time</label>
                                <span className="text-sm font-bold text-[var(--text-primary)]">{free}h</span>
                            </div>
                            <input type="range" min="0" max="10" value={free} onChange={e => setFree(Number(e.target.value))} />
                        </div>

                        <div className="space-y-2">
                            <ProgressBar value={total} max={24} label="Total allocated" color={total > 24 ? 'pink' : total > 20 ? 'yellow' : 'green'} />
                            {remaining > 0 && (
                                <p className="text-xs text-[var(--text-secondary)]">{remaining}h available for classes, meals, and commute</p>
                            )}
                        </div>

                        {total > 24 && (
                            <div className="bg-red-500/10 rounded-xl p-3">
                                <p className="text-[#ef4444] text-sm font-semibold">Overbooked! You've allocated {total}h — adjust your hours.</p>
                            </div>
                        )}

                        <button onClick={handleUpdate} className="btn-primary w-full">
                            Save Schedule
                        </button>
                    </div>
                </FloatingPanel>

                <FloatingPanel>
                    <h3 className="text-lg font-semibold mb-4">Optimal Schedule</h3>
                    <div className="space-y-1">
                        {optimal.map((item, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-4 py-2.5 px-3 rounded-lg hover:bg-[var(--panel)] transition-colors"
                            >
                                <span className="text-xs font-mono text-[var(--text-primary)] min-w-[50px]">{item.time}</span>
                                <span className="text-sm text-[var(--text-secondary)]">{item.activity}</span>
                            </div>
                        ))}
                        {optimal.length === 0 && (
                            <p className="[var(--text-secondary)] text-sm">Save your schedule to see the optimal plan.</p>
                        )}
                    </div>
                </FloatingPanel>
            </div>
        </motion.div>
    );
}