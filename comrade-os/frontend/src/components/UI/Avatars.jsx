import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function AIAvatar() {
    const navigate = useNavigate();
    return (
        <motion.button
            onClick={() => navigate('/ai')}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center z-50 bg-gradient-to-br from-neon-cyan to-neon-purple shadow-lg"
            style={{ boxShadow: '0 0 20px rgba(0, 240, 255, 0.4), 0 4px 12px rgba(0,0,0,0.3)' }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            animate={{ y: [0, -4, 0] }}
            transition={{ y: { repeat: Infinity, duration: 2, ease: 'easeInOut' } }}
            aria-label="Open AI Assistant"
        >
            <span className="text-2xl">🤖</span>
        </motion.button>
    );
}