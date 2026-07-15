"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  Bell,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  Circle,
  Video,
  Building2,
  Calendar,
  Clock,
  Upload,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const RECENT_MEETINGS = [
  { client: "Nike",    title: "Q3 Brand Direction", time: "2h ago", duration: "42 min", decisions: 4 },
  { client: "Acme Co", title: "Sprint Planning",     time: "Today",  duration: "1h 12m", decisions: 7 },
  { client: "Linear",  title: "Pricing Strategy",    time: "Yesterday", duration: "38 min", decisions: 3 },
];

const DECISIONS = [
  { title: "Move to tier-based pricing", source: "Nike · Q3 Brand", tag: "Pricing", date: "2h ago" },
  { title: "Approved design system v3",   source: "Acme · Sprint",  tag: "Design",  date: "Today" },
  { title: "Hire two engineers in Q3",    source: "Linear · Pricing", tag: "Hiring", date: "Yesterday" },
];

const ACTION_ITEMS = [
  { title: "Update pricing page on website",   who: "Ananya",   due: "Tomorrow", done: false },
  { title: "Send revised contract to Acme",    who: "Jordan",   due: "Friday",   done: false },
  { title: "Share Q3 hiring brief with team",  who: "Priya",    due: "Today",    done: true  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);

  const firstName =
    (user?.user_metadata?.name as string)?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "there";

  return (
    <div className="min-h-screen p-6 lg:p-10 max-w-[1400px] mx-auto">
      {/* Top bar */}
      <header className="flex items-center justify-between mb-10">
        <div>
          <p className="eyebrow text-[#a1a1a6]">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
          <h1 className="mt-2 heading-display text-[36px] lg:text-[44px] text-[#1d1d1f] leading-[1.0]">
            Good morning, <span style={{ fontStyle: "italic" }} className="text-[#86868b]">{firstName}</span>.
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/upload"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0071e3] text-white text-[13px] font-medium hover:bg-[#0062c9] transition-colors shadow-sm"
          >
            <Upload size={14} />
            Upload Meeting
          </Link>
        </div>
      </header>

      {/* ============================================
          MAGAZINE GRID — MeetingOS style
          ============================================ */}
      <div className="grid grid-cols-12 gap-4 auto-rows-[minmax(120px,auto)]">

        {/* HERO — Featured stat */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="col-span-12 lg:col-span-8 row-span-2 bg-white rounded-2xl p-8 lg:p-10 relative overflow-hidden card-lift border border-[#e5e5e7]"
        >
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="eyebrow text-[#a1a1a6]">This week</p>
              <h2 className="mt-2 heading-display text-[32px] lg:text-[40px] text-[#1d1d1f] leading-[1.0]">
                Your team captured
              </h2>
            </div>
            <span className="eyebrow text-[#0071e3]">↑ 18%</span>
          </div>

          <div className="flex items-end gap-12">
            <div>
              <p className="heading-display text-[100px] lg:text-[140px] text-[#1d1d1f] leading-[0.85] tracking-[-0.04em]">
                247
              </p>
              <p className="text-[13px] text-[#86868b] mt-2">
                decisions this week · across 12 clients
              </p>
            </div>
            <div className="flex-1 hidden lg:block pb-4">
              <svg viewBox="0 0 200 60" className="w-full h-16 opacity-60">
                <polyline
                  points="0,40 20,35 40,42 60,30 80,28 100,20 120,25 140,15 160,18 180,10 200,8"
                  fill="none"
                  stroke="#0071e3"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="200" cy="8" r="2.5" fill="#0071e3" />
              </svg>
              <div className="flex items-center justify-between mt-2 text-[10px] eyebrow text-[#a1a1a6]">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CLIENTS */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="col-span-6 lg:col-span-4 bg-white rounded-2xl p-6 card-lift border border-[#e5e5e7]"
        >
          <p className="eyebrow text-[#a1a1a6]">Clients</p>
          <p className="heading-display text-[56px] text-[#1d1d1f] leading-[0.9] mt-3">12</p>
          <div className="flex items-center gap-2 mt-4 text-[12px] text-[#86868b]">
            <Building2 size={12} />
            <span>3 new this month</span>
          </div>
        </motion.div>

        {/* ACTION ITEMS */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="col-span-6 lg:col-span-4 bg-white rounded-2xl p-6 card-lift border border-[#e5e5e7]"
        >
          <p className="eyebrow text-[#a1a1a6]">Pending actions</p>
          <p className="heading-display text-[56px] text-[#0071e3] leading-[0.9] mt-3">14</p>
          <div className="flex items-center gap-2 mt-4 text-[12px] text-[#86868b]">
            <Clock size={12} />
            <span>5 due this week</span>
          </div>
        </motion.div>

        {/* SOPs stat */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="col-span-6 lg:col-span-4 bg-white rounded-2xl p-6 card-lift border border-[#e5e5e7]"
        >
          <p className="eyebrow text-[#a1a1a6]">SOPs</p>
          <p className="heading-display text-[56px] text-[#1d1d1f] leading-[0.9] mt-3">86</p>
          <div className="flex items-center gap-2 mt-4 text-[12px] text-[#86868b]">
            <span>↑ 4 generated this week</span>
          </div>
        </motion.div>

        {/* RECENT MEETINGS */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="col-span-12 lg:col-span-7 bg-white rounded-2xl p-6 lg:p-8 card-lift border border-[#e5e5e7]"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="eyebrow text-[#a1a1a6]">Recent</p>
              <h3 className="mt-1 text-[18px] font-display text-[#1d1d1f] tracking-tight">Meetings</h3>
            </div>
            <Link href="/dashboard/meetings" className="text-[12px] text-[#86868b] hover:text-[#1d1d1f] transition-colors flex items-center gap-1">
              All meetings <ArrowUpRight size={11} />
            </Link>
          </div>
          <div className="space-y-3">
            {RECENT_MEETINGS.map((m, i) => (
              <div
                key={i}
                className="group flex items-center gap-4 p-4 -mx-2 rounded-xl hover:bg-[#f5f5f7] transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-[#f5f5f7] flex items-center justify-center border border-[#e5e5e7]">
                  <Video size={14} className="text-[#86868b]" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="eyebrow text-[#0071e3]">{m.client}</span>
                    <span className="text-[10px] text-[#c7c7cc]">·</span>
                    <span className="text-[10px] eyebrow text-[#a1a1a6]">{m.time}</span>
                  </div>
                  <p className="text-[14px] font-medium text-[#1d1d1f] truncate">{m.title}</p>
                </div>
                <div className="hidden sm:flex items-center gap-4 text-[11.5px] text-[#86868b]">
                  <span className="flex items-center gap-1">
                    <Clock size={11} />{m.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 size={11} />{m.decisions} decisions
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* DECISIONS */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="col-span-12 lg:col-span-5 bg-white rounded-2xl p-6 lg:p-8 card-lift border border-[#e5e5e7]"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="eyebrow text-[#a1a1a6]">Latest</p>
              <h3 className="mt-1 text-[18px] font-display text-[#1d1d1f] tracking-tight">Decisions</h3>
            </div>
            <Link href="/dashboard/decisions" className="text-[12px] text-[#86868b] hover:text-[#1d1d1f] transition-colors flex items-center gap-1">
              View all <ArrowUpRight size={11} />
            </Link>
          </div>
          <div className="space-y-5">
            {DECISIONS.map((d, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="flex items-center gap-2 mb-2">
                  <span className="eyebrow text-[#0071e3]">{d.tag}</span>
                  <span className="text-[10px] text-[#c7c7cc]">·</span>
                  <span className="text-[10px] eyebrow text-[#a1a1a6]">{d.date}</span>
                </div>
                <p className="text-[15px] text-[#1d1d1f] font-medium leading-snug group-hover:text-[#0071e3] transition-colors">
                  {d.title}
                </p>
                <p className="text-[12px] text-[#86868b] mt-1">{d.source}</p>
                {i < DECISIONS.length - 1 && <div className="divider mt-5" />}
              </div>
            ))}
          </div>
        </motion.div>

        {/* ACTION ITEMS */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="col-span-12 lg:col-span-7 bg-white rounded-2xl p-6 lg:p-8 card-lift border border-[#e5e5e7]"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="eyebrow text-[#a1a1a6]">Pending</p>
              <h3 className="mt-1 text-[18px] font-display text-[#1d1d1f] tracking-tight">Action items</h3>
            </div>
            <Link href="/dashboard/brain" className="text-[12px] text-[#86868b] hover:text-[#1d1d1f] transition-colors flex items-center gap-1">
              Search brain <ArrowUpRight size={11} />
            </Link>
          </div>
          <div>
            {ACTION_ITEMS.map((a, i) => (
              <div
                key={i}
                className="flex items-start gap-4 py-4 border-b border-[#f5f5f7] last:border-0 group cursor-pointer"
              >
                <button
                  className="mt-1 shrink-0 transition-colors"
                  style={{ color: a.done ? "#0071e3" : "#c7c7cc" }}
                >
                  {a.done ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-[14px] leading-snug ${a.done ? "line-through text-[#a1a1a6]" : "text-[#1d1d1f]"}`}>
                    {a.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-[11.5px] text-[#86868b]">
                    <span>@{a.who}</span>
                    <span className="text-[#c7c7cc]">·</span>
                    <span className="flex items-center gap-1">
                      <Calendar size={10} /> {a.due}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* QUICK SEARCH — Agency Brain CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="col-span-12 lg:col-span-5 bg-white rounded-2xl p-6 lg:p-8 card-lift border border-[#e5e5e7] relative overflow-hidden cursor-pointer"
          onClick={() => setSearchOpen(true)}
        >
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-20 pointer-events-none"
               style={{ background: "radial-gradient(circle, rgba(0,113,227,0.12) 0%, transparent 70%)" }} />
          <p className="eyebrow text-[#a1a1a6]">Ask anything</p>
          <h3 className="mt-3 heading-display text-[32px] lg:text-[38px] text-[#1d1d1f] leading-[1.0]">
            Agency <span style={{ fontStyle: "italic" }}>Brain.</span>
          </h3>
          <p className="mt-3 text-[13px] text-[#86868b] leading-relaxed">
            &ldquo;What did Nike approve about pricing?&rdquo;
            <br />
            &ldquo;Show last sprint decisions.&rdquo;
          </p>
          <div className="mt-6 flex items-center gap-2 text-[12.5px] text-[#0071e3]">
            <Search size={12} />
            <span>Open search</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[#f5f5f7] rounded ml-2 text-[#86868b]">⌘K</kbd>
          </div>
        </motion.div>

      </div>

      <div className="h-12" />
    </div>
  );
}
