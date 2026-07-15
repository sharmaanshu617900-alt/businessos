"use client";

import { motion } from "framer-motion";
import { Upload, Headphones, FileCheck, ListTodo, Database } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";

const STEPS = [
  {
    num: "01",
    title: "Upload Recording",
    subtitle: "Drop any meeting file",
    description: "Drag & drop recordings from Zoom, Google Meet, Teams, or any source. MeetingOS accepts MP4, MP3, and transcript files.",
    icon: Upload,
  },
  {
    num: "02",
    title: "AI Understands Speakers",
    subtitle: "Who said what",
    description: "Speaker diarization identifies each participant, separates overlapping speech, and attributes every word to the right person.",
    icon: Headphones,
  },
  {
    num: "03",
    title: "Smart Summary Generated",
    subtitle: "Key points extracted",
    description: "AI analyzes the full conversation, identifies topics, extracts key decisions, and generates a structured summary automatically.",
    icon: FileCheck,
  },
  {
    num: "04",
    title: "Action Items Created",
    subtitle: "Tasks assigned automatically",
    description: "Every commitment, deadline, and follow-up is extracted and organized. Assign owners and due dates effortlessly.",
    icon: ListTodo,
  },
  {
    num: "05",
    title: "Saved into Company Brain",
    subtitle: "Knowledge lives forever",
    description: "Everything merges into your Company Brain — a living knowledge graph connecting meetings, decisions, people, and projects.",
    icon: Database,
  },
];

function StepCard({
  step,
  index,
  isActive,
  hasBeenActivated,
  onInView,
}: {
  step: (typeof STEPS)[0];
  index: number;
  isActive: boolean;
  hasBeenActivated: boolean;
  onInView: () => void;
}) {
  const Icon = step.icon;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onInView();
        }
      },
      { threshold: 0.4, rootMargin: "-80px 0px -80px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [onInView]);

  return (
    <motion.div
      ref={ref}
      className="flex items-start gap-6 lg:gap-10"
      initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-120px" }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Step Number / Icon */}
      <div className="flex flex-col items-center shrink-0">
        <motion.div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 ${
            isActive
              ? "bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30 scale-110"
              : hasBeenActivated
                ? "bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200/60"
                : "bg-gray-50 border border-gray-200/60"
          }`}
          animate={{ scale: isActive ? 1.1 : 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <Icon
            size={22}
            className={`transition-colors duration-500 ${
              isActive ? "text-white" : hasBeenActivated ? "text-blue-500" : "text-gray-400"
            }`}
          />
        </motion.div>
        {index < STEPS.length - 1 && (
          <div className="w-[2px] h-16 sm:h-20 lg:h-24 mt-3 relative overflow-hidden rounded-full bg-gray-100">
            <motion.div
              className="absolute top-0 left-0 w-full bg-gradient-to-b from-blue-400 to-blue-500 rounded-full"
              initial={{ height: "0%" }}
              whileInView={{ height: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.15 + 0.3, ease: "easeOut" }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-2 pb-12 lg:pb-16">
        <div className="flex items-center gap-3 mb-2">
          <span
            className={`text-[11px] font-semibold tracking-wider uppercase transition-colors duration-500 ${
              isActive ? "text-blue-500" : "text-gray-300"
            }`}
          >
            Step {step.num}
          </span>
          {isActive && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-semibold"
            >
              Now Playing
            </motion.span>
          )}
        </div>
        <motion.h3
          className={`text-[22px] sm:text-[28px] lg:text-[32px] font-bold tracking-[-0.025em] transition-colors duration-500 ${
            isActive
              ? "text-gray-900"
              : hasBeenActivated
                ? "text-gray-700"
                : "text-gray-400"
          }`}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: index * 0.1 + 0.1 }}
        >
          {step.title}
        </motion.h3>
        <p className="text-[14px] font-medium text-gray-400 mt-1 mb-3">{step.subtitle}</p>
        <motion.p
          className={`text-[15px] sm:text-[16px] leading-[1.7] max-w-lg transition-colors duration-500 ${
            isActive ? "text-gray-600" : "text-gray-400"
          }`}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: index * 0.1 + 0.2 }}
        >
          {step.description}
        </motion.p>
      </div>
    </motion.div>
  );
}

export default function StorySection() {
  const [activeStep, setActiveStep] = useState(0);
  const [activatedSteps, setActivatedSteps] = useState<Set<number>>(new Set([0]));

  const handleStepInView = useCallback((index: number) => {
    setActiveStep(index);
    setActivatedSteps((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  return (
    <section
      className="relative py-24 lg:py-32 px-6 lg:px-12 bg-[#FAFAFA] overflow-hidden"
      id="how-it-works"
    >
      {/* Cinematic background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="section-glow-1" />
        <div className="section-glow-2" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: "radial-gradient(rgba(0,0,0,0.06) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        {/* Top-left cinematic light */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] opacity-30"
          style={{
            background: "radial-gradient(ellipse at 20% 15%, rgba(255,255,255,0.5) 0%, rgba(191,219,254,0.15) 30%, transparent 60%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20 lg:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-sm mb-6"
          >
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse-soft" />
            <span className="text-[12px] font-semibold text-blue-600 tracking-wide">
              Interactive Demo
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-[36px] sm:text-[44px] lg:text-[52px] font-bold tracking-[-0.035em] leading-[1.1] text-gray-900"
          >
            From conversation to
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 bg-clip-text text-transparent">
              permanent knowledge.
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-[16px] text-gray-500 max-w-xl mx-auto"
          >
            Scroll through the transformation. Each step reveals how MeetingOS turns
            raw conversations into structured company memory.
          </motion.p>
        </div>

        {/* Steps Timeline */}
        <div className="max-w-3xl mx-auto">
          {STEPS.map((step, index) => (
            <StepCard
              key={step.num}
              step={step}
              index={index}
              isActive={activeStep === index}
              hasBeenActivated={activatedSteps.has(index)}
              onInView={() => handleStepInView(index)}
            />
          ))}
        </div>

        {/* Step Progress */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex justify-center mt-8"
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-sm">
            <span className="text-[12px] text-gray-400 font-medium">
              Step {activeStep + 1} of {STEPS.length}
            </span>
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-500 ${
                    i === activeStep
                      ? "w-6 bg-blue-500"
                      : activatedSteps.has(i)
                        ? "w-2 bg-blue-200"
                        : "w-2 bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
