"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  ArrowRight,
  Play,
  Mic,
  FileText,
  Brain,
  CheckCircle2,
  ListTodo,
  Sparkles,
  Video,
  Camera,
  MessageSquare,
  Upload,
  Headphones,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useMemo } from "react";

const INTEGRATIONS = [
  { name: "Zoom", icon: Video },
  { name: "Google Meet", icon: Camera },
  { name: "MS Teams", icon: MessageSquare },
  { name: "Upload File", icon: Upload },
  { name: "Voice Note", icon: Headphones },
];

/* ─── Premium Waveform ─── */
function AudioWaveform({ animate = true }: { animate?: boolean }) {
  const bars = useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => ({
        height: Math.random() * 22 + 4,
        delay: i * 0.04,
      })),
    []
  );

  return (
    <div className="flex items-center gap-[2px] h-10">
      {bars.map((bar, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full bg-gradient-to-t from-blue-400/80 to-blue-500"
          initial={{ height: 4 }}
          animate={animate ? { height: [4, bar.height, 4] } : { height: bar.height }}
          transition={
            animate
              ? { duration: 1.2, delay: bar.delay, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.5 }
          }
        />
      ))}
    </div>
  );
}

/* ─── Premium Glass Card ─── */
function GlassCard({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`bg-white/75 backdrop-blur-xl border border-white/50 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.04),0_1px_4px_rgba(0,0,0,0.02),inset_0_1px_0_rgba(255,255,255,0.6)] ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* ─── Connection Lines ─── */
function ConnectionLines() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 500 580"
      fill="none"
    >
      <defs>
        <linearGradient id="lineGradBlue" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.7" />
          <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="lineGradGreen" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.5" />
          <stop offset="50%" stopColor="#10B981" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="lineGradAmber" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.5" />
          <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.7" />
        </linearGradient>
        <filter id="glowBlue">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Main vertical flow */}
      <motion.path
        d="M250 70 C250 130 250 160 250 210 C250 260 170 280 170 330 C170 380 250 400 250 470"
        stroke="url(#lineGradBlue)"
        strokeWidth="3"
        strokeLinecap="round"
        filter="url(#glowBlue)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2.5, delay: 0.3, ease: "easeInOut" }}
      />

      {/* Branch to transcript */}
      <motion.path
        d="M250 240 C220 260 170 280 170 300"
        stroke="url(#lineGradBlue)"
        strokeWidth="2"
        strokeLinecap="round"
        filter="url(#glowBlue)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.7, ease: "easeInOut" }}
      />
      {/* Branch to summary */}
      <motion.path
        d="M250 240 C280 260 330 280 330 300"
        stroke="url(#lineGradBlue)"
        strokeWidth="2"
        strokeLinecap="round"
        filter="url(#glowBlue)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.9, ease: "easeInOut" }}
      />

      {/* Branches to bottom cards */}
      <motion.path
        d="M250 460 C220 480 170 500 170 520"
        stroke="url(#lineGradGreen)"
        strokeWidth="2"
        strokeLinecap="round"
        filter="url(#glowBlue)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2, delay: 1.2, ease: "easeInOut" }}
      />
      <motion.path
        d="M250 460 C250 480 250 500 250 520"
        stroke="url(#lineGradBlue)"
        strokeWidth="2"
        strokeLinecap="round"
        filter="url(#glowBlue)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2, delay: 1.4, ease: "easeInOut" }}
      />
      <motion.path
        d="M250 460 C280 480 330 500 330 520"
        stroke="url(#lineGradAmber)"
        strokeWidth="2"
        strokeLinecap="round"
        filter="url(#glowBlue)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2, delay: 1.6, ease: "easeInOut" }}
      />

      {/* Ambient glow rings */}
      <motion.circle
        cx="250" cy="270" r="160"
        fill="none" stroke="#3B82F6" strokeWidth="1.5" strokeOpacity="0.12"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: [0.8, 1.2, 0.8], opacity: [0, 0.15, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.circle
        cx="250" cy="270" r="200"
        fill="none" stroke="#3B82F6" strokeWidth="1" strokeOpacity="0.06"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: [0.9, 1.3, 0.9], opacity: [0, 0.1, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}

/* ─── Hand-drawn Marker SVG ─── */
function HandDrawnMarker() {
  return (
    <svg
      className="absolute -bottom-1.5 left-0 w-full pointer-events-none"
      viewBox="0 0 380 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <motion.path
        d="M4 16.5 C40 10 80 6 120 8 C160 10 200 14 240 12 C280 10 320 6 360 10 C370 11 375 12 377 13"
        stroke="url(#markerGrad)"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{
          strokeDasharray: 400,
          strokeDashoffset: 0,
        }}
      />
      <defs>
        <linearGradient id="markerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.1" />
          <stop offset="15%" stopColor="#3B82F6" stopOpacity="0.7" />
          <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.9" />
          <stop offset="85%" stopColor="#3B82F6" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 60, damping: 20 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);
  const rotateX = useTransform(y, [-300, 300], [3, -3]);
  const rotateY = useTransform(x, [-300, 300], [-3, 3]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      mouseX.set(e.clientX - cx);
      mouseY.set(e.clientY - cy);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen overflow-hidden bg-[#FAFAFA]"
    >
      {/* ─── Cinematic Lighting ─── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top-left sunlight */}
        <div className="absolute top-[-30%] left-[-20%] w-[80%] h-[80%] opacity-40"
          style={{
            background: "radial-gradient(ellipse at 20% 15%, rgba(255,255,255,0.7) 0%, rgba(191,219,254,0.2) 30%, transparent 60%)",
            filter: "blur(60px)",
          }}
        />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        {/* Ambient glows */}
        <div className="absolute top-[-15%] left-[-10%] w-[60%] h-[60%] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(191,219,254,0.25) 0%, transparent 70%)" }}
        />
        <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(221,214,254,0.18) 0%, transparent 70%)" }}
        />
        <motion.div
          className="absolute top-[20%] right-[20%] w-72 h-72 bg-blue-200/10 rounded-full blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-[25%] left-[15%] w-56 h-56 bg-violet-200/10 rounded-full blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* ─── Main Content ─── */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 pt-28 sm:pt-32 pb-20 min-h-screen flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center w-full">
          {/* ═══ LEFT ═══ */}
          <div className="flex flex-col max-w-[640px]">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-[0_2px_8px_rgba(0,0,0,0.03)] mb-8 w-fit"
            >
              <Sparkles size={14} className="text-blue-500" />
              <span className="text-[12px] font-semibold text-gray-500 tracking-wide">
                From conversation to company memory
              </span>
            </motion.div>

            {/* Headline — Apple Keynote quality */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-[48px] sm:text-[60px] md:text-[76px] lg:text-[88px] font-bold tracking-[-0.045em] leading-[0.95] mb-8"
            >
              <span className="text-gray-900">One Recording.</span>
              <br />
              <span className="relative inline-block mt-1">
                <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-shift">
                  Infinite Knowledge.
                </span>
                <HandDrawnMarker />
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="text-[16px] sm:text-[18px] leading-[1.7] text-gray-500 max-w-[520px] mb-10"
            >
              MeetingOS automatically understands meetings, extracts decisions,
              creates action items, and stores everything forever inside your
              company brain.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="flex flex-wrap items-center gap-4 mb-12"
            >
              <a
                href="/register"
                className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gray-900 text-white font-semibold text-[15px] hover:bg-gray-800 transition-all duration-300 shadow-xl shadow-gray-900/20 hover:shadow-2xl hover:shadow-gray-900/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                Start Free
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform duration-200"
                />
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl border border-gray-200 bg-white/60 backdrop-blur-sm text-gray-600 font-semibold text-[15px] hover:bg-white hover:border-gray-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Play size={14} className="text-gray-600 ml-0.5" />
                </div>
                Watch Demo
              </a>
            </motion.div>

            {/* Integration Pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="flex flex-wrap items-center gap-2"
            >
              <span className="text-[12px] text-gray-400 font-medium mr-1">
                Works with
              </span>
              {INTEGRATIONS.map((integration, i) => {
                const Icon = integration.icon;
                return (
                  <motion.div
                    key={integration.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.8 + i * 0.05 }}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200/50 text-[13px] font-medium text-gray-500 hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-default"
                  >
                    <Icon size={14} className="text-gray-400" />
                    {integration.name}
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* ═══ RIGHT — Visual Demo Cards ═══ */}
          <div className="relative hidden lg:block">
            <motion.div
              style={{ rotateX, rotateY, transformPerspective: 1200 }}
              className="relative w-full aspect-[4/5] max-w-[560px] ml-auto"
            >
              <ConnectionLines />

              {/* Card 1: Meeting Recording */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[340px]">
                <GlassCard delay={0.3} className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Mic size={16} className="text-white" />
                      </div>
                      <span className="text-[14px] font-semibold text-gray-900">
                        Meeting Recording
                      </span>
                    </div>
                    <motion.span
                      className="text-[12px] font-medium text-gray-400 tabular-nums"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                    >
                      45:28
                    </motion.span>
                  </div>
                  <AudioWaveform />
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex -space-x-1.5">
                      {[0, 1, 2, 3].map((i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.8 + i * 0.1, type: "spring" }}
                          className="w-6 h-6 rounded-full border-2 border-white bg-gradient-to-br from-gray-200 to-gray-300"
                        />
                      ))}
                    </div>
                    <motion.span
                      className="text-[11px] text-gray-400"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.2 }}
                    >
                      4 participants
                    </motion.span>
                  </div>
                </GlassCard>
              </div>

              {/* Card 2: Live Transcript */}
              <div className="absolute top-[210px] left-0 w-[260px]">
                <GlassCard delay={0.5} className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <FileText size={13} className="text-emerald-600" />
                    </div>
                    <span className="text-[13px] font-semibold text-gray-900">
                      Live Transcript
                    </span>
                    <motion.span
                      className="ml-auto px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-600"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      LIVE
                    </motion.span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { name: "Sarah", time: "00:04", text: "Let's align on the GTM strategy..." },
                      { name: "James", time: "00:15", text: "We should focus on mid-market..." },
                      { name: "Michael", time: "00:32", text: "Agreed. Pricing model needs..." },
                    ].map((line, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.2 + i * 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="flex items-start gap-2"
                      >
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-semibold text-gray-700">
                              {line.name}
                            </span>
                            <span className="text-[10px] text-gray-400">{line.time}</span>
                          </div>
                          <p className="text-[11px] text-gray-500 truncate">{line.text}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </GlassCard>
              </div>

              {/* Card 3: AI Summary */}
              <div className="absolute top-[200px] right-0 w-[220px]">
                <GlassCard delay={0.6} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center">
                        <Brain size={13} className="text-violet-600" />
                      </div>
                      <span className="text-[13px] font-semibold text-gray-900">
                        AI Summary
                      </span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-violet-100 text-violet-600">
                      AI
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {[
                      "GTM strategy focusing on mid-market",
                      "New pricing model discussion",
                      "Product positioning and messaging",
                      "Launch timeline for September",
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.6 + i * 0.2 }}
                        className="flex items-start gap-2"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                        <span className="text-[11px] text-gray-600 leading-snug">{item}</span>
                      </motion.div>
                    ))}
                  </div>
                </GlassCard>
              </div>

              {/* Card 4: Key Decisions */}
              <div className="absolute bottom-[20px] left-[10px] w-[195px]">
                <GlassCard delay={0.7} className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <CheckCircle2 size={13} className="text-emerald-600" />
                    </div>
                    <span className="text-[13px] font-semibold text-gray-900">
                      Key Decisions
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {["Focus on mid-market", "Launch in September"].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.8 + i * 0.15 }}
                        className="flex items-center gap-2"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="text-[11px] text-gray-600">{item}</span>
                      </motion.div>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 mt-3">
                    <div className="flex -space-x-1.5">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="w-5 h-5 rounded-full border-2 border-white bg-gradient-to-br from-gray-200 to-gray-300" />
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-400 ml-1">+2</span>
                  </div>
                </GlassCard>
              </div>

              {/* Card 5: Action Items */}
              <div className="absolute bottom-[20px] left-[215px] w-[185px]">
                <GlassCard delay={0.8} className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center">
                      <ListTodo size={13} className="text-blue-600" />
                    </div>
                    <span className="text-[13px] font-semibold text-gray-900">
                      Action Items
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {["Create GTM plan deck", "Update messaging doc"].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 2 + i * 0.15 }}
                        className="flex items-center gap-2"
                      >
                        <div className="w-3.5 h-3.5 rounded border border-gray-300 shrink-0" />
                        <span className="text-[11px] text-gray-600">{item}</span>
                      </motion.div>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 mt-3">
                    <div className="flex -space-x-1.5">
                      {[0, 1].map((i) => (
                        <div key={i} className="w-5 h-5 rounded-full border-2 border-white bg-gradient-to-br from-gray-200 to-gray-300" />
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-400 ml-1">+3 more</span>
                  </div>
                </GlassCard>
              </div>

              {/* Card 6: Questions */}
              <div className="absolute bottom-[20px] right-0 w-[165px]">
                <GlassCard delay={0.9} className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center">
                      <Zap size={13} className="text-amber-600" />
                    </div>
                    <span className="text-[13px] font-semibold text-gray-900">
                      Questions
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {["Product review timeline?", "Customer interviews scope?"].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 2.2 + i * 0.15 }}
                        className="flex items-start gap-2"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        <span className="text-[11px] text-gray-600">{item}</span>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <span className="text-[10px] text-gray-400">+2 more</span>
                  </div>
                </GlassCard>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ─── Bottom scroll indicator ─── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2.5 }}
        className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-2"
      >
        <span className="text-[12px] text-gray-400 font-medium tracking-wide">
          Scroll to explore
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-5 h-8 rounded-full border border-gray-300 flex justify-center pt-1.5"
        >
          <div className="w-1 h-2 rounded-full bg-gray-400" />
        </motion.div>
      </motion.div>
    </section>
  );
}
