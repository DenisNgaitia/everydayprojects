import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function AIAvatar() {
    const navigate = useNavigate();
    return (
        <motion.button
            onClick={() => navigate('/ai')}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center z-50"
            style={{
                background: 'var(--panel)',
                border: '1px solid var(--border)',
                boxShadow: '0 0 20px var(--glow-purple, rgba(139,92,246,0.3))',
            }}
            whileHover={{ scale: 1.15, boxShadow: '0 0 30px var(--glow-pink)' }}
            whileTap={{ scale: 0.9 }}
            aria-label="Open AI Assistant"
        >
            <span className="text-2xl">🤖</span>
        </motion.button>
    );
}