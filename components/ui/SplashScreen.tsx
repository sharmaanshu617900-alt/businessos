'use client';

import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState(0); // 0=hidden, 1=logo, 2=text, 3=tagline, 4=exit

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 100);
    const t2 = setTimeout(() => setPhase(2), 600);
    const t3 = setTimeout(() => setPhase(3), 1100);
    const t4 = setTimeout(() => setPhase(4), 2200);
    const t5 = setTimeout(() => onComplete(), 2700);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-500 ${phase === 4 ? 'opacity-0' : 'opacity-100'}`}
      style={{ background: 'linear-gradient(135deg, #0F0A1A 0%, #1A1035 30%, #0D1B2A 60%, #0A192F 100%)' }}>

      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 4 + 1,
              height: Math.random() * 4 + 1,
              background: `rgba(${99 + Math.random() * 60}, ${102 + Math.random() * 60}, ${241}, ${0.1 + Math.random() * 0.3})`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Glow effect behind logo */}
      <div
        className={`absolute transition-all duration-1000 ${phase >= 1 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
        style={{
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Logo icon */}
      <div className={`relative transition-all duration-700 ${phase >= 1 ? 'scale-100 opacity-100 translate-y-0' : 'scale-0 opacity-0 translate-y-8'}`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}>
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-400 flex items-center justify-center shadow-2xl shadow-indigo-500/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent" />
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <path d="M24 8L8 22V38C8 39.1 8.9 40 10 40H20V28H28V40H38C39.1 40 40 39.1 40 38V22L24 8Z" fill="white" opacity="0.95"/>
            <circle cx="36" cy="14" r="5" fill="#FDE68A"/>
            <path d="M36 11.5C37.38 11.5 38.5 12.62 38.5 14C38.5 15.93 36 18 36 18C36 18 33.5 15.93 33.5 14C33.5 12.62 34.62 11.5 36 11.5Z" fill="white"/>
          </svg>
          {/* Shimmer effect */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)', backgroundSize: '200% 100%' }} />
        </div>
        {/* Pulse ring */}
        <div className={`absolute inset-0 rounded-3xl border-2 border-indigo-400/30 ${phase >= 1 ? 'animate-ping' : ''}`}
          style={{ animationDuration: '1.5s' }} />
      </div>

      {/* App name */}
      <div className={`mt-6 transition-all duration-700 ${phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Ghar<span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Dhoondo</span>
        </h1>
      </div>

      {/* Tagline */}
      <div className={`mt-2 transition-all duration-700 ${phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}>
        <p className="text-sm text-indigo-200/60 font-medium tracking-wide">Find Your Perfect Home</p>
      </div>

      {/* Loading dots */}
      <div className={`mt-10 flex gap-1.5 transition-all duration-500 ${phase >= 2 ? 'opacity-100' : 'opacity-0'}`}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-indigo-400"
            style={{
              animation: 'pulse-glow 1.2s ease-in-out infinite',
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
