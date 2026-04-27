/**
 * ComradeOS — Auth Store (Zustand)
 * Manages JWT token persistence and user session state.
 */

import { create } from 'zustand';
import { authApi } from '@/lib/api';

interface AuthState {
  token: string | null;
  username: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  register: (username: string, phone_number: string, password: string) => Promise<boolean>;
  login: (phone_number: string, password: string) => Promise<boolean>;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  username: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  register: async (username, phone_number, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.register({ username, phone_number, password });
      localStorage.setItem("comradeos_token", res.access_token);
      localStorage.setItem("comradeos_username", res.username);
      set({
        token: res.access_token,
        username: res.username,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } catch (err: any) {
      set({ isLoading: false, error: err.detail || "Registration failed." });
      return false;
    }
  },

  login: async (phone_number, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.login({ phone_number, password });
      localStorage.setItem("comradeos_token", res.access_token);
      localStorage.setItem("comradeos_username", res.username);
      set({
        token: res.access_token,
        username: res.username,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } catch (err: any) {
      set({ isLoading: false, error: err.detail || "Login failed." });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem("comradeos_token");
    localStorage.removeItem("comradeos_username");
    set({ token: null, username: null, isAuthenticated: false, error: null });
  },

  loadFromStorage: () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("comradeos_token");
    const username = localStorage.getItem("comradeos_username");
    if (token && username) {
      set({ token, username, isAuthenticated: true });
    }
  },
}));
