"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ListTodo, HelpCircle, ArrowRight } from "lucide-react";

const BRANCH_CARDS = [
  {
    icon: CheckCircle2,
    title: "Key Decisions",
    description: "Every major decision made during the meeting is automatically identified, tagged, and connected to context.",
    items: [
      "Focus on mid-market segment",
      "Launch in September",
      "Tiered pricing structure",
      "Hire 2 more engineers",
    ],
    gradient: "from-emerald-500 to-emerald-400",
    bgLight: "bg-emerald-50",
    borderColor: "border-emerald-200/60",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    dotColor: "bg-emerald-400",
    accent: "#10B981",
  },
  {
    icon: ListTodo,
    title: "Action Items",
    description: "Tasks, deadlines, and owners are extracted and organized into a clear checklist you can act on immediately.",
    items: [
      "Create GTM plan deck → Sarah",
      "Update messaging doc → James",
      "Research competitors → Michael",
      "Set pricing model → Emily",
    ],
    gradient: "from-blue-500 to-blue-400",
    bgLight: "bg-blue-50",
    borderColor: "border-blue-200/60",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    dotColor: "bg-blue-400",
    accent: "#3B82F6",
  },
  {
    icon: HelpCircle,
    title: "Questions",
    description: "Unanswered questions and open discussion points are captured so nothing gets lost during follow-ups.",
    items: [
      "Product review timeline?",
      "Customer interview scope?",
      "Competitor pricing validation?",
      "Board approval needed?",
    ],
    gradient: "from-amber-500 to-amber-400",
    bgLight: "bg-amber-50",
    borderColor: "border-amber-200/60",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    dotColor: "bg-amber-400",
    accent: "#F59E0B",
  },
];

function BranchCard({
  card,
  index,
}: {
  card: (typeof BRANCH_CARDS)[0];
  index: number;
}) {
  const Icon = card.icon;
  const direction = index === 0 ? -40 : index === 2 ? 40 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: direction, y: 20 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: index * 0.15 + 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="group"
    >
      <div className="h-full bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl p-6 sm:p-7 shadow-[0_8px_32px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-1 premium-card">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center`}>
            <Icon size={18} className={card.iconColor} />
          </div>
          <h3 className="text-[17px] sm:text-[19px] font-bold tracking-[-0.02em] text-gray-900">{card.title}</h3>
        </div>

        {/* Description */}
        <p className="text-[14px] leading-[1.6] text-gray-500 mb-5">{card.description}</p>

        {/* Items */}
        <div className="space-y-2.5">
          {card.items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 + i * 0.08 + 0.4 }}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors"
            >
              <div className={`w-1.5 h-1.5 rounded-full ${card.dotColor} shrink-0`} />
              <span className="text-[13px] text-gray-600">{item}</span>
            </motion.div>
          ))}
        </div>

        {/* People avatars */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-gray-100/80">
          <div className="flex -space-x-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 + i * 0.05 + 0.6, type: "spring" }}
                className="w-6 h-6 rounded-full border-2 border-white bg-gradient-to-br from-gray-200 to-gray-300"
              />
            ))}
          </div>
          <span className="text-[11px] text-gray-400 font-medium">
            3 people involved
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function ThreeBranches() {
  return (
    <section className="relative py-24 lg:py-32 px-6 lg:px-12 overflow-hidden"
      style={{ background: "#FAFAFA" }}
    >
      {/* Cinematic background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="section-glow-1" />
        <div className="section-glow-2" />
        <div
          className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] opacity-25"
          style={{
            background: "radial-gradient(ellipse at 20% 15%, rgba(255,255,255,0.4) 0%, rgba(191,219,254,0.12) 30%, transparent 60%)",
            filter: "blur(60px)",
          }}
        />
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
              AI Extraction
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-[36px] sm:text-[44px] lg:text-[52px] font-bold tracking-[-0.035em] leading-[1.1] text-gray-900"
          >
            Every meeting becomes
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-violet-500 to-blue-500 bg-clip-text text-transparent">
              structured intelligence.
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-[16px] text-gray-500 max-w-xl mx-auto"
          >
            MeetingOS automatically extracts three critical outputs from every
            conversation — organized, tagged, and ready to act on.
          </motion.p>
        </div>

        {/* Branching connection visual */}
        <div className="relative max-w-5xl mx-auto mb-12">
          <svg
            className="w-full h-16 sm:h-20"
            viewBox="0 0 800 80"
            fill="none"
          >
            <defs>
              <linearGradient id="branchGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="branchGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="branchGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Single line coming in */}
            <motion.path
              d="M400 0 C400 20 400 30 400 40"
              stroke="#3B82F6"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />

            {/* Self-drawing branch lines */}
            <motion.path
              d="M400 40 C400 50 200 55 130 60"
              stroke="url(#branchGrad1)"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeInOut" }}
            />
            <motion.path
              d="M400 40 C400 50 400 55 400 60"
              stroke="url(#branchGrad2)"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeInOut" }}
            />
            <motion.path
              d="M400 40 C400 50 600 55 670 60"
              stroke="url(#branchGrad3)"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.8, ease: "easeInOut" }}
            />

            {/* Glow dots at branch junction */}
            <motion.circle
              cx="400" cy="40" r="5"
              fill="#3B82F6"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 300, duration: 0.5 }}
            />
            <motion.circle
              cx="130" cy="60" r="4"
              fill="#10B981"
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 300, delay: 0.5 }}
            />
            <motion.circle
              cx="400" cy="60" r="4"
              fill="#3B82F6"
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 300, delay: 0.7 }}
            />
            <motion.circle
              cx="670" cy="60" r="4"
              fill="#F59E0B"
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 300, delay: 0.9 }}
            />

            {/* Pulsing glow around junction */}
            <motion.circle
              cx="400" cy="40" r="12"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="1"
              strokeOpacity="0.3"
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
              viewport={{ once: true }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            />
          </svg>
        </div>

        {/* Three Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {BRANCH_CARDS.map((card, index) => (
            <BranchCard key={card.title} card={card} index={index} />
          ))}
        </div>

        {/* Bottom connector hint */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="flex justify-center mt-12"
        >
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
            <span className="text-[13px] text-gray-500 font-medium">
              All outputs merge into your Company Brain
            </span>
            <ArrowRight size={14} className="text-gray-400" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
