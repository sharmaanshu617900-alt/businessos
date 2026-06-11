'use client';

import React, { useState, useEffect } from 'react';

const ADMIN_PASSWORD = 'admin123';

interface AdminLoginProps {
  onSuccess: () => void;
  onBack: () => void;
}

export default function AdminLogin({ onSuccess, onBack }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [shaking, setShaking] = useState(false);

  // Check if already authenticated
  useEffect(() => {
    // Try server-side session first (web), fall back to client-side (APK)
    fetch('/api/admin/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) onSuccess();
      })
      .catch(() => {
        // API route not available (Capacitor/static build) — check localStorage
        const session = localStorage.getItem('admin_session');
        if (session) onSuccess();
      });
  }, [onSuccess]);

  const handleLogin = async () => {
    if (!password.trim()) return;
    setLoading(true);
    setError('');

    try {
      // Try server-side auth first (web deployment)
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        onSuccess();
        return;
      }
      setError(data.error || 'Incorrect password');
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      setPassword('');
    } catch {
      // API not available (Capacitor APK) — use client-side auth
      if (password === ADMIN_PASSWORD) {
        localStorage.setItem('admin_session', 'authenticated');
        onSuccess();
      } else {
        setError('Incorrect password');
        setShaking(true);
        setTimeout(() => setShaking(false), 500);
        setPassword('');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 items-center justify-center px-6">
      <div className={`w-full max-w-sm`}
        style={{ animation: shaking ? 'shake 0.5s ease-in-out' : 'none' }}>
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-400 flex items-center justify-center shadow-2xl shadow-indigo-500/30">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">Admin Panel</h2>
          <p className="text-sm text-zinc-500 mt-1">Enter password to continue</p>
        </div>

        {/* Password Input */}
        <div className="space-y-4">
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Enter admin password"
              disabled={loading}
              className="w-full px-5 py-4 bg-white dark:bg-zinc-800 rounded-2xl text-sm text-zinc-900 dark:text-zinc-100 outline-none border-2 border-zinc-200 dark:border-zinc-700 focus:border-indigo-500 transition-all font-medium shadow-sm disabled:opacity-50"
              autoFocus
            />
            {error && (
              <p className="text-xs text-red-500 font-semibold mt-2 animate-fade-in">{error}</p>
            )}
          </div>

          <button
            onClick={handleLogin}
            disabled={!password || loading}
            className="w-full py-4 btn-luxury text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying...
              </>
            ) : (
              <>Login</>
            )}
          </button>

          <button
            onClick={onBack}
            disabled={loading}
            className="w-full py-3 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 font-medium transition-colors disabled:opacity-50"
          >
            Back
          </button>
        </div>

        <p className="text-center text-[10px] text-zinc-400 mt-8">Admin access is password protected</p>
      </div>
    </div>
  );
}
