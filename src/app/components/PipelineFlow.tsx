"use client";

import { motion } from "framer-motion";
import { Mic, FileText, Brain, Sparkles } from "lucide-react";

const PIPELINE_STEPS = [
  {
    icon: Mic,
    title: "Meeting Recording",
    subtitle: "45:28 · 4 participants",
    gradient: "from-blue-500 to-blue-600",
    color: "blue",
  },
  {
    icon: FileText,
    title: "Live Transcript",
    subtitle: "Speaker-aware transcription",
    gradient: "from-emerald-500 to-emerald-600",
    color: "emerald",
  },
  {
    icon: Brain,
    title: "AI Summary",
    subtitle: "Key decisions & insights",
    gradient: "from-violet-500 to-violet-600",
    color: "violet",
  },
];

function PipelineCard({
  step,
  index,
}: {
  step: (typeof PIPELINE_STEPS)[0];
  index: number;
}) {
  const Icon = step.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: index * 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="group"
    >
      <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl p-6 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-1 premium-card">
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg shrink-0`}
          >
            <Icon size={20} className="text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="text-[17px] sm:text-[19px] font-bold tracking-[-0.02em] text-gray-900 mb-1">
              {step.title}
            </h3>
            <p className="text-[14px] text-gray-400 font-medium">{step.subtitle}</p>
          </div>
        </div>

        {/* Preview Content */}
        <div className="mt-5 pt-5 border-t border-gray-100/80">
          {index === 0 && (
            <div className="space-y-3">
              {/* Animated waveform that pulses while scrolling */}
              <div className="flex items-center gap-[2px] h-8">
                {Array.from({ length: 32 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-[3px] rounded-full bg-gradient-to-t from-blue-400/80 to-blue-500"
                    initial={{ height: 4 }}
                    whileInView={{ height: [4, Math.random() * 20 + 4, 4] }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: i * 0.04, repeat: Infinity, ease: "easeInOut" }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 text-[12px] text-gray-400">
                <div className="flex -space-x-1.5">
                  {[0, 1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, type: "spring" }}
                      className="w-5 h-5 rounded-full border-2 border-white bg-gradient-to-br from-gray-200 to-gray-300"
                    />
                  ))}
                </div>
                <span>Sarah, James, Michael, Emily</span>
              </div>
              {/* Timer count */}
              <div className="flex items-center gap-2 text-[11px] text-gray-400">
                <motion.span
                  className="w-1.5 h-1.5 rounded-full bg-blue-500"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span>Recording · 45:28</span>
              </div>
            </div>
          )}
          {index === 1 && (
            <div className="space-y-2">
              {[
                { name: "Sarah", time: "00:04", text: "Let's align on the GTM strategy for Q3..." },
                { name: "James", time: "00:15", text: "We should focus on mid-market first." },
                { name: "Michael", time: "00:32", text: "Agreed. The pricing model needs work." },
                { name: "Emily", time: "00:48", text: "I'll share competitive analysis by Friday." },
              ].map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="flex items-start gap-2.5"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-gray-700">{line.name}</span>
                      <span className="text-[10px] text-gray-400">{line.time}</span>
                    </div>
                    <motion.p
                      className="text-[11px] text-gray-500"
                      initial={{ width: "0%" }}
                      whileInView={{ width: "100%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.15 + 0.2 }}
                    >
                      {line.text}
                    </motion.p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          {index === 2 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-lg bg-violet-100 flex items-center justify-center">
                  <Sparkles size={12} className="text-violet-500" />
                </div>
                <span className="text-[12px] font-semibold text-violet-600">AI Generated</span>
                <motion.span
                  className="ml-auto text-[10px] text-gray-400"
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Analyzing...
                </motion.span>
              </div>
              {[
                "GTM strategy focusing on mid-market segment",
                "New pricing model with tiered structure",
                "Product positioning and messaging update",
                "Launch timeline targeted for September",
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className="flex items-start gap-2.5"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <span className="text-[12px] text-gray-600 leading-snug">{item}</span>
                    {/* Animated progress dot */}
                    <motion.div
                      className="h-[2px] bg-gradient-to-r from-violet-400 to-transparent rounded-full mt-1"
                      initial={{ width: "0%" }}
                      whileInView={{ width: "100%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: i * 0.2 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function PipelineFlow() {
  return (
    <section className="relative py-24 lg:py-32 px-6 lg:px-12 bg-white overflow-hidden" id="features">
      {/* Cinematic background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] opacity-25"
          style={{
            background: "radial-gradient(ellipse at 20% 15%, rgba(255,255,255,0.4) 0%, rgba(191,219,254,0.12) 30%, transparent 60%)",
            filter: "blur(60px)",
          }}
        />
        <div className="section-glow-1" />
        <div className="section-glow-2" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: "radial-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16 lg:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-sm mb-6"
          >
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse-soft" />
            <span className="text-[12px] font-semibold text-blue-600 tracking-wide">
              AI Pipeline
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-[36px] sm:text-[44px] lg:text-[52px] font-bold tracking-[-0.035em] leading-[1.1] text-gray-900"
          >
            From raw audio to
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-violet-500 to-blue-500 bg-clip-text text-transparent">
              structured knowledge.
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-[16px] text-gray-500 max-w-xl mx-auto"
          >
            Watch how MeetingOS transforms your meeting recordings into actionable
            intelligence — automatically, in seconds.
          </motion.p>
        </div>

        {/* Pipeline Flow */}
        <div className="relative max-w-4xl mx-auto">
          {/* Animated connection line */}
          <svg
            className="absolute top-0 left-[26px] sm:left-[28px] w-0.5 h-full pointer-events-none z-0"
            width="4"
            height="100%"
            viewBox="0 0 4 1000"
            fill="none"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="pipeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
                <stop offset="33%" stopColor="#3B82F6" stopOpacity="0.6" />
                <stop offset="66%" stopColor="#10B981" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            <motion.path
              d="M2 0 L2 1000"
              stroke="url(#pipeGrad)"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.3, ease: "easeInOut" }}
            />
          </svg>

          <div className="space-y-8 lg:space-y-12 relative z-10">
            {PIPELINE_STEPS.map((step, index) => (
              <div key={step.title} className="relative pl-14 sm:pl-16">
                {/* Connection dot */}
                <motion.div
                  className="absolute left-0 top-8 w-8 h-8 rounded-full border-[3px] border-white shadow-lg flex items-center justify-center"
                  style={{
                    backgroundColor:
                      index === 0
                        ? "#3B82F6"
                        : index === 1
                          ? "#10B981"
                          : "#8B5CF6",
                    boxShadow: `0 0 20px ${
                      index === 0
                        ? "rgba(59,130,246,0.4)"
                        : index === 1
                          ? "rgba(16,185,129,0.4)"
                          : "rgba(139,92,246,0.4)"
                    }`,
                  }}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2, type: "spring" }}
                >
                  <step.icon size={14} className="text-white" />
                </motion.div>

                <PipelineCard step={step} index={index} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
