"use client";

import { motion } from "framer-motion";
import { Video, FileText, Brain, Database, Search, Users } from "lucide-react";

const FEATURES = [
  {
    icon: Video,
    title: "Meeting Recording",
    description: "Upload recordings from Zoom, Google Meet, Teams, or any source. We handle the rest.",
  },
  {
    icon: FileText,
    title: "AI Transcription",
    description: "Whisper-accurate transcription with speaker detection, timestamps, and noise filtering.",
  },
  {
    icon: Brain,
    title: "Intelligent Analysis",
    description: "AI extracts decisions, action items, risks, questions, and key topics automatically.",
  },
  {
    icon: Database,
    title: "Knowledge Base",
    description: "Everything connects to a searchable knowledge graph that grows smarter over time.",
  },
  {
    icon: Search,
    title: "Natural Language Search",
    description: "Ask questions in plain English. Get instant answers sourced from your meetings.",
  },
  {
    icon: Users,
    title: "Client Intelligence",
    description: "Track every client interaction, decision, and commitment across your entire team.",
  },
];

export default function PipelineSection() {
  return (
    <section className="py-24 lg:py-32 px-6 lg:px-12 bg-white" id="features">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[13px] font-semibold tracking-wider uppercase text-violet-600 mb-4"
          >
            Features
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-[36px] sm:text-[48px] lg:text-[56px] font-bold tracking-[-0.03em] leading-[1.1] text-gray-900"
          >
            Everything you need to
            <br />
            <span className="bg-gradient-to-r from-violet-600 to-blue-500 bg-clip-text text-transparent">capture agency intelligence.</span>
          </motion.h2>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="group p-8 rounded-2xl border border-gray-100 bg-white hover:bg-gray-50 hover:border-gray-200 transition-all duration-300 hover:shadow-lg hover:shadow-gray-100"
              >
                <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center mb-5 group-hover:bg-violet-200 transition-colors">
                  <Icon size={22} className="text-violet-600" strokeWidth={1.5} />
                </div>
                <h3 className="text-[18px] font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-[15px] leading-[1.6] text-gray-500">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
