import { motion } from 'framer-motion';

export default function FloatingPanel({ children, className = '', ...props }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={`panel ${className}`}
            {...props}
        >
            {children}
        </motion.div>
    );
}

