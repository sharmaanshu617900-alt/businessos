"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  ArrowUpRight,
  Sparkles,
  FileText,
  CheckCircle2,
  Building2,
  Calendar,
} from "lucide-react";

const EXAMPLES = [
  "What did Nike approve about pricing?",
  "Show pricing discussions from last quarter",
  "What were Acme's objections last sprint?",
  "Find all decisions tagged Pricing",
  "When did we hire the design team?",
  "Show every decision Linear approved",
];

const RESULTS = [
  {
    type: "decision",
    title: "Move to tier-based pricing",
    client: "Nike",
    source: "Q3 Brand Direction · 2h ago",
    excerpt:
      "Approved by Maya. We'll roll out three tiers — Starter, Studio and Partner. Drops the legacy 'Max' plan.",
    confidence: 96,
  },
  {
    type: "meeting",
    title: "Pricing strategy review",
    client: "Nike",
    source: "Yesterday",
    excerpt:
      "Discussion around pricing tiers, customer segmentation and competitive positioning. Three decisions captured.",
    confidence: 92,
  },
  {
    type: "decision",
    title: "Pause enterprise onboarding flow",
    client: "Acme",
    source: "Today",
    excerpt:
      "We will pause new enterprise onboarding until Q4 to focus on the self-serve funnel. Owner: Jordan.",
    confidence: 88,
  },
  {
    type: "sop",
    title: "Q3 pricing review process",
    client: "Internal",
    source: "SOP Library · Generated",
    excerpt:
      "Generated from 14 pricing-related meetings. Lists the 6-step review and approval flow used across clients.",
    confidence: 84,
  },
];

export default function BrainPage() {
  const [query, setQuery] = useState("");

  return (
    <div className="min-h-screen px-6 lg:px-12 pt-12 pb-20 max-w-[1200px] mx-auto bg-graphite-0">
      {/* Header — search as the hero */}
      <header className="mb-16 max-w-3xl">
        <p className="eyebrow text-ink-faint">Search</p>
        <h1 className="mt-3 heading-display text-[48px] lg:text-[64px] text-white leading-[1.0]">
          Agency
          <span style={{ fontStyle: "italic" }} className="text-accent"> Brain.</span>
        </h1>
        <p className="mt-6 text-[15px] text-ink-tertiary leading-relaxed max-w-xl">
          Search every meeting, decision, SOP and client conversation your
          agency ever produced. Forever.
        </p>
      </header>

      {/* Search bar — large editorial input */}
      <div className="relative mb-12">
        <div className="surface-elevated rounded-2xl p-1.5">
          <div className="flex items-center px-5 py-5 gap-4">
            <Search size={20} className="text-ink-tertiary" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything your agency ever decided…"
              className="flex-1 bg-transparent outline-none text-[18px] lg:text-[22px] text-white placeholder-ink-faint font-display tracking-tight"
              style={{ fontStyle: "italic" }}
            />
            <kbd className="px-2 py-1 text-[10px] font-mono bg-graphite-300 rounded text-ink-tertiary">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Examples */}
      {!query && (
        <div className="mb-16">
          <p className="eyebrow text-ink-faint mb-4">Try asking</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => setQuery(ex)}
                className="text-[13px] text-ink-secondary hover:text-white border border-hairline-2 hover:border-hairline px-4 py-2 rounded-full transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <p className="eyebrow text-ink-faint">
            {query ? `Results for "${query}"` : "Recent knowledge"}
          </p>
          <p className="text-[12px] text-ink-tertiary">{RESULTS.length} sources matched</p>
        </div>

        <div className="space-y-3">
          {RESULTS.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.6 }}
              className="surface-1 rounded-2xl p-6 lg:p-8 card-lift cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="eyebrow text-accent inline-flex items-center gap-1">
                      {r.type === "decision" && <CheckCircle2 size={10} />}
                      {r.type === "meeting" && <Calendar size={10} />}
                      {r.type === "sop" && <FileText size={10} />}
                      {r.type}
                    </span>
                    <span className="text-[10px] text-ink-faint">·</span>
                    <span className="eyebrow text-ink-faint inline-flex items-center gap-1">
                      <Building2 size={10} />
                      {r.client}
                    </span>
                    <span className="text-[10px] text-ink-faint">·</span>
                    <span className="text-[10px] eyebrow text-ink-faint">{r.source}</span>
                  </div>

                  <h3 className="text-[20px] lg:text-[22px] font-display text-white leading-snug tracking-tight group-hover:text-accent transition-colors">
                    {r.title}
                  </h3>
                  <p className="mt-3 text-[14px] text-ink-secondary leading-relaxed max-w-3xl">
                    {r.excerpt}
                  </p>
                </div>

                <div className="hidden md:flex flex-col items-end gap-2 shrink-0">
                  <div className="flex items-center gap-1 text-[10px] eyebrow text-ink-faint">
                    <Sparkles size={10} className="text-accent" />
                    {r.confidence}% match
                  </div>
                  <ArrowUpRight size={16} className="text-ink-tertiary group-hover:text-white transition-colors" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}