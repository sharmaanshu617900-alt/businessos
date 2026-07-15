"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="relative py-24 lg:py-32 px-6 lg:px-12 bg-white overflow-hidden" id="pricing">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(0,0,0,0.1) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        {/* Soft gradients */}
        <div className="absolute top-1/2 left-1/3 w-[600px] h-[600px] bg-gradient-to-br from-blue-100/40 to-violet-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-50/50 rounded-full blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative rounded-3xl bg-gradient-to-br from-blue-50 via-white to-violet-50 border border-blue-100/50 p-10 sm:p-14 lg:p-20 text-center overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.04)]"
        >
          {/* Decorative elements */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-200/20 rounded-full blur-3xl" />
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(0,0,0,0.06) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
          </div>

          {/* Floating elements */}
          <motion.div
            className="absolute top-8 left-8 w-16 h-16 rounded-2xl bg-blue-100/30 border border-blue-200/30"
            animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-8 right-8 w-12 h-12 rounded-xl bg-violet-100/30 border border-violet-200/30"
            animate={{ y: [0, 8, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative z-10">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100/60 border border-blue-200/60 mb-8"
            >
              <Sparkles size={14} className="text-blue-500" />
              <span className="text-[12px] font-semibold text-blue-600 tracking-wide">
                Start Building Your Company Brain Today
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-[36px] sm:text-[48px] lg:text-[64px] font-bold tracking-[-0.03em] leading-[1.05] text-gray-900 mb-6"
            >
              Never Forget
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-violet-500 bg-clip-text text-transparent">
                Another Meeting.
              </span>
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-[16px] sm:text-[18px] text-gray-500 max-w-xl mx-auto mb-10"
            >
              Start free. No credit card required.
              <br />
              Set up in under 5 minutes. Transform your meetings into company memory.
            </motion.p>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
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
                href="#"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl border border-gray-200 text-gray-600 font-medium text-[15px] hover:bg-gray-50 hover:border-gray-300 hover:shadow-lg transition-all duration-300"
              >
                Book a Demo
              </a>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-center gap-6 sm:gap-10 mt-10 pt-8 border-t border-gray-200/60"
            >
              {[
                { label: "Meetings processed", value: "50K+" },
                { label: "Companies trust us", value: "2,400+" },
                { label: "Knowledge saved", value: "1M+" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-[20px] font-bold text-gray-900">{stat.value}</p>
                  <p className="text-[11px] text-gray-400 font-medium">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
