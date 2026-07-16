"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  Plus,
  Filter,
  Clock,
  User,
  Tag,
} from "lucide-react";

const TIMELINE = [
  {
    day: "Today",
    items: [
      { title: "Approve Q3 pricing tier changes",  client: "Nike",   tag: "Pricing", status: "Approved", who: "Maya R.",   time: "2h ago" },
      { title: "Adopt Linear as primary product OS", client: "Internal", tag: "Tooling", status: "Approved", who: "Ananya P.", time: "4h ago" },
      { title: "Pause enterprise onboarding flow",  client: "Acme",   tag: "Product", status: "Pending",  who: "Jordan K.", time: "6h ago" },
    ],
  },
  {
    day: "Yesterday",
    items: [
      { title: "Brand palette locked — graphite + soft purple", client: "Nike", tag: "Design", status: "Approved", who: "Priya M.", time: "Yesterday" },
      { title: "Hire 2 engineers in Q3",                       client: "Linear", tag: "Hiring", status: "Approved", who: "Ananya P.", time: "Yesterday" },
      { title: "Drop 'Max' tier from public pricing",          client: "Acme",   tag: "Pricing", status: "Pending",  who: "Maya R.",   time: "Yesterday" },
    ],
  },
  {
    day: "This week",
    items: [
      { title: "Migrate transcripts from Otter to AgencyOS",    client: "Internal", tag: "Ops",    status: "Approved", who: "Jordan K.", time: "Mon" },
      { title: "Move SOP reviews to Notion two-way sync",       client: "Internal", tag: "Tooling", status: "Approved", who: "Ananya P.", time: "Mon" },
    ],
  },
];

export default function DecisionsPage() {
  return (
    <div className="min-h-screen p-6 lg:p-12 max-w-[1200px] mx-auto">
      {/* Header */}
      <header className="mb-16">
        <p className="eyebrow text-ink-on-light-faint">Knowledge</p>
        <div className="flex items-end justify-between mt-3 flex-wrap gap-4">
          <h1 className="heading-display text-[56px] lg:text-[80px] text-ink-on-light leading-[1.0]">
            Every decision,
            <br />
            <span style={{ fontStyle: "italic" }} className="text-ink-on-light-secondary">forever remembered.</span>
          </h1>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 border border-border-light text-ink-on-light px-4 py-2 rounded-full text-[13px] hover:bg-surface-light-2 transition-colors">
              <Filter size={13} className="text-ink-on-light-tertiary" />
              Filter
            </button>
            <button className="inline-flex items-center gap-2 bg-[#0071e3] text-white px-4 py-2 rounded-full text-[13px] font-medium hover:bg-[#0062c9] transition-colors">
              <Plus size={13} />
              Capture
            </button>
          </div>
        </div>
      </header>

      {/* Stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px mb-16 rounded-2xl overflow-hidden border border-border-light bg-white">
        {[
          { k: "247", l: "Decisions this month" },
          { k: "12",  l: "Clients tracked" },
          { k: "98%", l: "Approval rate" },
          { k: "4.2s", l: "Avg. search time" },
        ].map((s, i) => (
          <div key={s.l} className={`p-6 ${i < 3 ? 'border-r border-border-light' : ''}`}>
            <p className="heading-display text-[44px] lg:text-[56px] text-ink-on-light leading-[0.9]">{s.k}</p>
            <p className="mt-2 text-[12px] text-ink-on-light-tertiary">{s.l}</p>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-3">
          <p className="eyebrow text-ink-on-light-faint sticky top-8">Timeline</p>
          <div className="mt-4 space-y-4">
            {TIMELINE.map((g) => (
              <p key={g.day} className="text-[14px] font-display text-ink-on-light">
                {g.day}
              </p>
            ))}
          </div>
        </div>

        <div className="lg:col-span-9 relative">
          {/* Vertical rail */}
          <div
            className="absolute left-2 top-2 bottom-2 w-px"
            style={{
              background:
                "linear-gradient(to bottom, transparent, rgba(0,0,0,0.08) 5%, rgba(0,0,0,0.08) 95%, transparent)",
            }}
          />

          {TIMELINE.map((group, gi) => (
            <div key={group.day} className="mb-12 last:mb-0">
              <h2 className="text-[20px] font-display text-ink-on-light mb-6 pl-10">{group.day}</h2>
              <div className="space-y-3">
                {group.items.map((d, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06, duration: 0.6 }}
                    className="relative pl-10 group cursor-pointer"
                  >
                    {/* Timeline dot */}
                    <div
                      className="absolute left-0 top-6 w-4 h-4 rounded-full bg-white border-2"
                      style={{
                        borderColor:
                          d.status === "Approved" ? "#8b5cf6" : "rgba(0,0,0,0.2)",
                      }}
                    />

                    <div className="bg-white rounded-xl p-5 shadow-sm border border-border-light-2 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="eyebrow text-[#8b5cf6]">{d.client}</span>
                          <span className="text-[10px] text-ink-on-light-faint">·</span>
                          <span className="eyebrow text-ink-on-light-faint inline-flex items-center gap-1">
                            <Tag size={9} />
                            {d.tag}
                          </span>
                        </div>
                        <span
                          className="text-[10px] eyebrow tracking-wider uppercase"
                          style={{
                            color: d.status === "Approved" ? "#8b5cf6" : "#d97706",
                          }}
                        >
                          {d.status}
                        </span>
                      </div>

                      <h3 className="text-[16px] lg:text-[17px] font-medium text-ink-on-light leading-snug group-hover:text-[#8b5cf6] transition-colors">
                        {d.title}
                      </h3>

                      <div className="flex items-center gap-4 mt-4 text-[11.5px] text-ink-on-light-tertiary">
                        <span className="flex items-center gap-1.5">
                          <User size={11} />
                          {d.who}
                        </span>
                        <span className="text-ink-on-light-faint">·</span>
                        <span className="flex items-center gap-1.5">
                          <Clock size={11} />
                          {d.time}
                        </span>
                        <span className="text-ink-on-light-faint">·</span>
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 size={11} />
                          Source linked
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}