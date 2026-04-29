/**
 * ProtectedRoute.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Wrapper component for routes that require authentication.
 *
 * - If authenticated → render children
 * - If loading (token validation in progress) → render loading spinner
 * - If not authenticated → redirect to /login
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

function LoadingScreen() {
    return (
        <div
            className="fixed inset-0 flex flex-col items-center justify-center gap-4"
            style={{ background: 'var(--bg-primary)', zIndex: 9999 }}
        >
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                className="w-10 h-10 rounded-full"
                style={{
                    border: '3px solid var(--border)',
                    borderTopColor: 'var(--accent-cyan)',
                }}
            />
            <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                Authenticating…
            </p>
        </div>
    );
}

export default function ProtectedRoute({ children }) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) return <LoadingScreen />;
    if (!isAuthenticated) return <Navigate to="/login" replace />;

    return children;
}
