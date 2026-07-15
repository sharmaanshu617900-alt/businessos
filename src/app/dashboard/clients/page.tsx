"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Building2,
  Calendar,
  Clock,
  Users,
  FileText,
  Lightbulb,
  ListChecks,
  FolderOpen,
  X,
  ArrowRight,
  ChevronRight,
  MoreHorizontal,
  Download,
  Share2,
  Bookmark,
  Brain,
  Send,
  Quote,
  Zap,
  MessageSquare,
  Headphones,
  Presentation,
  StickyNote,
  TrendingUp,
  Check,
  Activity,
  Mail,
  Phone,
  MapPin,
  Flag,
  BookOpen,
} from "lucide-react";

/* ============================================================
   TYPES
   ============================================================ */
type ClientHealth = "strong" | "good" | "attention";

interface ClientDecision {
  id: string;
  decision: string;
  meeting: string;
  date: string;
  status: "approved" | "pending";
}

interface ClientActionItem {
  id: string;
  task: string;
  owner: string;
  ownerInitials: string;
  ownerColor: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
}

interface ClientSOP {
  id: string;
  title: string;
  description: string;
  status: "active" | "draft" | "archived";
  updatedAt: string;
}

interface ClientFile {
  name: string;
  type: string;
  size: string;
  icon: any;
  color: string;
  bgColor: string;
}

interface ClientMeeting {
  id: string;
  title: string;
  date: string;
  duration: string;
  participants: number;
  status: "completed" | "processing" | "scheduled";
}

interface ClientData {
  id: string;
  name: string;
  initials: string;
  industry: string;
  logoColor: string;
  logoBg: string;
  lastActivity: string;
  lastActivityLabel: string;
  totalMeetings: number;
  decisionsCaptured: number;
  actionItems: number;
  sops: number;
  health: ClientHealth;
  summary: string;
  meetings: ClientMeeting[];
  decisions: ClientDecision[];
  actionItemsList: ClientActionItem[];
  sopItems: ClientSOP[];
  files: ClientFile[];
  email: string;
  phone: string;
  location: string;
  website: string;
}

/* ============================================================
   MOCK DATA
   ============================================================ */
const MOCK_CLIENTS: ClientData[] = [
  {
    id: "c1",
    name: "Nike",
    initials: "NK",
    industry: "Sportswear & Apparel",
    logoColor: "text-white",
    logoBg: "bg-gradient-to-br from-brand-600 to-brand-800",
    lastActivity: "2h ago",
    lastActivityLabel: "Today at 10:00 AM",
    totalMeetings: 14,
    decisionsCaptured: 27,
    actionItems: 8,
    sops: 3,
    sopItems: [
      { id: "s1", title: "Nike Brand Guidelines — Q3 Update", description: "Process for updating brand guidelines with new creative platform assets.", status: "active", updatedAt: "Jun 20" },
      { id: "s2", title: "Campaign Approval Workflow", description: "Step-by-step approval process for all campaign deliverables before client presentation.", status: "active", updatedAt: "Jun 15" },
      { id: "s3", title: "Quarterly Strategy Review Template", description: "Standard agenda and format for quarterly brand strategy alignment sessions.", status: "draft", updatedAt: "Jun 10" },
    ],
    health: "strong",
    summary:
      "Nike focuses on performance marketing and product launches. Team prefers weekly reviews and fast feedback cycles. Strong partnership with quarterly brand strategy sessions.",
    email: "partnerships@nike.com",
    phone: "+1 (503) 671-6453",
    location: "Beaverton, Oregon",
    website: "nike.com",
    meetings: [
      { id: "m1", title: "Q3 Strategy & Brand Direction", date: "Jun 23 · 10:00 AM", duration: "45 min", participants: 5, status: "completed" },
      { id: "m2", title: "Campaign Creative Review", date: "Jun 16 · 2:00 PM", duration: "38 min", participants: 4, status: "completed" },
      { id: "m3", title: "Product Launch Planning", date: "Jun 10 · 11:00 AM", duration: "52 min", participants: 6, status: "completed" },
      { id: "m4", title: "Weekly Sync — Week 24", date: "Jun 5 · 9:30 AM", duration: "28 min", participants: 3, status: "completed" },
      { id: "m5", title: "Budget Allocation Q3", date: "May 28 · 3:00 PM", duration: "42 min", participants: 4, status: "completed" },
      { id: "m6", title: "Brand Platform Workshop", date: "May 20 · 10:00 AM", duration: "1h 30m", participants: 8, status: "completed" },
    ],
    decisions: [
      { id: "d1", decision: "Homepage redesign approved", meeting: "Q3 Strategy", date: "Jun 23", status: "approved" },
      { id: "d2", decision: "Increase campaign budget by 15%", meeting: "Budget Allocation", date: "May 28", status: "approved" },
      { id: "d3", decision: "Product launch moved to July", meeting: "Product Launch Planning", date: "Jun 10", status: "approved" },
      { id: "d4", decision: "AR try-on experience for SNKRS app", meeting: "Q3 Strategy", date: "Jun 23", status: "approved" },
      { id: "d5", decision: "New agency pricing model approved", meeting: "Weekly Sync", date: "Jun 5", status: "pending" },
      { id: "d6", decision: "'Motion' creative platform direction", meeting: "Brand Workshop", date: "May 20", status: "approved" },
    ],
    actionItemsList: [
      { id: "a1", task: "Draft creative brief for Motion platform", owner: "Maya Rodriguez", ownerInitials: "MR", ownerColor: "from-amber-400 to-rose-500", dueDate: "Jun 25", priority: "high", completed: false },
      { id: "a2", task: "Coordinate athlete shoot logistics", owner: "Theo Laurent", ownerInitials: "TL", ownerColor: "from-emerald-400 to-teal-600", dueDate: "Jun 26", priority: "medium", completed: false },
      { id: "a3", task: "Send SNKRS integration spec to dev", owner: "Alex Kim", ownerInitials: "AK", ownerColor: "from-brand-500 to-brand-700", dueDate: "Jun 28", priority: "medium", completed: true },
      { id: "a4", task: "Update pricing document with new model", owner: "Sam Keller", ownerInitials: "SK", ownerColor: "from-rose-400 to-pink-600", dueDate: "Jun 27", priority: "low", completed: false },
      { id: "a5", task: "Schedule follow-up with Nike procurement", owner: "Sam Keller", ownerInitials: "SK", ownerColor: "from-rose-400 to-pink-600", dueDate: "Jun 30", priority: "high", completed: false },
      { id: "a6", task: "Prepare Q3 campaign performance report", owner: "Maya Rodriguez", ownerInitials: "MR", ownerColor: "from-amber-400 to-rose-500", dueDate: "Jul 2", priority: "medium", completed: false },
    ],
    files: [
      { name: "Nike Brand Guidelines", type: "PDF", size: "8.4 MB", icon: FileText, color: "text-brand-600", bgColor: "bg-brand-50" },
      { name: "Q3 Campaign Brief", type: "DOC", size: "2.1 MB", icon: StickyNote, color: "text-amber-600", bgColor: "bg-amber-50" },
      { name: "Contract — FY2025", type: "PDF", size: "1.2 MB", icon: FileText, color: "text-emerald-600", bgColor: "bg-emerald-50" },
      { name: "Meeting Recording", type: "MP3", size: "45.2 MB", icon: Headphones, color: "text-violet-600", bgColor: "bg-violet-50" },
      { name: "Presentation Deck", type: "PDF", size: "12.6 MB", icon: Presentation, color: "text-rose-600", bgColor: "bg-rose-50" },
    ],
  },
  {
    id: "c2",
    name: "Helios Labs",
    initials: "HL",
    industry: "Health Technology",
    logoColor: "text-white",
    logoBg: "bg-gradient-to-br from-orange-500 to-amber-700",
    lastActivity: "1d ago",
    lastActivityLabel: "Yesterday at 2:15 PM",
    totalMeetings: 6,
    decisionsCaptured: 12,
    actionItems: 4,
    sops: 1,
    sopItems: [
      { id: "hs1", title: "Client Onboarding Checklist", description: "Standard onboarding procedures for new health tech clients.", status: "active", updatedAt: "Jun 22" },
    ],
    health: "good",
    summary:
      "Helios Labs is an early-stage health tech startup. Recent kickoff meeting established project scope and delivery milestones. Prefer bi-weekly syncs and async updates.",
    email: "hello@helioslabs.io",
    phone: "+1 (415) 555-0192",
    location: "San Francisco, CA",
    website: "helioslabs.io",
    meetings: [
      { id: "h1", title: "Client Kickoff — Helios Labs", date: "Jun 23 · 2:15 PM", duration: "1h 12m", participants: 4, status: "processing" },
      { id: "h2", title: "Discovery — Brand Identity", date: "Jun 17 · 10:00 AM", duration: "55 min", participants: 3, status: "completed" },
      { id: "h3", title: "Tech Stack Review", date: "Jun 10 · 3:30 PM", duration: "48 min", participants: 4, status: "completed" },
      { id: "h4", title: "Project Scope Alignment", date: "Jun 3 · 11:00 AM", duration: "62 min", participants: 5, status: "completed" },
    ],
    decisions: [
      { id: "hd1", decision: "React Native for mobile app", meeting: "Tech Stack Review", date: "Jun 10", status: "approved" },
      { id: "hd2", decision: "Design system from scratch", meeting: "Discovery", date: "Jun 17", status: "approved" },
      { id: "hd3", decision: "MVP scope confirmed — 3 months", meeting: "Kickoff", date: "Jun 23", status: "pending" },
      { id: "hd4", decision: "AWS as cloud provider", meeting: "Tech Stack Review", date: "Jun 10", status: "approved" },
    ],
    actionItemsList: [
      { id: "ha1", task: "Share brand questionnaire with stakeholders", owner: "Maya Rodriguez", ownerInitials: "MR", ownerColor: "from-amber-400 to-rose-500", dueDate: "Jun 27", priority: "high", completed: false },
      { id: "ha2", task: "Draft project timeline and milestones", owner: "Theo Laurent", ownerInitials: "TL", ownerColor: "from-emerald-400 to-teal-600", dueDate: "Jun 28", priority: "high", completed: false },
      { id: "ha3", task: "Set up AWS environment", owner: "Alex Kim", ownerInitials: "AK", ownerColor: "from-brand-500 to-brand-700", dueDate: "Jul 1", priority: "medium", completed: false },
      { id: "ha4", task: "Schedule weekly sync cadence", owner: "Sam Keller", ownerInitials: "SK", ownerColor: "from-rose-400 to-pink-600", dueDate: "Jun 25", priority: "low", completed: true },
    ],
    files: [
      { name: "Project Proposal", type: "PDF", size: "3.2 MB", icon: FileText, color: "text-brand-600", bgColor: "bg-brand-50" },
      { name: "Tech Stack Docs", type: "DOC", size: "1.8 MB", icon: StickyNote, color: "text-amber-600", bgColor: "bg-amber-50" },
      { name: "Kickoff Recording", type: "MP3", size: "28.4 MB", icon: Headphones, color: "text-violet-600", bgColor: "bg-violet-50" },
    ],
  },
  {
    id: "c3",
    name: "InnovateX",
    initials: "IX",
    industry: "Enterprise SaaS",
    logoColor: "text-white",
    logoBg: "bg-gradient-to-br from-sky-500 to-indigo-700",
    lastActivity: "3d ago",
    lastActivityLabel: "Jun 20 at 11:30 AM",
    totalMeetings: 9,
    decisionsCaptured: 18,
    actionItems: 5,
    sops: 2,
    sopItems: [
      { id: "is1", title: "Monthly Strategy Alignment Process", description: "Standard agenda and preparation checklist for monthly client strategy calls.", status: "active", updatedAt: "Jun 18" },
      { id: "is2", title: "API Change Management", description: "Process for communicating and deploying API changes to enterprise clients.", status: "active", updatedAt: "Jun 12" },
    ],
    health: "good",
    summary:
      "InnovateX is an enterprise SaaS company focused on AI-powered analytics. Long-standing client with established workflows. Quarterly business reviews and monthly strategy alignment.",
    email: "accounts@innovatex.com",
    phone: "+1 (212) 555-0483",
    location: "New York, NY",
    website: "innovatex.com",
    meetings: [
      { id: "i1", title: "Q3 Product Roadmap Review", date: "Jun 20 · 11:30 AM", duration: "55 min", participants: 6, status: "completed" },
      { id: "i2", title: "Analytics Dashboard Feedback", date: "Jun 13 · 2:00 PM", duration: "42 min", participants: 3, status: "completed" },
      { id: "i3", title: "Monthly Strategy Alignment", date: "Jun 6 · 10:00 AM", duration: "48 min", participants: 5, status: "completed" },
      { id: "i4", title: "API Integration Planning", date: "May 30 · 1:00 PM", duration: "36 min", participants: 4, status: "completed" },
      { id: "i5", title: "Q2 Business Review", date: "May 22 · 9:00 AM", duration: "1h 15m", participants: 7, status: "completed" },
    ],
    decisions: [
      { id: "id1", decision: "New dashboard UI approved for Q3", meeting: "Product Roadmap", date: "Jun 20", status: "approved" },
      { id: "id2", decision: "API v2 migration scheduled for August", meeting: "API Planning", date: "May 30", status: "approved" },
      { id: "id3", decision: "Increase monthly retainer by 10%", meeting: "Q2 Review", date: "May 22", status: "approved" },
      { id: "id4", decision: "Hire dedicated support engineer", meeting: "Strategy Alignment", date: "Jun 6", status: "pending" },
      { id: "id5", decision: "Beta program for new analytics tier", meeting: "Product Roadmap", date: "Jun 20", status: "approved" },
    ],
    actionItemsList: [
      { id: "ia1", task: "Finalize dashboard design mockups", owner: "Jules Chen", ownerInitials: "JC", ownerColor: "from-sky-400 to-indigo-600", dueDate: "Jun 28", priority: "high", completed: false },
      { id: "ia2", task: "Draft API v2 migration guide", owner: "Alex Kim", ownerInitials: "AK", ownerColor: "from-brand-500 to-brand-700", dueDate: "Jul 5", priority: "medium", completed: false },
      { id: "ia3", task: "Prepare retainer adjustment proposal", owner: "Sam Keller", ownerInitials: "SK", ownerColor: "from-rose-400 to-pink-600", dueDate: "Jun 30", priority: "high", completed: false },
      { id: "ia4", task: "Create job description for support engineer", owner: "Maya Rodriguez", ownerInitials: "MR", ownerColor: "from-amber-400 to-rose-500", dueDate: "Jul 2", priority: "low", completed: false },
    ],
    files: [
      { name: "Q3 Roadmap Deck", type: "PDF", size: "6.8 MB", icon: Presentation, color: "text-rose-600", bgColor: "bg-rose-50" },
      { name: "Analytics Dashboard Spec", type: "DOC", size: "4.2 MB", icon: StickyNote, color: "text-amber-600", bgColor: "bg-amber-50" },
      { name: "Contract Renewal — Q3", type: "PDF", size: "1.5 MB", icon: FileText, color: "text-emerald-600", bgColor: "bg-emerald-50" },
      { name: "API Documentation", type: "PDF", size: "3.6 MB", icon: FileText, color: "text-brand-600", bgColor: "bg-brand-50" },
      { name: "Strategy Recording", type: "MP3", size: "32.1 MB", icon: Headphones, color: "text-violet-600", bgColor: "bg-violet-50" },
    ],
  },
  {
    id: "c4",
    name: "Quantum Dynamics",
    initials: "QD",
    industry: "Fintech",
    logoColor: "text-white",
    logoBg: "bg-gradient-to-br from-emerald-500 to-teal-700",
    lastActivity: "1 week ago",
    lastActivityLabel: "Jun 16 at 4:00 PM",
    totalMeetings: 4,
    decisionsCaptured: 8,
    actionItems: 3,
    sops: 1,
    sopItems: [
      { id: "qs1", title: "Compliance Documentation Process", description: "Procedure for collecting and organizing compliance documentation from fintech clients.", status: "draft", updatedAt: "Jun 16" },
    ],
    health: "attention",
    summary:
      "New fintech client in the regulatory approval phase. Communication has been slower recently. Need to follow up on outstanding action items and re-engage stakeholders.",
    email: "team@quantumdynamics.io",
    phone: "+1 (617) 555-0721",
    location: "Boston, MA",
    website: "quantumdynamics.io",
    meetings: [
      { id: "q1", title: "Initial Discovery & Scope", date: "Jun 16 · 4:00 PM", duration: "1h 05m", participants: 4, status: "completed" },
      { id: "q2", title: "Compliance Requirements Review", date: "Jun 9 · 10:30 AM", duration: "48 min", participants: 3, status: "completed" },
      { id: "q3", title: "Tech Feasibility Assessment", date: "Jun 2 · 2:00 PM", duration: "52 min", participants: 4, status: "completed" },
    ],
    decisions: [
      { id: "qd1", decision: "Initial scope approved", meeting: "Discovery", date: "Jun 16", status: "approved" },
      { id: "qd2", decision: "SOC 2 compliance required", meeting: "Compliance Review", date: "Jun 9", status: "pending" },
      { id: "qd3", decision: "Node.js backend architecture", meeting: "Tech Assessment", date: "Jun 2", status: "approved" },
    ],
    actionItemsList: [
      { id: "qa1", task: "Send compliance questionnaire", owner: "Alex Kim", ownerInitials: "AK", ownerColor: "from-brand-500 to-brand-700", dueDate: "Jun 20", priority: "high", completed: false },
      { id: "qa2", task: "Schedule follow-up discovery session", owner: "Sam Keller", ownerInitials: "SK", ownerColor: "from-rose-400 to-pink-600", dueDate: "Jun 25", priority: "high", completed: false },
      { id: "qa3", task: "Share project proposal draft", owner: "Maya Rodriguez", ownerInitials: "MR", ownerColor: "from-amber-400 to-rose-500", dueDate: "Jun 18", priority: "medium", completed: true },
    ],
    files: [
      { name: "Discovery Notes", type: "DOC", size: "892 KB", icon: StickyNote, color: "text-amber-600", bgColor: "bg-amber-50" },
      { name: "Compliance Checklist", type: "PDF", size: "2.4 MB", icon: FileText, color: "text-brand-600", bgColor: "bg-brand-50" },
      { name: "Tech Assessment Recording", type: "MP3", size: "18.6 MB", icon: Headphones, color: "text-violet-600", bgColor: "bg-violet-50" },
    ],
  },
];

/* ============================================================
   HEALTH BADGE
   ============================================================ */
const healthConfig = {
  strong: { label: "Strong", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", icon: TrendingUp },
  good: { label: "Good", bg: "bg-brand-50", text: "text-brand-700", dot: "bg-brand-500", icon: Activity },
  attention: { label: "Needs Attention", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", icon: Flag },
};

const priorityBadge = (p: ClientActionItem["priority"]) => {
  const map = {
    high: { label: "High", bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
    medium: { label: "Medium", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
    low: { label: "Low", bg: "bg-ink-100", text: "text-ink-600", dot: "bg-ink-400" },
  };
  return map[p];
};

/* ============================================================
   PAGE
   ============================================================ */
export default function ClientsHubPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "meetings" | "decisions" | "actions" | "sops" | "files">("overview");
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPanelExpanded, setAiPanelExpanded] = useState(false);
  const [activePromptIndex, setActivePromptIndex] = useState<number | null>(null);
  const [checkedActions, setCheckedActions] = useState<Set<string>>(new Set(["a3", "ia4", "qa3"]));

  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_CLIENTS;
    const q = searchQuery.toLowerCase();
    return MOCK_CLIENTS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.industry.toLowerCase().includes(q) ||
        c.summary.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const toggleAction = (id: string) => {
    const next = new Set(checkedActions);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCheckedActions(next);
  };

  const handleAskAI = async () => {
    if (!aiQuestion.trim() || !selectedClient) return;
    setAiLoading(true);
    setAiPanelExpanded(true);
    await new Promise((r) => setTimeout(r, 1200));
    setAiAnswer(
      `Based on AgencyOS memory of **${selectedClient.name}**, here's what I found:\n\n**Key Decisions:** ${selectedClient.decisions.length} decisions captured across ${selectedClient.totalMeetings} meetings. The most recent approved decision was "${selectedClient.decisions[0]?.decision || "N/A"}".\n\n**Open Action Items:** ${selectedClient.actionItemsList.filter((a) => !a.completed).length} items pending, with ${selectedClient.actionItemsList.filter((a) => !a.completed && a.priority === "high").length} high-priority tasks requiring attention.\n\n**Recent Activity:** Last meeting was ${selectedClient.lastActivityLabel}. The overall relationship is ${selectedClient.health === "strong" ? "strong and highly engaged" : selectedClient.health === "good" ? "positive with steady engagement" : "showing signs of disengagement — follow-up recommended"}.`
    );
    setAiLoading(false);
  };

  const handleSampleQuestion = (q: string, index: number) => {
    setAiQuestion(q);
    setActivePromptIndex(index);
    setTimeout(() => handleAskAI(), 100);
  };

  const togglePanel = (client: ClientData | null) => {
    setSelectedClient(client);
    if (!client) {
      setAiPanelExpanded(false);
      setAiAnswer("");
      setAiQuestion("");
      setActivePromptIndex(null);
    }
    setActiveTab("overview");
  };

  return (
    <div className="min-h-screen bg-ink-50">
      {/* ===== STICKY HEADER ===== */}
      <div className="sticky top-0 z-30 bg-white/85 backdrop-glass border-b border-ink-200/60">
        <div className="px-6 lg:px-10 py-4 lg:py-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <div className="hidden lg:flex w-10 h-10 rounded-2xl bg-white border border-ink-200/70 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_1px_2px_rgba(15,17,21,0.04)] items-center justify-center">
              <Building2 size={18} className="text-brand-600" strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <h1 className="text-[24px] lg:text-[28px] font-semibold tracking-[-0.02em] text-ink-900 leading-tight">
                Clients Hub
              </h1>
              <p className="text-[13px] text-ink-500 mt-0.5">
                Everything your agency knows about every client.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 lg:flex-none lg:w-[280px] group">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 group-focus-within:text-brand-600 transition-colors"
              />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                type="text"
                placeholder="Search clients..."
                className="w-full pl-10 pr-4 py-2.5 rounded-[12px] bg-white border border-ink-200/70 text-[13px] text-ink-900 placeholder:text-ink-400 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_1px_2px_rgba(15,17,21,0.04)] focus:outline-none focus:ring-4 focus:ring-brand-600/10 focus:border-brand-300 transition-all"
              />
            </div>

            <button className="inline-flex items-center gap-2 px-4 lg:px-5 py-2.5 rounded-[12px] bg-ink-900 hover:bg-ink-800 text-white text-[13px] font-medium transition-all shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_4px_14px_-2px_rgba(15,17,21,0.3)]">
              <Plus size={15} strokeWidth={2.2} />
              <span className="hidden sm:inline">Add Client</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="px-6 lg:px-10 py-6 lg:py-8">
        <div className="max-w-[1440px] mx-auto">
          {/* Client Stats Bar */}
          <div className="flex items-center gap-4 sm:gap-6 mb-6 text-[12px] text-ink-500 animate-fade-in-up">
            <span>
              <span className="font-semibold text-ink-700">{MOCK_CLIENTS.length}</span> clients
            </span>
            <span className="w-px h-4 bg-ink-200" />
            <span>
              <span className="font-semibold text-ink-700">{MOCK_CLIENTS.reduce((s, c) => s + c.totalMeetings, 0)}</span> total meetings
            </span>
            <span className="w-px h-4 bg-ink-200 hidden sm:block" />
            <span className="hidden sm:inline">
              <span className="font-semibold text-ink-700">{MOCK_CLIENTS.reduce((s, c) => s + c.decisionsCaptured, 0)}</span> decisions
            </span>
            <span className="w-px h-4 bg-ink-200 hidden md:block" />
            <span className="hidden md:inline">
              <span className="font-semibold text-ink-700">{MOCK_CLIENTS.reduce((s, c) => s + c.actionItems, 0)}</span> action items
            </span>
          </div>

          {/* Client Grid */}
          {filteredClients.length === 0 ? (
            <div className="glass-card-solid rounded-2xl py-20 px-6 flex flex-col items-center text-center animate-fade-in-up">
              <div className="w-16 h-16 rounded-2xl bg-ink-100 border border-ink-200/60 flex items-center justify-center mb-4">
                <Search size={26} className="text-ink-400" strokeWidth={1.8} />
              </div>
              <h3 className="text-[18px] font-semibold text-ink-900 tracking-[-0.01em]">
                No clients found
              </h3>
              <p className="text-[13.5px] text-ink-500 mt-2 max-w-md">
                Try adjusting your search query.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredClients.map((client, i) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  index={i}
                  onClick={() => togglePanel(client)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ===== DETAIL PANEL ===== */}
      <ClientDetailPanel
        client={selectedClient}
        onClose={() => togglePanel(null)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        checkedActions={checkedActions}
        onToggleAction={toggleAction}
        aiQuestion={aiQuestion}
        setAiQuestion={setAiQuestion}
        aiAnswer={aiAnswer}
        aiLoading={aiLoading}
        aiPanelExpanded={aiPanelExpanded}
        onAskAI={handleAskAI}
        onSampleQuestion={handleSampleQuestion}
        activePromptIndex={activePromptIndex}
        onResetAI={() => {
          setAiQuestion("");
          setActivePromptIndex(null);
        }}
      />
    </div>
  );
}

/* ============================================================
   CLIENT CARD
   ============================================================ */
function ClientCard({
  client,
  index,
  onClick,
}: {
  client: ClientData;
  index: number;
  onClick: () => void;
}) {
  const health = healthConfig[client.health];
  const HealthIcon = health.icon;

  return (
    <button
      onClick={onClick}
      className="text-left glass-card-solid rounded-2xl p-5 hover-lift group animate-fade-in-up"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-xl ${client.logoBg} flex items-center justify-center text-[16px] font-bold shadow-sm`}
          >
            <span className={client.logoColor}>{client.initials}</span>
          </div>
          <div className="min-w-0">
            <h3 className="text-[15px] font-semibold text-ink-900 leading-tight group-hover:text-brand-700 transition-colors">
              {client.name}
            </h3>
            <p className="text-[11.5px] text-ink-500 mt-0.5">{client.industry}</p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${health.bg} ${health.text} text-[10px] font-medium flex-shrink-0`}
        >
          <HealthIcon size={11} strokeWidth={2.5} />
          {health.label}
        </span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="text-center">
          <p className="text-[17px] font-semibold text-ink-900">{client.totalMeetings}</p>
          <p className="text-[10px] text-ink-500 mt-0.5">Meetings</p>
        </div>
        <div className="text-center">
          <p className="text-[17px] font-semibold text-ink-900">{client.decisionsCaptured}</p>
          <p className="text-[10px] text-ink-500 mt-0.5">Decisions</p>
        </div>
        <div className="text-center">
          <p className="text-[17px] font-semibold text-ink-900">{client.actionItems}</p>
          <p className="text-[10px] text-ink-500 mt-0.5">Actions</p>
        </div>
        <div className="text-center">
          <p className="text-[17px] font-semibold text-ink-900">{client.sops}</p>
          <p className="text-[10px] text-ink-500 mt-0.5">SOPs</p>
        </div>
      </div>

      {/* Last activity */}
      <div className="flex items-center justify-between pt-3 border-t border-ink-200/50">
        <span className="text-[11px] text-ink-500 flex items-center gap-1.5">
          <Activity size={11} className="text-ink-400" />
          {client.lastActivity}
        </span>
        <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-brand-700 opacity-0 group-hover:opacity-100 transition-all translate-x-[-4px] group-hover:translate-x-0">
          Open
          <ArrowRight size={11} />
        </span>
      </div>
    </button>
  );
}

/* ============================================================
   CLIENT DETAIL PANEL
   ============================================================ */
function ClientDetailPanel({
  client,
  onClose,
  activeTab,
  setActiveTab,
  checkedActions,
  onToggleAction,
  aiQuestion,
  setAiQuestion,
  aiAnswer,
  aiLoading,
  aiPanelExpanded,
  onAskAI,
  onSampleQuestion,
  activePromptIndex,
  onResetAI,
}: {
  client: ClientData | null;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (t: "overview" | "meetings" | "decisions" | "actions" | "sops" | "files") => void;
  checkedActions: Set<string>;
  onToggleAction: (id: string) => void;
  aiQuestion: string;
  setAiQuestion: (q: string) => void;
  aiAnswer: string;
  aiLoading: boolean;
  aiPanelExpanded: boolean;
  onAskAI: () => void;
  onSampleQuestion: (q: string, i: number) => void;
  activePromptIndex: number | null;
  onResetAI: () => void;
}) {
  const open = !!client;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "meetings", label: "Meetings" },
    { id: "decisions", label: "Decisions" },
    { id: "actions", label: "Actions" },
    { id: "sops", label: "SOPs" },
    { id: "files", label: "Files" },
  ] as const;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-ink-900/20 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!open}
      />

      {/* Panel */}
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[520px] lg:w-[560px] bg-white border-l border-ink-200/70 z-50 flex flex-col shadow-[-24px_0_60px_-20px_rgba(15,17,21,0.18)] transition-transform duration-400 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ transitionTimingFunction: "cubic-bezier(0.2, 0.8, 0.2, 1)" }}
      >
        {client && (
          <div className="flex flex-col h-full">
            {/* Panel Header */}
            <div className="px-6 pt-6 pb-4 border-b border-ink-200/60">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl ${client.logoBg} flex items-center justify-center text-[14px] font-bold shadow-sm`}
                  >
                    <span className={client.logoColor}>{client.initials}</span>
                  </div>
                  <div>
                    <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-ink-900 leading-tight">
                      {client.name}
                    </h2>
                    <p className="text-[11.5px] text-ink-500">{client.industry}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 rounded-lg hover:bg-ink-100 text-ink-500 hover:text-ink-900 transition-colors" aria-label="Bookmark">
                    <Bookmark size={15} />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-ink-100 text-ink-500 hover:text-ink-900 transition-colors" aria-label="Share">
                    <Share2 size={15} />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-ink-100 text-ink-500 hover:text-ink-900 transition-colors" aria-label="More">
                    <MoreHorizontal size={15} />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg hover:bg-ink-100 text-ink-500 hover:text-ink-900 transition-colors ml-1"
                    aria-label="Close"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* Health badge + Contact */}
              <div className="flex items-center gap-3 text-[12px] text-ink-500 mb-3">
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${healthConfig[client.health].bg} ${healthConfig[client.health].text} text-[10px] font-medium`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${healthConfig[client.health].dot}`} />
                  {healthConfig[client.health].label}
                </span>
                <span className="text-ink-300">·</span>
                <span>{client.totalMeetings} meetings</span>
                <span className="text-ink-300">·</span>
                <span>{client.decisionsCaptured} decisions</span>
              </div>

              {/* Contact row */}
              <div className="flex flex-wrap gap-2 text-[11.5px] text-ink-500">
                {client.email && (
                  <span className="inline-flex items-center gap-1">
                    <Mail size={11} className="text-ink-400" />
                    {client.email}
                  </span>
                )}
                {client.phone && (
                  <span className="inline-flex items-center gap-1">
                    <Phone size={11} className="text-ink-400" />
                    {client.phone}
                  </span>
                )}
                {client.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={11} className="text-ink-400" />
                    {client.location}
                  </span>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="px-6 pt-3 border-b border-ink-200/60">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`relative px-3 py-2.5 text-[12.5px] font-medium transition-colors whitespace-nowrap ${
                      activeTab === t.id
                        ? "text-ink-900"
                        : "text-ink-500 hover:text-ink-700"
                    }`}
                  >
                    {t.label}
                    {activeTab === t.id && (
                      <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-ink-900 rounded-t-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="space-y-6 max-w-[520px]">
                {/* OVERVIEW TAB */}
                {activeTab === "overview" && (
                  <>
                    {/* Summary */}
                    <section className="animate-fade-in-up">
                      <div className="flex items-center gap-2 mb-3">
                        <Brain size={13} className="text-ink-500" strokeWidth={2.1} />
                        <h3 className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-500">
                          AgencyOS Memory
                        </h3>
                      </div>
                      <div className="rounded-xl bg-gradient-to-br from-brand-50 to-white border border-brand-100/80 p-4">
                        <p className="text-[13px] text-ink-700 leading-relaxed">
                          {client.summary}
                        </p>
                      </div>
                    </section>

                    {/* Metrics */}
                    <section className="animate-fade-in-up stagger-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Zap size={13} className="text-ink-500" strokeWidth={2.1} />
                        <h3 className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-500">
                          Client Intelligence
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 gap-2.5">
                        {[
                          { label: "Total Meetings", value: client.totalMeetings, icon: MessageSquare, accent: "brand" },
                          { label: "Decisions Captured", value: client.decisionsCaptured, icon: Lightbulb, accent: "emerald" },
                          { label: "Action Items", value: client.actionItems, icon: ListChecks, accent: "rose" },
                          { label: "SOPs Created", value: client.sops, icon: FileText, accent: "amber" },
                        ].map((m) => {
                          const accentMap: Record<string, string> = {
                            brand: "bg-brand-50 text-brand-600",
                            emerald: "bg-emerald-50 text-emerald-600",
                            rose: "bg-rose-50 text-rose-600",
                            amber: "bg-amber-50 text-amber-600",
                          };
                          const Icon = m.icon;
                          return (
                            <div
                              key={m.label}
                              className="flex items-center gap-3 p-3 rounded-xl bg-white border border-ink-200/70"
                            >
                              <div className={`w-8 h-8 rounded-lg ${accentMap[m.accent]} flex items-center justify-center`}>
                                <Icon size={14} strokeWidth={2.1} />
                              </div>
                              <div>
                                <p className="text-[17px] font-semibold text-ink-900">{m.value}</p>
                                <p className="text-[10px] text-ink-500">{m.label}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>

                    {/* Recent meetings */}
                    <section className="animate-fade-in-up stagger-2">
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2">
                          <Calendar size={13} className="text-ink-500" />
                          <h3 className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-500">
                            Recent Meetings
                          </h3>
                        </div>
                        <button
                          onClick={() => setActiveTab("meetings")}
                          className="text-[11px] font-medium text-brand-700 hover:text-brand-800"
                        >
                          View all →
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        {client.meetings.slice(0, 3).map((m) => (
                          <div
                            key={m.id}
                            className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-ink-50 transition-colors"
                          >
                            <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-[12.5px] font-medium text-ink-900 truncate">{m.title}</p>
                              <p className="text-[10.5px] text-ink-500">{m.date} · {m.duration}</p>
                            </div>
                            <Users size={12} className="text-ink-400 flex-shrink-0" />
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* AI Memory Panel inline */}
                    <AIMemoryPanel
                      clientName={client.name}
                      aiQuestion={aiQuestion}
                      setAiQuestion={setAiQuestion}
                      aiAnswer={aiAnswer}
                      aiLoading={aiLoading}
                      aiPanelExpanded={aiPanelExpanded}
                      onAskAI={onAskAI}
                      onSampleQuestion={onSampleQuestion}
                      activePromptIndex={activePromptIndex}
                      onResetAI={onResetAI}
                    />
                  </>
                )}

                {/* MEETINGS TAB */}
                {activeTab === "meetings" && (
                  <section className="animate-fade-in-up">
                    <div className="flex items-center gap-2 mb-3">
                      <MessageSquare size={13} className="text-ink-500" strokeWidth={2.1} />
                      <h3 className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-500">
                        All Meetings
                      </h3>
                      <span className="px-1.5 py-0.5 rounded-full bg-ink-100 text-ink-600 text-[9px] font-mono">
                        {client.meetings.length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {client.meetings.map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center gap-3 p-3 rounded-xl bg-white border border-ink-200/70 hover:border-brand-200/70 transition-all cursor-default"
                        >
                          <div
                            className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              m.status === "completed"
                                ? "bg-emerald-500"
                                : m.status === "processing"
                                ? "bg-amber-500 animate-pulse-soft"
                                : "bg-sky-500"
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-ink-900">{m.title}</p>
                            <div className="flex items-center gap-2 mt-1 text-[10.5px] text-ink-500">
                              <span>{m.date}</span>
                              <span>·</span>
                              <Clock size={10} className="text-ink-400" />
                              <span>{m.duration}</span>
                              <span>·</span>
                              <Users size={10} className="text-ink-400" />
                              <span>{m.participants}</span>
                            </div>
                          </div>
                          <ChevronRight size={14} className="text-ink-400" />
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* DECISIONS TAB */}
                {activeTab === "decisions" && (
                  <section className="animate-fade-in-up">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb size={13} className="text-ink-500" strokeWidth={2.1} />
                      <h3 className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-500">
                        All Decisions
                      </h3>
                      <span className="px-1.5 py-0.5 rounded-full bg-ink-100 text-ink-600 text-[9px] font-mono">
                        {client.decisions.length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {client.decisions.map((d) => (
                        <div
                          key={d.id}
                          className="flex items-start gap-3 p-3 rounded-xl bg-white border border-ink-200/70"
                        >
                          <div
                            className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                              d.status === "approved"
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-amber-50 text-amber-600"
                            }`}
                          >
                            {d.status === "approved" ? (
                              <Check size={10} strokeWidth={3} />
                            ) : (
                              <Clock size={10} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12.5px] font-medium text-ink-900 leading-snug">{d.decision}</p>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-ink-500">
                              <span>{d.meeting}</span>
                              <span>·</span>
                              <span>{d.date}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* ACTIONS TAB */}
                {activeTab === "actions" && (
                  <section className="animate-fade-in-up">
                    <div className="flex items-center gap-2 mb-3">
                      <ListChecks size={13} className="text-ink-500" strokeWidth={2.1} />
                      <h3 className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-500">
                        Action Items
                      </h3>
                      <span className="px-1.5 py-0.5 rounded-full bg-ink-100 text-ink-600 text-[9px] font-mono">
                        {client.actionItemsList.length}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {client.actionItemsList.map((item) => {
                        const p = priorityBadge(item.priority);
                        return (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 p-3 rounded-xl bg-white border border-ink-200/70 hover:border-brand-200/70 transition-all"
                          >
                            <button
                              onClick={() => onToggleAction(item.id)}
                              className="flex-shrink-0 transition-transform active:scale-90"
                            >
                              {item.completed || checkedActions.has(item.id) ? (
                                <div className="w-4 h-4 rounded-full bg-brand-600 flex items-center justify-center">
                                  <Check size={8} className="text-white" strokeWidth={3} />
                                </div>
                              ) : (
                                <div className="w-4 h-4 rounded-full border-2 border-ink-300 hover:border-brand-400 transition-colors" />
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-[12.5px] leading-snug ${
                                  item.completed || checkedActions.has(item.id)
                                    ? "text-ink-400 line-through"
                                    : "text-ink-800"
                                }`}
                              >
                                {item.task}
                              </p>
                              <div className="flex items-center gap-2 mt-1 text-[10px] text-ink-500">
                                <div
                                  className={`w-4 h-4 rounded-full bg-gradient-to-br ${item.ownerColor} flex items-center justify-center text-white text-[7px] font-semibold`}
                                >
                                  {item.ownerInitials}
                                </div>
                                <span>{item.owner}</span>
                                <span>·</span>
                                <span>Due {item.dueDate}</span>
                              </div>
                            </div>
                            <span
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded ${p.bg} ${p.text} text-[9px] font-medium flex-shrink-0`}
                            >
                              <span className={`w-1 h-1 rounded-full ${p.dot}`} />
                              {p.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* SOPs TAB */}
                {activeTab === "sops" && (
                  <section className="animate-fade-in-up">
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen size={13} className="text-ink-500" strokeWidth={2.1} />
                      <h3 className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-500">
                        Standard Operating Procedures
                      </h3>
                      <span className="px-1.5 py-0.5 rounded-full bg-ink-100 text-ink-600 text-[9px] font-mono">
                        {client.sopItems.length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {client.sopItems.map((sop) => {
                        const statusStyles = {
                          active: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Active" },
                          draft: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", label: "Draft" },
                          archived: { bg: "bg-ink-100", text: "text-ink-600", dot: "bg-ink-400", label: "Archived" },
                        };
                        const s = statusStyles[sop.status];
                        return (
                          <div
                            key={sop.id}
                            className="p-4 rounded-xl bg-white border border-ink-200/70 hover:border-brand-200/70 transition-all"
                          >
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <h4 className="text-[13px] font-semibold text-ink-900 leading-snug">
                                {sop.title}
                              </h4>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${s.bg} ${s.text} text-[9px] font-medium flex-shrink-0`}>
                                <span className={`w-1 h-1 rounded-full ${s.dot}`} />
                                {s.label}
                              </span>
                            </div>
                            <p className="text-[11.5px] text-ink-600 leading-relaxed">
                              {sop.description}
                            </p>
                            <p className="text-[10px] text-ink-500 mt-2">
                              Updated {sop.updatedAt}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* FILES TAB */}
                {activeTab === "files" && (
                  <section className="animate-fade-in-up">
                    <div className="flex items-center gap-2 mb-3">
                      <FolderOpen size={13} className="text-ink-500" strokeWidth={2.1} />
                      <h3 className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-500">
                        Files & Documents
                      </h3>
                      <span className="px-1.5 py-0.5 rounded-full bg-ink-100 text-ink-600 text-[9px] font-mono">
                        {client.files.length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {client.files.map((f) => (
                        <div
                          key={f.name}
                          className="flex items-center gap-3 p-3 rounded-xl bg-white border border-ink-200/70 hover:border-brand-200/70 transition-all group"
                        >
                          <div
                            className={`w-9 h-9 rounded-lg ${f.bgColor} border border-ink-200/60 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}
                          >
                            <f.icon size={15} className={f.color} strokeWidth={1.8} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12.5px] font-medium text-ink-900 truncate group-hover:text-brand-700 transition-colors">
                              {f.name}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] font-mono text-ink-500 uppercase">{f.type}</span>
                              <span className="text-ink-300">·</span>
                              <span className="text-[10px] text-ink-500">{f.size}</span>
                            </div>
                          </div>
                          <Download
                            size={13}
                            className="text-ink-400 group-hover:text-brand-600 transition-colors flex-shrink-0"
                          />
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

/* ============================================================
   AI MEMORY PANEL
   ============================================================ */
function AIMemoryPanel({
  clientName,
  aiQuestion,
  setAiQuestion,
  aiAnswer,
  aiLoading,
  aiPanelExpanded,
  onAskAI,
  onSampleQuestion,
  activePromptIndex,
  onResetAI,
}: {
  clientName: string;
  aiQuestion: string;
  setAiQuestion: (q: string) => void;
  aiAnswer: string;
  aiLoading: boolean;
  aiPanelExpanded: boolean;
  onAskAI: () => void;
  onSampleQuestion: (q: string, i: number) => void;
  activePromptIndex: number | null;
  onResetAI: () => void;
}) {
  return (
    <section className="animate-fade-in-up stagger-3">
      <div
        className={`rounded-xl bg-white border shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_1px_2px_rgba(15,17,21,0.04)] overflow-hidden transition-all duration-300 ${
          aiPanelExpanded
            ? "border-brand-200/80 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_2px_12px_rgba(108,92,231,0.10)]"
            : "border-ink-200/70"
        }`}
      >
        {/* Header */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-6 h-6 rounded-lg bg-brand-50 border border-brand-100/80 flex items-center justify-center">
              <Brain size={12} className="text-brand-600" strokeWidth={2.2} />
            </div>
            <h3 className="text-[12.5px] font-semibold text-ink-800">AI Client Memory</h3>
          </div>
          <p className="text-[10.5px] text-ink-500 leading-relaxed">
            Ask AgencyOS about {clientName}.
          </p>
        </div>

        {/* Input */}
        <div className="px-4 pb-3">
          <div className="relative">
            <input
              type="text"
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onAskAI()}
              placeholder="Ask about this client..."
              className="w-full pl-3 pr-10 py-2.5 rounded-lg bg-ink-50 border border-ink-200/60 text-[12px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-600/10 focus:border-brand-300 transition-all"
            />
            <button
              onClick={onAskAI}
              disabled={aiLoading || !aiQuestion.trim()}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-brand-600 hover:bg-brand-500 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {aiLoading ? (
                <div className="w-3.5 h-3.5 rounded-full border-1.5 border-white border-t-transparent animate-spin" />
              ) : (
                <Send size={11} strokeWidth={2.5} />
              )}
            </button>
          </div>
        </div>

        {/* Sample questions */}
        {!aiPanelExpanded && (
          <div className="px-4 pb-4 space-y-1">
            {[
              "What decisions has this client approved?",
              "What are all open action items?",
              "What were the last 5 meetings about?",
              "How is the client relationship doing?",
            ].map((q, i) => (
              <button
                key={i}
                onClick={() => onSampleQuestion(q, i)}
                className={`w-full text-left px-3 py-2 rounded-lg text-[11px] transition-all ${
                  activePromptIndex === i
                    ? "bg-brand-50 text-brand-700 border border-brand-200/70"
                    : "text-ink-500 hover:text-ink-700 hover:bg-ink-50 border border-transparent"
                }`}
              >
                <Quote size={9} className="inline mr-1.5 opacity-50" />
                {q}
              </button>
            ))}
          </div>
        )}

        {/* AI Answer */}
        {aiPanelExpanded && (
          <div className="px-4 pb-4 space-y-3 animate-fade-in-up">
            <div className="border-t border-ink-100/80" />

            {aiLoading ? (
              <div className="flex items-center gap-2.5 py-3">
                <div className="w-4 h-4 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
                <div className="space-y-1.5 flex-1">
                  <div className="skeleton h-2.5 w-full rounded" />
                  <div className="skeleton h-2.5 w-3/4 rounded" />
                </div>
              </div>
            ) : aiAnswer ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-brand-50 flex items-center justify-center">
                    <Brain size={10} className="text-brand-600" />
                  </div>
                  <span className="text-[10.5px] font-medium text-brand-700">AI Memory Response</span>
                  <button
                    onClick={onResetAI}
                    className="ml-auto p-0.5 rounded text-ink-400 hover:text-ink-700"
                  >
                    <X size={11} />
                  </button>
                </div>
                <div className="text-[12px] text-ink-700 leading-relaxed whitespace-pre-line">
                  {aiAnswer}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
