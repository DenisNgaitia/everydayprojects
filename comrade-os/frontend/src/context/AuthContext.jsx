/**
 * AuthContext.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Provides authentication state across the app.
 *
 * Exposes:
 *   user           — current user object (or null)
 *   token          — JWT string (or null)
 *   isAuthenticated— boolean
 *   isLoading      — true while validating stored token on mount
 *   login(email, password) → { user, token }
 *   register(name, email, password) → { user, token }
 *   logout()       → clears state + redirects to /login
 *   error          — last auth error string (or null)
 *   clearError()   → clears error
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, getToken, setToken, clearToken } from '../utils/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setTokenState] = useState(getToken());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const isAuthenticated = !!user && !!token;

    // ── Validate stored token on mount ────────────────────────────────────
    useEffect(() => {
        const validateToken = async () => {
            const storedToken = getToken();
            if (!storedToken) {
                setIsLoading(false);
                return;
            }

            try {
                const data = await api.get('/api/auth/me');
                setUser(data.user);
                setTokenState(storedToken);
            } catch {
                // Token invalid or expired — clear it
                clearToken();
                setUser(null);
                setTokenState(null);
            } finally {
                setIsLoading(false);
            }
        };

        validateToken();
    }, []);

    // ── Login ─────────────────────────────────────────────────────────────
    const login = useCallback(async (email, password) => {
        setError(null);
        try {
            const data = await api.post('/api/auth/login', { email, password });
            setToken(data.token);
            setTokenState(data.token);
            setUser(data.user);
            return data;
        } catch (err) {
            const message = err.error || 'Login failed. Please try again.';
            setError(message);
            throw new Error(message);
        }
    }, []);

    // ── Register ──────────────────────────────────────────────────────────
    const register = useCallback(async (name, email, password) => {
        setError(null);
        try {
            const data = await api.post('/api/auth/register', { name, email, password });
            setToken(data.token);
            setTokenState(data.token);
            setUser(data.user);
            return data;
        } catch (err) {
            const message = err.error || 'Registration failed. Please try again.';
            setError(message);
            throw new Error(message);
        }
    }, []);

    // ── Logout ────────────────────────────────────────────────────────────
    const logout = useCallback(() => {
        clearToken();
        setUser(null);
        setTokenState(null);
        setError(null);
    }, []);

    // ── Clear Error ───────────────────────────────────────────────────────
    const clearError = useCallback(() => setError(null), []);

    const value = {
        user,
        token,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        logout,
        clearError,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
    return ctx;
}
