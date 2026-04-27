import { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { analyzeDecision } from '../utils/aiEngine';
import { getFinance, getSchedule, updateBalance, getUser } from '../utils/dataService';
import RiskMeter from '../components/UI/RiskMeter';
import GlassCard from '../components/UI/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIChat() {
    const { state, dispatch } = useAppContext();
    const [messages, setMessages] = useState([
        { type: 'bot', text: 'Sasa Comrade! 🎓 I\'m your AI decision engine. Ask me anything — like "Should I spend KES 500 tonight?" and I\'ll analyze the impact on your finances, time, health, and academics.' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;
        const userMsg = { type: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        // Simulate processing delay for realism
        await new Promise(r => setTimeout(r, 600 + Math.random() * 800));

        const finance = getFinance();
        const schedule = getSchedule();
        const decision = analyzeDecision(input, finance, schedule);

        // Update balance if a spend was detected
        if (decision.spendAmount > 0 && decision.spendAmount <= finance.balance) {
            const updatedFinance = updateBalance(decision.adjustedBalance);
            dispatch({ type: 'UPDATE_FINANCE', payload: updatedFinance });
            dispatch({ type: 'UPDATE_USER', payload: getUser() });
        }

        const botMsg = { type: 'bot', decision };
        setMessages(prev => [...prev, botMsg]);
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 140px)' }}>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                <span className="bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
                    🤖 AI Decision Engine
                </span>
            </h2>

            {/* Chat area */}
            <div className="flex-1 overflow-y-auto glass rounded-2xl p-4 mb-4 space-y-4">
                <AnimatePresence initial={false}>
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl ${
                                msg.type === 'user'
                                    ? 'bg-gradient-to-br from-neon-cyan/15 to-neon-purple/15 border border-neon-cyan/20'
                                    : 'glass border border-white/5'
                            }`}>
                                {msg.text && <p className="text-sm leading-relaxed">{msg.text}</p>}
                                {msg.decision && (
                                    <div className="space-y-3">
                                        <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                                            msg.decision.verdict.includes('Smart') ? 'bg-green-500/15 text-green-400' :
                                            msg.decision.verdict.includes('Risky') ? 'bg-yellow-500/15 text-yellow-400' :
                                            'bg-red-500/15 text-red-400'
                                        }`}>
                                            {msg.decision.verdict}
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            <div className="bg-white/5 rounded-lg p-3">
                                                <span className="text-neon-cyan font-semibold">💰 Financial:</span>
                                                <p className="text-gray-300 mt-1">{msg.decision.financialImpact}</p>
                                            </div>
                                            <div className="bg-white/5 rounded-lg p-3">
                                                <span className="text-neon-yellow font-semibold">⏳ Time:</span>
                                                <p className="text-gray-300 mt-1">{msg.decision.timeImpact}</p>
                                            </div>
                                            <div className="bg-white/5 rounded-lg p-3">
                                                <span className="text-neon-green font-semibold">❤️ Health:</span>
                                                <p className="text-gray-300 mt-1">{msg.decision.healthImpact}</p>
                                            </div>
                                            <div className="bg-white/5 rounded-lg p-3">
                                                <span className="text-neon-purple font-semibold">📚 Academic:</span>
                                                <p className="text-gray-300 mt-1">{msg.decision.academicImpact}</p>
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <span className="text-xs text-gray-400">Risk Score</span>
                                            <RiskMeter score={msg.decision.riskScore} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                    >
                        <div className="glass border border-white/5 px-5 py-3 rounded-2xl">
                            <div className="flex gap-1.5">
                                <span className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </motion.div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input area */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder="e.g., Should I spend KES 500 on a night out?"
                    className="flex-1 input-field"
                    disabled={loading}
                />
                <button
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Send
                </button>
            </div>
        </div>
    );
}