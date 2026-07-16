"use client";

import { motion } from "framer-motion";
import {
  Plus,
  ArrowUpRight,
  FileText,
  Calendar,
  Users,
  Sparkles,
} from "lucide-react";

const SOPS = [
  {
    title: "How we onboard a new client",
    category: "Client",
    clients: ["All clients"],
    updated: "2 days ago",
    linked: 3,
    generated: true,
  },
  {
    title: "Q3 pricing review process",
    category: "Pricing",
    clients: ["Nike", "Linear", "Acme"],
    updated: "Last week",
    linked: 7,
    generated: true,
  },
  {
    title: "Brand review — visual guidelines",
    category: "Design",
    clients: ["Nike"],
    updated: "Today",
    linked: 12,
    generated: false,
  },
  {
    title: "Weekly client sync — agenda template",
    category: "Process",
    clients: ["All clients"],
    updated: "3 days ago",
    linked: 24,
    generated: true,
  },
  {
    title: "Hiring loop — engineering",
    category: "Hiring",
    clients: ["Internal"],
    updated: "Last month",
    linked: 0,
    generated: false,
  },
  {
    title: "Sprint planning rituals",
    category: "Engineering",
    clients: ["Internal"],
    updated: "Yesterday",
    linked: 18,
    generated: true,
  },
];

const CATEGORIES = ["All", "Client", "Pricing", "Design", "Process", "Hiring", "Engineering"];

export default function SOPsPage() {
  return (
    <div className="min-h-screen p-6 lg:p-12 max-w-[1300px] mx-auto">
      <header className="mb-16">
        <p className="eyebrow text-ink-on-light-faint">Knowledge</p>
        <div className="flex items-end justify-between mt-3 flex-wrap gap-6">
          <h1 className="heading-display text-[56px] lg:text-[80px] text-ink-on-light leading-[1.0]">
            The living
            <br />
            <span style={{ fontStyle: "italic" }} className="text-ink-on-light-secondary">company playbook.</span>
          </h1>
          <button className="inline-flex items-center gap-2 bg-[#0071e3] text-white px-4 py-2 rounded-full text-[13px] font-medium hover:bg-[#0062c9] transition-colors">
            <Plus size={13} />
            New SOP
          </button>
        </div>
        <p className="mt-6 text-[15px] text-ink-on-light-tertiary max-w-xl leading-relaxed">
          Generated from real meetings. Linked to real clients. Always
          up-to-date. The way your agency actually works, written down.
        </p>
      </header>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-12 overflow-x-auto pb-2">
        {CATEGORIES.map((c, i) => (
          <button
            key={c}
            className={`px-4 py-2 rounded-full text-[12.5px] whitespace-nowrap transition-colors ${
              i === 0
                ? "bg-[#1d1d1f] text-white font-medium"
                : "border border-border-light text-ink-on-light-secondary hover:text-ink-on-light hover:bg-surface-light-2"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* SOP grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SOPS.map((sop, i) => (
          <motion.article
            key={sop.title}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.6 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-border-light-2 cursor-pointer flex flex-col hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-8">
              <div className="w-10 h-10 rounded-xl bg-surface-light-2 flex items-center justify-center border border-border-light-2">
                <FileText size={15} className="text-ink-on-light-secondary" strokeWidth={1.5} />
              </div>
              <div className="flex items-center gap-2">
                {sop.generated && (
                  <span className="inline-flex items-center gap-1 text-[10px] eyebrow text-[#8b5cf6]">
                    <Sparkles size={10} />
                    Auto
                  </span>
                )}
                <ArrowUpRight size={13} className="text-ink-on-light-faint" />
              </div>
            </div>

            <h3 className="text-[18px] font-display text-ink-on-light leading-snug tracking-tight">
              {sop.title}
            </h3>

            <div className="mt-auto pt-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="eyebrow text-[#8b5cf6]">{sop.category}</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-ink-on-light-tertiary">
                <span className="flex items-center gap-1">
                  <Users size={10} />
                  {sop.clients.join(", ")}
                </span>
                <span className="text-ink-on-light-faint">·</span>
                <span className="flex items-center gap-1">
                  <Calendar size={10} />
                  {sop.updated}
                </span>
                {sop.linked > 0 && (
                  <>
                    <span className="text-ink-on-light-faint">·</span>
                    <span>{sop.linked} linked</span>
                  </>
                )}
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}