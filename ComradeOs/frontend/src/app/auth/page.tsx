"use client";

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { ShieldAlert, LogIn, UserPlus, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');

  const { login, register, isLoading, error, isAuthenticated, loadFromStorage } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let success: boolean;
    if (isLogin) {
      success = await login(phoneNumber, password);
    } else {
      success = await register(username, phoneNumber, password);
    }

    if (success) {
      router.push('/dashboard');
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950">
      
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600 mb-3">
            ComradeOS
          </h1>
          <p className="text-slate-400 text-lg">
            {isLogin ? "Welcome back, comrade." : "Join the revolution."}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-800/60 border border-slate-700 p-8 rounded-2xl shadow-2xl backdrop-blur-sm">
          
          {/* Toggle Tabs */}
          <div className="flex mb-8 bg-slate-900/50 rounded-xl p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                isLogin ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn size={16} /> Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                !isLogin ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus size={16} /> Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            {/* Username (register only) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="comrade_doe"
                  required={!isLogin}
                  minLength={3}
                  className="w-full px-4 py-3 bg-slate-900/70 border border-slate-600 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            )}

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="0712345678"
                required
                minLength={10}
                className="w-full px-4 py-3 bg-slate-900/70 border border-slate-600 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full px-4 py-3 bg-slate-900/70 border border-slate-600 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-950/50 border border-red-800 rounded-xl text-red-300 text-sm">
                <ShieldAlert size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>{isLogin ? 'Login' : 'Create Account'}</>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-500 text-xs mt-6">
          Survive, Grind, Thrive. Welcome to ComradeOS.
        </p>
      </div>

    </main>
  );
}
