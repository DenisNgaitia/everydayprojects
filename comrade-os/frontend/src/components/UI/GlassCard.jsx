import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '', glow = false, ...props }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
            className={`glass rounded-2xl p-5 card-hover ${glow ? 'gradient-border' : ''} ${className}`}
            {...props}
        >
            {children}
        </motion.div>
    );
}