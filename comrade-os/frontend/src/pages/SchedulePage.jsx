import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { updateSchedule, getUser } from '../utils/dataService';
import GlassCard from '../components/UI/GlassCard';
import ProgressBar from '../components/UI/ProgressBar';

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
        <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold">
                <span className="bg-gradient-to-r from-neon-cyan to-neon-yellow bg-clip-text text-transparent">
                    ⏳ Time Management
                </span>
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard>
                    <h3 className="text-lg font-semibold mb-6">Daily Distribution</h3>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm text-gray-400">😴 Sleep</label>
                                <span className="text-sm font-bold text-neon-cyan">{sleep}h</span>
                            </div>
                            <input type="range" min="3" max="12" value={sleep} onChange={e => setSleep(Number(e.target.value))} />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm text-gray-400">📚 Study</label>
                                <span className="text-sm font-bold text-neon-cyan">{study}h</span>
                            </div>
                            <input type="range" min="0" max="14" value={study} onChange={e => setStudy(Number(e.target.value))} />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm text-gray-400">🎮 Free Time</label>
                                <span className="text-sm font-bold text-neon-cyan">{free}h</span>
                            </div>
                            <input type="range" min="0" max="10" value={free} onChange={e => setFree(Number(e.target.value))} />
                        </div>

                        <div className="space-y-2">
                            <ProgressBar value={total} max={24} label="Total allocated" color={total > 24 ? 'pink' : total > 20 ? 'yellow' : 'green'} />
                            {remaining > 0 && (
                                <p className="text-xs text-gray-500">{remaining}h available for classes, meals, and commute</p>
                            )}
                        </div>

                        {total > 24 && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                                <p className="text-red-400 text-sm font-semibold">⚠️ Overbooked! You've allocated {total}h — that's more than 24h. Adjust your hours.</p>
                            </div>
                        )}

                        <button onClick={handleUpdate} className="btn-primary w-full">
                            Save Schedule
                        </button>
                    </div>
                </GlassCard>

                <GlassCard>
                    <h3 className="text-lg font-semibold mb-4">📅 Optimal Daily Schedule</h3>
                    <div className="space-y-1">
                        {optimal.map((item, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-4 py-2.5 px-3 rounded-lg hover:bg-white/3 transition-colors group"
                            >
                                <span className="text-xs font-mono text-neon-yellow min-w-[50px]">{item.time}</span>
                                <div className="w-px h-6 bg-white/10 group-hover:bg-neon-cyan/30 transition-colors" />
                                <span className="text-sm text-gray-300">{item.activity}</span>
                            </div>
                        ))}
                        {optimal.length === 0 && (
                            <p className="text-gray-500 text-sm">Save your schedule to see the optimal plan.</p>
                        )}
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}