/**
 * LoginPage.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Premium cyberpunk login/register page for ComradeOS.
 * Features: tab toggle, glassmorphism form, animated submit, error display.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Animated background grid ─────────────────────────────────────────────────

function GridBackground() {
    return (
        <div className="login-grid-bg" aria-hidden="true">
            {/* Horizontal scan line */}
            <motion.div
                className="login-scanline"
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
            />
        </div>
    );
}

// ─── Score Ring for branding ──────────────────────────────────────────────────

function LogoRing() {
    const r = 28;
    const circ = 2 * Math.PI * r;

    return (
        <motion.svg
            width="72" height="72"
            className="-rotate-90"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
            <circle cx="36" cy="36" r={r} fill="none" stroke="var(--border)" strokeWidth="3" />
            <motion.circle
                cx="36" cy="36" r={r}
                fill="none" stroke="var(--accent-cyan)"
                strokeWidth="3"
                strokeDasharray={circ}
                strokeLinecap="round"
                initial={{ strokeDashoffset: circ }}
                animate={{ strokeDashoffset: circ * 0.15 }}
                transition={{ delay: 0.4, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                style={{ filter: 'drop-shadow(0 0 6px var(--accent-cyan))' }}
            />
            <text
                x="36" y="40"
                textAnchor="middle"
                className="rotate-90"
                style={{
                    fontSize: '16px',
                    fontWeight: 800,
                    fill: 'var(--accent-cyan)',
                    transformOrigin: '36px 36px',
                }}
            >
                CO
            </text>
        </motion.svg>
    );
}

// ─── LoginPage ────────────────────────────────────────────────────────────────

export default function LoginPage() {
    const navigate = useNavigate();
    const { login, register, isAuthenticated, isLoading, error, clearError } = useAuth();

    const [mode, setMode] = useState('login'); // 'login' | 'register'
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [localError, setLocalError] = useState(null);

    // If already authenticated, redirect to dashboard
    useEffect(() => {
        if (isAuthenticated) navigate('/', { replace: true });
    }, [isAuthenticated, navigate]);

    // Clear errors on mode switch
    useEffect(() => {
        setLocalError(null);
        clearError();
    }, [mode, clearError]);

    const displayError = localError || error;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError(null);
        clearError();

        // Client-side validation
        if (mode === 'register') {
            if (!name.trim()) return setLocalError('Name is required.');
            if (name.trim().length < 2) return setLocalError('Name must be at least 2 characters.');
        }
        if (!email.trim()) return setLocalError('Email is required.');
        if (!/^\S+@\S+\.\S+$/.test(email)) return setLocalError('Please enter a valid email.');
        if (!password) return setLocalError('Password is required.');
        if (password.length < 6) return setLocalError('Password must be at least 6 characters.');
        if (mode === 'register' && password !== confirmPassword) {
            return setLocalError('Passwords do not match.');
        }

        setSubmitting(true);
        try {
            if (mode === 'login') {
                await login(email.trim(), password);
            } else {
                await register(name.trim(), email.trim(), password);
            }
            navigate('/', { replace: true });
        } catch {
            // Error is already set by AuthContext
        } finally {
            setSubmitting(false);
        }
    };

    if (isLoading) return null; // AuthContext is still validating

    return (
        <div className="login-page">
            <GridBackground />

            <motion.div
                className="login-card"
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
                {/* ── Logo ────────────────────────────────────────────── */}
                <div className="flex flex-col items-center mb-6">
                    <LogoRing />
                    <h1
                        className="text-[20px] font-bold mt-3"
                        style={{ color: 'var(--text-primary)', letterSpacing: '-0.3px' }}
                    >
                        Comrade<span style={{ color: 'var(--accent-cyan)' }}>OS</span>
                    </h1>
                    <p className="text-[12px] mt-1" style={{ color: 'var(--text-secondary)' }}>
                        {mode === 'login' ? 'Welcome back, Comrade.' : 'Join the system.'}
                    </p>
                </div>

                {/* ── Mode Toggle ─────────────────────────────────────── */}
                <div
                    className="flex rounded-full p-1 mb-6"
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                >
                    {['login', 'register'].map(m => (
                        <button
                            key={m}
                            id={`auth-mode-${m}`}
                            onClick={() => setMode(m)}
                            className="flex-1 text-[13px] font-semibold py-2 rounded-full transition-all capitalize"
                            style={{
                                background: mode === m
                                    ? 'linear-gradient(135deg, var(--accent-pink), var(--accent-purple))'
                                    : 'transparent',
                                color: mode === m ? '#fff' : 'var(--text-secondary)',
                                boxShadow: mode === m ? '0 0 12px var(--glow-pink)' : 'none',
                            }}
                        >
                            {m}
                        </button>
                    ))}
                </div>

                {/* ── Error Display ────────────────────────────────────── */}
                <AnimatePresence>
                    {displayError && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            className="rounded-xl px-4 py-3 text-[13px]"
                            style={{
                                background: 'rgba(255, 43, 214, 0.08)',
                                border: '1px solid var(--accent-pink)',
                                color: 'var(--accent-pink)',
                            }}
                        >
                            {displayError}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Form ─────────────────────────────────────────────── */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <AnimatePresence mode="wait">
                        {mode === 'register' && (
                            <motion.div
                                key="name-field"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <label className="login-label">Name</label>
                                <input
                                    id="auth-name"
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Your name"
                                    className="login-input"
                                    autoComplete="name"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div>
                        <label className="login-label">Email</label>
                        <input
                            id="auth-email"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="comrade@example.com"
                            className="login-input"
                            autoComplete="email"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="login-label">Password</label>
                        <input
                            id="auth-password"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="login-input"
                            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                        />
                    </div>

                    <AnimatePresence mode="wait">
                        {mode === 'register' && (
                            <motion.div
                                key="confirm-field"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <label className="login-label">Confirm Password</label>
                                <input
                                    id="auth-confirm-password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="login-input"
                                    autoComplete="new-password"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── Submit Button ─────────────────────────────────── */}
                    <motion.button
                        id="auth-submit"
                        type="submit"
                        disabled={submitting}
                        className="login-submit"
                        whileTap={{ scale: 0.97 }}
                    >
                        {submitting ? (
                            <motion.span
                                className="inline-block w-5 h-5 rounded-full"
                                style={{
                                    border: '2px solid rgba(255,255,255,0.3)',
                                    borderTopColor: '#fff',
                                }}
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                            />
                        ) : (
                            mode === 'login' ? 'Log In' : 'Create Account'
                        )}
                    </motion.button>
                </form>

                {/* ── Footer ───────────────────────────────────────────── */}
                <p className="text-center text-[12px] mt-6" style={{ color: 'var(--text-secondary)' }}>
                    {mode === 'login' ? (
                        <>Don't have an account? <button onClick={() => setMode('register')} className="login-link">Register</button></>
                    ) : (
                        <>Already a comrade? <button onClick={() => setMode('login')} className="login-link">Log in</button></>
                    )}
                </p>
            </motion.div>
        </div>
    );
}
