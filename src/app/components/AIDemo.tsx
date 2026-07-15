"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";
import { Send, Brain, Sparkles, ArrowRight, CheckCircle2, Clock, List } from "lucide-react";

const DEMO_QUESTION = "What decisions did we make with Nike last month?";

const AI_RESPONSE_STEPS = [
  {
    delay: 800,
    content: (
      <div className="space-y-3">
        <p className="text-[15px] leading-relaxed text-gray-700">
          Based on your meetings with <span className="font-semibold text-gray-900">Nike</span> this quarter, here are the key decisions and action items:
        </p>
      </div>
    ),
  },
  {
    delay: 2200,
    content: (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2 p-4 rounded-xl bg-emerald-50/80 border border-emerald-100/80"
      >
        <div className="flex items-center gap-2 text-emerald-700 font-semibold text-[13px] mb-2">
          <CheckCircle2 size={14} />
          Key Decisions (8)
        </div>
        {[
          "Approved Q3 marketing budget: $2.4M",
          "Finalized partnership terms for EMEA expansion",
          "Selected Salesforce as preferred CRM integration",
          "Confirmed product launch date: September 15",
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.12 }}
            className="flex items-start gap-2 text-[13px] text-gray-600"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
            {item}
          </motion.div>
        ))}
      </motion.div>
    ),
  },
  {
    delay: 4200,
    content: (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2 p-4 rounded-xl bg-blue-50/80 border border-blue-100/80 mt-3"
      >
        <div className="flex items-center gap-2 text-blue-700 font-semibold text-[13px] mb-2">
          <List size={14} />
          Open Action Items (12)
        </div>
        {[
          "Draft partnership agreement → Sarah · Due Aug 20",
          "Prepare EMEA market analysis → James · Due Aug 25",
          "Finalize product requirements → Michael · Due Sep 1",
          "Schedule Q4 planning session → Emily · Due Aug 15",
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-3 text-[13px] text-gray-600 py-1.5 px-3 rounded-lg bg-white/60"
          >
            <div className="w-4 h-4 rounded border border-blue-300 shrink-0" />
            <span className="flex-1">{item}</span>
          </motion.div>
        ))}
      </motion.div>
    ),
  },
  {
    delay: 6200,
    content: (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-3"
      >
        {/* Meeting references */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/80 border border-gray-200/80 backdrop-blur-sm">
          <div className="flex -space-x-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-[10px] text-white font-bold"
              >
                {["SM", "JL", "MK"][i]}
              </div>
            ))}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-gray-900">Meeting References</p>
            <p className="text-[11px] text-gray-500 truncate">
              Q3 Strategy Review · Partnership Discussion · Product Roadmap
            </p>
          </div>
          <button className="text-[12px] text-blue-600 font-semibold hover:text-blue-700 shrink-0 flex items-center gap-1">
            View All
            <ArrowRight size={12} />
          </button>
        </div>

        {/* Timestamp */}
        <p className="text-[12px] text-gray-400 mt-3 flex items-center gap-2">
          <Clock size={12} />
          Answer generated from 3 meetings · Last updated 2 hours ago
        </p>

        {/* Follow-up chips */}
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            "What was the budget breakdown?",
            "Who are the key stakeholders?",
            "Show me the timeline",
          ].map((chip, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200/80 text-[12px] text-gray-500 hover:text-gray-700 font-medium transition-all border border-gray-200/50 hover:border-gray-300/50"
            >
              {chip}
            </motion.button>
          ))}
        </div>
      </motion.div>
    ),
  },
];

export default function AIDemo() {
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [hasClicked, setHasClicked] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = useCallback(() => {
    const question = inputValue.trim() || DEMO_QUESTION;
    setInputValue("");
    setHasClicked(true);
    setIsTyping(true);
    setShowResponse(false);
    setVisibleSteps(0);

    setTimeout(() => {
      setIsTyping(false);
      setShowResponse(true);
    }, 1200);
  }, [inputValue]);

  useEffect(() => {
    if (!showResponse) return;
    if (visibleSteps >= AI_RESPONSE_STEPS.length) return;

    const timer = setTimeout(() => {
      setVisibleSteps((prev) => prev + 1);
    }, AI_RESPONSE_STEPS[visibleSteps].delay);

    return () => clearTimeout(timer);
  }, [showResponse, visibleSteps]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleSteps, isTyping]);

  return (
    <section className="relative py-24 lg:py-32 px-6 lg:px-12 bg-white overflow-hidden">
      {/* Cinematic background */}
      <div className="absolute inset-0 pointer-events-none">
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

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-sm mb-6"
          >
            <Sparkles size={14} className="text-blue-500" />
            <span className="text-[12px] font-semibold text-blue-600 tracking-wide">
              AI Assistant
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-[36px] sm:text-[44px] lg:text-[52px] font-bold tracking-[-0.035em] leading-[1.1] text-gray-900"
          >
            Ask Your Company
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-violet-500 to-blue-500 bg-clip-text text-transparent">
              Anything.
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-[16px] text-gray-500 max-w-xl mx-auto"
          >
            Natural language access to your entire company memory. Ask questions,
            get answers with citations, meeting links, and action items.
          </motion.p>
        </div>

        {/* Chat Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="glass-strong rounded-[28px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.06)]"
        >
          {/* Chat Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100/80">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shadow-md">
              <Brain size={16} className="text-white" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-gray-900">MeetingOS AI</p>
              <p className="text-[11px] text-gray-400">Connected to Company Brain</p>
            </div>
            <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100/80">
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-[11px] font-medium text-emerald-600">Active</span>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="p-6 sm:p-8 min-h-[420px] max-h-[600px] overflow-y-auto">
            {/* Default question suggestion */}
            {!hasClicked && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full text-center py-12"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-violet-50 border border-blue-100/60 flex items-center justify-center mb-5">
                  <Sparkles size={24} className="text-blue-500" />
                </div>
                <p className="text-[15px] text-gray-500 max-w-sm leading-relaxed">
                  Try asking:{" "}
                  <button
                    onClick={() => setInputValue(DEMO_QUESTION)}
                    className="text-blue-600 font-semibold hover:text-blue-700 transition-colors underline decoration-blue-200 hover:decoration-blue-400 underline-offset-2"
                  >
                    &ldquo;What decisions did we make with Nike last month?&rdquo;
                  </button>
                </p>
              </motion.div>
            )}

            {/* Question bubble */}
            {hasClicked && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-end mb-6"
              >
                <div className="max-w-[80%] bg-gray-900 text-white rounded-[20px] rounded-tr-md px-5 py-3.5 shadow-lg">
                  <p className="text-[14px] leading-relaxed">
                    {DEMO_QUESTION}
                  </p>
                </div>
              </motion.div>
            )}

            {/* AI Typing indicator */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start gap-3 mb-6"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shrink-0 shadow-md">
                  <Brain size={14} className="text-white" />
                </div>
                <div className="flex items-center gap-1.5 px-4 py-3.5 rounded-[18px] bg-gray-100 shadow-sm">
                  <motion.div
                    className="w-2 h-2 rounded-full bg-gray-400"
                    animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    className="w-2 h-2 rounded-full bg-gray-400"
                    animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: 0.15 }}
                  />
                  <motion.div
                    className="w-2 h-2 rounded-full bg-gray-400"
                    animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: 0.3 }}
                  />
                </div>
              </motion.div>
            )}

            {/* AI Response */}
            {showResponse && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shrink-0 shadow-md">
                  <Brain size={14} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  {AI_RESPONSE_STEPS.slice(0, visibleSteps).map((step, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      {step.content}
                    </motion.div>
                  ))}
                  {visibleSteps < AI_RESPONSE_STEPS.length && (
                    <div className="flex items-center gap-1.5 mt-3 ml-1">
                      <motion.div
                        className="w-1.5 h-1.5 rounded-full bg-blue-400"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                      <motion.div
                        className="w-1.5 h-1.5 rounded-full bg-blue-400"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div
                        className="w-1.5 h-1.5 rounded-full bg-blue-400"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="px-6 pb-6 sm:px-8 sm:pb-8">
            <div className="flex items-center gap-3 p-1.5 rounded-2xl border border-gray-200/80 bg-white/90 backdrop-blur-sm focus-within:border-blue-300 focus-within:shadow-[0_0_0_3px_rgba(59,130,246,0.08)] transition-all duration-200">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask anything about your meetings..."
                className="flex-1 bg-transparent border-none outline-none text-[14px] text-gray-900 placeholder-gray-400 px-4 py-2.5"
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-md shadow-gray-900/10"
              >
                <Send size={15} />
              </button>
            </div>
            <p className="text-[11px] text-gray-400 mt-3 text-center">
              AI may produce inaccurate information. Verify important decisions with meeting recordings.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
