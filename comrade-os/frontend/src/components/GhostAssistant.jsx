import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GhostAssistant() {
    const [isVisible, setIsVisible] = useState(false);
    const [greeting, setGreeting] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Dynamic Time Greeting
        const determineGreeting = () => {
            const hour = new Date().getHours();
            if (hour < 12) setGreeting('Good morning');
            else if (hour < 18) setGreeting('Good afternoon');
            else setGreeting('Good evening');
        };

        determineGreeting();

        // ---------------------------------------------------------
        // LIVE API: DeepSeek Intelligence Integration
        // ---------------------------------------------------------
        const fetchSuggestions = async () => {
            try {
                // Replace with your actual DeepSeek API Key
                const apiKey = 'sk-83c6741d6a074bc3bf47b181e80ee6a2';
                
                const response = await fetch('https://api.deepseek.com/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model: 'deepseek-chat',
                        messages: [{
                            role: 'system',
                            // The context prompt shapes the intelligence. It knows about your dual life (Psychology & Web3/Dev).
                            content: `You are a high-end UI assistant for a 3rd-year university student. They balance studying Psychology with intense self-taught Web3 security, EVM bug bounties, building an app called ZeroTrust Economics, and baking. 
                            Suggest 3 highly contextual, productive, or relaxing activities for 1 hour of free time. 
                            You MUST return ONLY a raw JSON array of objects. No markdown, no conversational text. 
                            Format: [{"id": 1, "text": "Action-oriented sentence max 6 words", "icon": "single emoji"}]`
                        }],
                        temperature: 0.7
                    })
                });

                if (!response.ok) throw new Error('DeepSeek uplink failed');
                
                const data = await response.json();
                
                // DeepSeek might occasionally wrap JSON in markdown blocks, this cleans it up before parsing
                const cleanJsonStr = data.choices[0].message.content.replace(/```json|```/g, '').trim();
                const aiSuggestions = JSON.parse(cleanJsonStr);
                
                setSuggestions(aiSuggestions);
            } catch (error) {
                console.error("Ghost Assistant Error:", error);
                // Tactical Fallback: If offline or API fails, use your default protocols
                setSuggestions([
                    { id: 1, text: "Review EVM exploit architecture", icon: "🛡️" },
                    { id: 2, text: "Draft database schema for aura.study", icon: "🏗️" },
                    { id: 3, text: "Bake a fresh batch of banana bread", icon: "🍌" }
                ]);
            } finally {
                setIsLoading(false);
            }
        };

        // Trigger the animation 3 seconds after load, and immediately start thinking
        const timer = setTimeout(() => {
            setIsVisible(true);
            fetchSuggestions();
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    const dismiss = () => setIsVisible(false);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div 
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 z-50 w-80 sm:w-96"
                >
                    <div className="panel p-6 shadow-2xl relative overflow-hidden group">
                        {/* Ambient Intelligence Glow */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-comrade-gold/20 dark:bg-comrade-neonCyan/20 rounded-full blur-3xl group-hover:bg-comrade-gold/30 dark:group-hover:bg-comrade-neonCyan/30 transition-all duration-700"></div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-serif text-lg font-bold text-comrade-oxford dark:text-white flex items-center gap-2">
                                    <span className="animate-pulse-slow">✨</span> 
                                    {greeting}, Precious.
                                </h4>
                                <button 
                                    onClick={dismiss} 
                                    className="text-comrade-oxford/50 dark:text-gray-400 hover:text-comrade-oxford dark:hover:text-white transition-colors p-1"
                                    aria-label="Dismiss Assistant"
                                >
                                    ✕
                                </button>
                            </div>
                            
                            <p className="font-sans text-sm text-comrade-oxford/70 dark:text-gray-300 mb-5 leading-relaxed">
                                You have an unallocated time block. What is the protocol for the next hour?
                            </p>

                            <div className="space-y-3 min-h-[140px]">
                                {isLoading ? (
                                    // Sleek loading state while DeepSeek processes
                                    <div className="flex flex-col gap-3">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="w-full h-12 rounded-xl bg-comrade-oxford/5 dark:bg-white/5 animate-pulse flex items-center px-4">
                                                <div className="w-6 h-6 rounded-full bg-comrade-oxford/10 dark:bg-white/10 mr-3"></div>
                                                <div className="h-2.5 rounded-full bg-comrade-oxford/10 dark:bg-white/10 w-3/4"></div>
                                            </div>
                                        ))}
                                        <p className="text-center font-sans text-xs text-comrade-gold dark:text-comrade-neonCyan mt-2 animate-pulse font-bold tracking-widest uppercase">
                                            Synthesizing options...
                                        </p>
                                    </div>
                                ) : (
                                    // Live Data Render
                                    suggestions.map(s => (
                                        <button 
                                            key={s.id} 
                                            onClick={dismiss}
                                            className="w-full text-left px-4 py-3 rounded-xl border border-comrade-oxford/5 dark:border-white/5 bg-white/40 dark:bg-surface-800/40 hover:bg-comrade-gold/10 dark:hover:bg-comrade-neonCyan/10 hover:border-comrade-gold/30 dark:hover:border-comrade-neonCyan/30 transition-all duration-300 flex items-center gap-3 group/btn"
                                        >
                                            <span className="text-xl group-hover/btn:scale-110 transition-transform">{s.icon}</span>
                                            <span className="font-sans text-xs font-bold text-comrade-oxford dark:text-gray-200 tracking-wider">{s.text}</span>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}