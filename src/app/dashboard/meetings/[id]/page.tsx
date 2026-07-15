"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Share2,
  Download,
  Lightbulb,
  ListChecks,
  MessageSquare,
  Search,
  Hash,
  User,
  Mic,
  Headphones,
  FileAudio,
  Brain,
  Send,
  Sparkles,
  MoreHorizontal,
  Check,
  Plus,
  X,
  Zap,
  ExternalLink,
  Quote,
  FolderOpen,
  Play,
  Volume2,
  Info,
  HardDrive,
  Disc3,
  AlertTriangle,
  HelpCircle,
  Tag,
} from "lucide-react";

/* ============================================================
   TYPES
   ============================================================ */
interface Participant {
  name: string;
  initials: string;
  role: string;
  speakingPercentage: number;
  timeSpoken: string;
  color: string;
}

interface Decision {
  id: string;
  decision: string;
  timestamp: string;
  owner: string;
  status: "approved" | "pending" | "deferred";
}

interface ActionItem {
  id: string;
  task: string;
  owner: string;
  ownerInitials: string;
  ownerColor: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
}

interface TranscriptEntry {
  speaker: string;
  speakerInitials: string;
  speakerColor: string;
  timestamp: string;
  text: string;
}

interface FileItem {
  name: string;
  type: string;
  size: string;
  icon: any;
  color: string;
  bgColor: string;
}

interface TopicTag {
  label: string;
  count: number;
}

interface RecordingInfo {
  fileName: string;
  fileType: string;
  fileSize: string;
  duration: string;
  codec: string;
  resolution: string | null;
  uploadedBy: string;
  uploadTime: string;
  status: string;
}

/* ============================================================
   EMPTY STATE (new users see clean no-data state)
   ============================================================ */
const EMPTY_MEETING: {
  id: string;
  title: string;
  date: string;
  dateShort: string;
  time: string;
  duration: string;
  client: string;
  status: "processing" | "completed" | "ready";
  summary: string;
  participants: Participant[];
  decisions: Decision[];
  actionItems: ActionItem[];
  topics: TopicTag[];
  transcript: TranscriptEntry[];
  files: FileItem[];
} = {
  id: "",
  title: "Untitled Meeting",
  date: "",
  dateShort: "",
  time: "",
  duration: "In progress",
  client: "",
  status: "processing",
  summary: "",
  participants: [],
  decisions: [],
  actionItems: [],
  topics: [],
  transcript: [],
  files: [],
};

const SPEAKER_COLORS = [
  "from-brand-500 to-brand-700",
  "from-amber-400 to-rose-500",
  "from-emerald-400 to-teal-600",
  "from-sky-400 to-indigo-600",
  "from-rose-400 to-pink-600",
  "from-violet-400 to-purple-600",
  "from-orange-400 to-red-500",
  "from-cyan-400 to-blue-600",
] as string[];

function getSpeakerIndex(speakerLabel: string): number {
  const match = speakerLabel.match(/Speaker ([A-Z])/);
  if (match) return match[1].charCodeAt(0) - 65;
  const numMatch = speakerLabel.match(/Speaker (\d+)/);
  if (numMatch) return parseInt(numMatch[1]) - 1;
  return 0;
}

function makeTranscriptEntry(text: string, timestamp: string, speakerLabel: string): TranscriptEntry {
  const idx = getSpeakerIndex(speakerLabel);
  const initial = speakerLabel.replace("Speaker ", "").charAt(0);
  return {
    speaker: speakerLabel,
    speakerInitials: initial,
    speakerColor: SPEAKER_COLORS[idx % SPEAKER_COLORS.length],
    timestamp,
    text,
  };
}

/* ============================================================
   PAGE
   ============================================================ */
export default function MeetingDetailPage() {
  const params = useParams();
  const meetingId = typeof params.id === "string" ? params.id : "";
  const [meeting, setMeeting] = useState(EMPTY_MEETING);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [transcriptSearch, setTranscriptSearch] = useState("");
  const [checkedActions, setCheckedActions] = useState<Set<string>>(new Set());
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPanelExpanded, setAiPanelExpanded] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const transcriptEntryRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activePromptIndex, setActivePromptIndex] = useState<number | null>(null);
  const [highlightedEntry, setHighlightedEntry] = useState<number | null>(null);

  // Real data states
  const [recordingInfo, setRecordingInfo] = useState<RecordingInfo | null>(null);
  const [realTranscript, setRealTranscript] = useState<TranscriptEntry[] | null>(null);
  const [copiedTranscript, setCopiedTranscript] = useState(false);
  const [realAnalysis, setRealAnalysis] = useState<Record<string, any> | null>(null);

  // Helpers
  const formatDuration = (secs: number | null) => {
    if (!secs) return "Unknown";
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins} min`;
  };
  const formatSize = (bytes: number) => {
    if (!bytes) return "Unknown";
    if (bytes >= 1024 * 1024 * 1024) return (bytes / 1024 ** 3).toFixed(2) + " GB";
    if (bytes >= 1024 * 1024) return (bytes / 1024 ** 2).toFixed(1) + " MB";
    return (bytes / 1024).toFixed(1) + " KB";
  };
  const formatDate = (d: string) => {
    if (!d) return "";
    const date = new Date(d);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // Fetch real meeting data — NO mock fallback
  useEffect(() => {
    const fetchMeeting = async () => {
      if (!meetingId) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/meetings/${meetingId}`);
        if (!res.ok) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (!data.meeting) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        const m = data.meeting;

        // Build recording info
        setRecordingInfo({
          fileName: m.original_file_name || m.file_name || "Unknown",
          fileType: m.file_type || "Unknown",
          fileSize: m.file_size ? formatSize(m.file_size) : "Unknown",
          duration: formatDuration(m.duration),
          codec: m.codec || "Unknown",
          resolution: m.resolution || null,
          uploadedBy: m.uploaded_by ? "You" : "Unknown",
          uploadTime: m.upload_date || m.created_at,
          status: m.status || "uploaded",
        });

        // Build meeting from API data only — no mock fallback
        const meetingData = (() => {
          const transcriptEntries: TranscriptEntry[] = Array.isArray(m.transcript)
            ? m.transcript.map((t: {timestamp?: string; text?: string; speaker?: string}, idx: number) => {
                const speakerLabel = t.speaker || `Speaker ${idx + 1}`;
                const spkIdx = getSpeakerIndex(speakerLabel);
                const initial = speakerLabel.replace("Speaker ", "").charAt(0);
                return {
                  speaker: speakerLabel,
                  speakerInitials: initial,
                  speakerColor: SPEAKER_COLORS[spkIdx % SPEAKER_COLORS.length],
                  timestamp: t.timestamp || "0:00",
                  text: t.text || "",
                };
              })
            : [];
          return {
            id: m.id || "",
            title: m.title || "Untitled Meeting",
            date: m.date || "",
            dateShort: formatDate(m.date || ""),
            time: "",
            duration: formatDuration(m.duration),
            client: m.client_name || "",
            status: (m.status === "ready" || m.status === "completed" ? "completed" : "processing") as "processing" | "completed" | "ready",
            summary: m.summary || "",
            participants: [] as Participant[],
            decisions: [] as Decision[],
            actionItems: [] as ActionItem[],
            topics: [] as TopicTag[],
            transcript: transcriptEntries,
            files: m.original_file_name
              ? [{
                  name: m.original_file_name,
                  type: m.file_type || "AUDIO",
                  size: formatSize(m.file_size),
                  icon: Headphones,
                  color: "text-brand-600",
                  bgColor: "bg-brand-50",
                }]
              : [],
          };
        })();
        setMeeting(meetingData);

        // Fetch real transcript from dedicated API (segments with timestamps)
        try {
          const transcriptRes = await fetch(`/api/meetings/${meetingId}/transcribe`);
          if (transcriptRes.ok) {
            const transcriptData = await transcriptRes.json();
            if (
              transcriptData.transcript &&
              transcriptData.transcript.status === "completed" &&
              transcriptData.transcript.segments?.length > 0
            ) {
              const segments = transcriptData.transcript.segments as Array<{
                start: number;
                end: number;
                text: string;
                speaker?: string;
              }>;
              const mapped: TranscriptEntry[] = segments.map((seg) => {
                const mins = Math.floor(seg.start / 60);
                const secs = Math.floor(seg.start % 60);
                const speakerLabel = seg.speaker || `Speaker ${(segments.indexOf(seg) % 26) + 1}`;
                return makeTranscriptEntry(
                  seg.text,
                  `${mins}:${String(secs).padStart(2, "0")}`,
                  speakerLabel
                );
              });
              setRealTranscript(mapped);

              // Also update meeting.transcript with real segments for copy/download
              setMeeting((prev) => ({
                ...prev,
                transcript: mapped,
              }));
            } else if (
              transcriptData.transcript &&
              transcriptData.transcript.status === "processing"
            ) {
              // Still processing — leave as-is
            }
          }
        } catch {
          // Transcript API unavailable
        }

        // Fetch real analysis
        try {
          const analyzeRes = await fetch(`/api/meetings/${meetingId}/analyze`);
          if (analyzeRes.ok) {
            const analyzeData = await analyzeRes.json();
            if (analyzeData.analysis && analyzeData.analysis.status === "completed") {
              setRealAnalysis(analyzeData.analysis);

              // If analysis has a summary, update meeting summary
              if (analyzeData.analysis.summary) {
                setMeeting((prev) => ({
                  ...prev,
                  summary: analyzeData.analysis.summary,
                }));
              }
            }
          }
        } catch {
          // Analysis API unavailable
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchMeeting();
  }, [meetingId]);

  const scrollToTranscriptEntry = (index: number) => {
    const el = transcriptEntryRefs.current[index];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedEntry(index);
      setTimeout(() => setHighlightedEntry(null), 2000);
    }
  };

  const toggleAction = (id: string) => {
    const next = new Set(checkedActions);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCheckedActions(next);
  };

  const handleAskAI = async () => {
    if (!aiQuestion.trim()) return;
    setAiLoading(true);
    setAiPanelExpanded(true);
    // TODO: Connect this to a real AI endpoint like /api/meetings/[id]/ask
    await new Promise((r) => setTimeout(r, 1200));
    const analysisText = analysis?.summary
      ? `Based on the meeting summary:\n\n${analysis.summary.slice(0, 500)}\n\nWhat would you like to know specifically about this meeting?`
      : `I can answer questions about "${meeting.title}" once the AI analysis is complete. Processing is still in progress.`;
    setAiAnswer(analysisText);
    setAiLoading(false);
  };

  const handleSampleQuestion = (q: string, index: number) => {
    setAiQuestion(q);
    setActivePromptIndex(index);
    setTimeout(() => handleAskAI(), 100);
  };

  const displayTranscript = realTranscript || meeting.transcript;

  // Local const for type narrowing in JSX (TS can't narrow state variables in JSX children)
  const analysis = realAnalysis;

  // Use real analysis data — NO mock fallback, just show empty if not available
  const analysisDecisions = (analysis?.decisions as Array<{title: string; description: string; confidence: number; owner?: string}> | undefined) || [];
  const displayDecisions = analysisDecisions.map((d, i) => ({
    id: `ad${i}`,
    decision: d.title,
    timestamp: "",
    owner: d.owner || "Unassigned",
    status: "approved" as const,
    description: d.description,
    confidence: d.confidence,
  }));

  const analysisActionItems = (analysis?.action_items as Array<{task: string; owner?: string; priority?: string; status?: string; due_date?: string}> | undefined) || [];
  const displayActionItems = analysisActionItems.map((a, i) => ({
    id: `aa${i}`,
    task: a.task,
    owner: a.owner || "Unassigned",
    ownerInitials: (a.owner || "UA").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase(),
    ownerColor: SPEAKER_COLORS[i % SPEAKER_COLORS.length],
    dueDate: a.due_date || "TBD",
    priority: (a.priority || "medium") as "high" | "medium" | "low",
    completed: a.status === "completed",
  }));

  const analysisTopics = (analysis?.topics as string[] | undefined) || [];
  const displayTopics = analysisTopics.map(t => ({ label: t, count: 1 }));

  const filteredTranscript = useMemo(() => {
    if (!transcriptSearch.trim()) return displayTranscript;
    const q = transcriptSearch.toLowerCase();
    return displayTranscript.filter(
      (t) =>
        t.text.toLowerCase().includes(q) ||
        t.speaker.toLowerCase().includes(q)
    );
  }, [transcriptSearch, displayTranscript]);

  const handleCopyTranscript = async () => {
    const text = displayTranscript
      .map((t) => `[${t.timestamp}] ${t.speaker}: ${t.text}`)
      .join("\n\n");
    await navigator.clipboard.writeText(text);
    setCopiedTranscript(true);
    setTimeout(() => setCopiedTranscript(false), 2000);
  };

  const handleDownloadTranscript = () => {
    const text = displayTranscript
      .map((t) => `[${t.timestamp}] ${t.speaker}: ${t.text}`)
      .join("\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${meeting.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_transcript.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escaped})`, "gi"));
    return parts.map((part, i) =>
      i % 2 === 1 ? (
        <mark key={i} className="bg-[#fef3c7] text-[#1d1d1f] rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const getDecisionStatusBadge = (status: Decision["status"]) => {
    switch (status) {
      case "approved":
        return { label: "Approved", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", icon: Check };
      case "pending":
        return { label: "Pending", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", icon: Clock };
      case "deferred":
        return { label: "Deferred", bg: "bg-ink-100", text: "text-ink-600", dot: "bg-ink-400", icon: MoreHorizontal };
    }
  };

  const priorityBadge = (p: ActionItem["priority"]) => {
    const map = {
      high: { label: "High", bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
      medium: { label: "Medium", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
      low: { label: "Low", bg: "bg-ink-100", text: "text-ink-600", dot: "bg-ink-400" },
    };
    return map[p];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <Sparkles size={18} className="text-white animate-pulse-soft" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-brand-400 border-2 border-white animate-pulse-soft" />
          </div>
          <span className="text-[13px] text-ink-500 font-medium">Loading meeting...</span>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-ink-100 flex items-center justify-center mx-auto mb-4">
            <MessageSquare size={24} className="text-ink-400" />
          </div>
          <h2 className="text-xl font-semibold text-ink-900 mb-2">Meeting not found</h2>
          <p className="text-[13.5px] text-ink-500 mb-6 max-w-sm">
            This meeting doesn&apos;t exist or has been deleted.
          </p>
          <Link
            href="/dashboard/meetings"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-ink-900 hover:bg-ink-800 text-white text-[13px] font-medium transition-all"
          >
            <ArrowLeft size={15} />
            Back to meetings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-50">
      {/* ========== STICKY HEADER ========== */}
      <div className="sticky top-0 z-30 bg-white/85 backdrop-glass border-b border-ink-200/60">
        <div className="px-6 lg:px-10 py-3 flex items-center justify-between">
          <Link
            href="/dashboard/meetings"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-medium text-ink-600 hover:text-ink-900 hover:bg-ink-100 transition-all -ml-2"
          >
            <ArrowLeft size={15} strokeWidth={2} />
            Back to meetings
          </Link>
          <div className="flex items-center gap-1.5">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-medium text-ink-600 hover:text-ink-900 hover:bg-ink-100 transition-all">
              <Share2 size={14} />
              Share
            </button>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-medium text-ink-600 hover:text-ink-900 hover:bg-ink-100 transition-all">
              <Download size={14} />
              Export
            </button>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-medium bg-ink-900 hover:bg-ink-800 text-white transition-all shadow-sm">
              <Headphones size={14} />
              Download Recording
            </button>
            <button className="p-1.5 rounded-lg text-ink-500 hover:text-ink-900 hover:bg-ink-100 transition-all">
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* ========== MAIN LAYOUT ========== */}
      <div className="px-6 lg:px-10 py-6 lg:py-8">
        <div className="max-w-[1440px] mx-auto flex gap-8 xl:gap-10">
          {/* ===== LEFT COLUMN — Main Content ===== */}
          <div className="flex-1 min-w-0 max-w-[860px] space-y-8 pb-16">
            {/* ---- MEETING HEADER ---- */}
            <section className="animate-fade-in-up">
              <div className="flex items-start gap-5">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-[0_4px_16px_-4px_rgba(108,92,231,0.35)] flex items-center justify-center">
                    <Sparkles size={24} className="text-white" strokeWidth={2} />
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white border-2 border-ink-50 flex items-center justify-center">
                    <Check size={10} className="text-emerald-500" strokeWidth={3} />
                  </span>
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <h1 className="text-[28px] lg:text-[32px] font-semibold tracking-[-0.02em] text-ink-900 leading-tight">
                    {meeting.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
                    {meeting.dateShort && (
                      <span className="inline-flex items-center gap-1.5 text-[13px] text-ink-500">
                        <Calendar size={14} className="text-ink-400" />
                        {meeting.dateShort}
                      </span>
                    )}
                    {meeting.duration && meeting.duration !== "Unknown" && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-ink-300" />
                        <span className="inline-flex items-center gap-1.5 text-[13px] text-ink-500">
                          <Clock size={14} className="text-ink-400" />
                          {meeting.duration}
                        </span>
                      </>
                    )}
                    {meeting.client && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-ink-300" />
                        <span className="inline-flex items-center gap-1.5 text-[13px] text-ink-500">
                          <Users size={14} className="text-ink-400" />
                          {meeting.client}
                        </span>
                      </>
                    )}
                    <span className="w-1 h-1 rounded-full bg-ink-300" />
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11.5px] font-medium ${
                      meeting.status === "completed" || meeting.status === "ready"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        meeting.status === "completed" || meeting.status === "ready"
                          ? "bg-emerald-500"
                          : "bg-amber-500"
                      }`} />
                      {meeting.status === "completed" || meeting.status === "ready" ? "Completed" : "Processing"}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* ---- RECORDING INFORMATION ---- */}
            {recordingInfo && (
              <section className="animate-fade-in-up">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-[#e8f0fb] border border-[#0071e3]/20 flex items-center justify-center">
                    <Info size={14} className="text-[#0071e3]" strokeWidth={2.2} />
                  </div>
                  <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">
                    Recording Information
                  </h2>
                </div>
                <div className="rounded-xl bg-white border border-[#e5e5e7] overflow-hidden">
                  {[
                    { label: "Duration", value: recordingInfo.duration, icon: Clock, accent: "text-[#0071e3]" },
                    { label: "Format", value: recordingInfo.fileType, icon: FileAudio, accent: "text-[#0071e3]" },
                    { label: "File Size", value: recordingInfo.fileSize, icon: HardDrive, accent: "text-[#86868b]" },
                    { label: "Codec", value: recordingInfo.codec, icon: Disc3, accent: "text-[#86868b]" },
                    ...(recordingInfo.resolution ? [{ label: "Resolution", value: recordingInfo.resolution, icon: FileAudio, accent: "text-[#86868b]" }] : []),
                    { label: "Uploaded By", value: recordingInfo.uploadedBy, icon: User, accent: "text-[#86868b]" },
                    { label: "Upload Time", value: new Date(recordingInfo.uploadTime).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }), icon: Calendar, accent: "text-[#86868b]" },
                    { label: "Status", value: recordingInfo.status.charAt(0).toUpperCase() + recordingInfo.status.slice(1), icon: Check, accent: "text-[#1d8348]" },
                  ].map((item, i, arr) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        className={`flex items-center justify-between px-5 py-3.5 ${
                          i < arr.length - 1 ? "border-b border-[#f0f0f2]" : ""
                        } hover:bg-[#fafafa] transition-colors`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={14} className="text-[#a1a1a6]" />
                          <span className="text-[13px] text-[#86868b]">{item.label}</span>
                        </div>
                        <span className={`text-[13px] font-medium ${item.accent}`}>{item.value}</span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ---- AI SUMMARY CARD --- Show only if summary exists */}
            {(analysis?.summary || meeting.summary) && (
              <section className="animate-fade-in-up stagger-1">
                <div className="rounded-2xl bg-gradient-to-br from-brand-50 to-white border border-brand-100/80 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_1px_2px_rgba(15,17,21,0.04),0_8px_24px_-8px_rgba(108,92,231,0.10)] p-6 lg:p-7">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-xl bg-brand-100 border border-brand-200/80 flex items-center justify-center">
                      <Brain size={16} className="text-brand-600" strokeWidth={2.2} />
                    </div>
                    <div>
                      <h2 className="text-[15px] font-semibold text-ink-900">AI Summary</h2>
                      <p className="text-[11.5px] text-ink-500">AgencyOS generated summary of the entire meeting</p>
                    </div>
                    <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-100/60 text-brand-700 text-[10.5px] font-medium">
                      <Zap size={11} />
                      Generated
                    </span>
                  </div>

                  {/* Executive Summary */}
                  <div className="mb-5 pb-5 border-b border-brand-100/60">
                    <div className="flex items-center gap-2 mb-2.5">
                      <div className="w-1 h-4 rounded-full bg-brand-500" />
                      <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-700">
                        Executive Summary
                      </h3>
                    </div>
                    <p className="text-[14.5px] text-ink-700 leading-[1.75]">
                      {analysis?.summary || meeting.summary}
                    </p>
                  </div>

                {/* Key Discussion Points */}
                {analysis && analysis.key_discussion && (analysis.key_discussion as Array<{topic: string; summary: string}>).length > 0 && (
                  <div className="mb-5 pb-5 border-b border-brand-100/60">
                    <div className="flex items-center gap-2 mb-2.5">
                      <div className="w-1 h-4 rounded-full bg-emerald-500" />
                      <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-emerald-700">
                        Key Discussion Points
                      </h3>
                    </div>
                    <ul className="space-y-3">
                      {(analysis.key_discussion as Array<{topic: string; summary: string}>).map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                          <div>
                            <span className="text-[13.5px] font-medium text-ink-800">{item.topic}: </span>
                            <span className="text-[13.5px] text-ink-600">{item.summary}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Next Steps */}
                {analysis && analysis.next_steps && (analysis.next_steps as string[]).length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2.5">
                      <div className="w-1 h-4 rounded-full bg-amber-500" />
                      <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-amber-700">
                        Next Steps
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {(analysis.next_steps as string[]).map((step, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-[13.5px] text-ink-700">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
            )}

            {/* ---- KEY DECISIONS ---- */}
            {displayDecisions.length > 0 && (
            <section className="animate-fade-in-up stagger-2">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100/80 flex items-center justify-center">
                    <Lightbulb size={14} className="text-emerald-600" strokeWidth={2.2} />
                  </div>
                  <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-ink-900">
                    Decisions Captured
                  </h2>
                  <span className="px-1.5 py-0.5 rounded-full bg-ink-100 text-ink-600 text-[10px] font-mono font-medium">
                    {displayDecisions.length}
                  </span>
                </div>
                <button className="text-[12px] font-medium text-brand-700 hover:text-brand-800 transition-colors">
                  View all →
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {displayDecisions.map((d) => {
                  const badge = getDecisionStatusBadge(d.status);
                  const BadgeIcon = badge.icon;
                  return (
                    <div
                      key={d.id}
                      className="group flex items-start gap-3.5 p-4 rounded-xl bg-white border border-ink-200/70 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_1px_2px_rgba(15,17,21,0.04)] hover:border-brand-200/80 hover:shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_2px_8px_rgba(108,92,231,0.08)] transition-all cursor-default"
                    >
                      <div className="mt-0.5 w-6 h-6 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                        <Check size={12} className="text-emerald-600" strokeWidth={3} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13.5px] font-medium text-ink-900 leading-snug">
                          {d.decision}
                        </p>
                        {'description' in d && (d as {description?: string}).description && (
                          <p className="text-[12px] text-ink-500 mt-1.5 leading-relaxed">
                            {(d as {description?: string}).description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {d.timestamp && (
                            <>
                              <span className="inline-flex items-center gap-1 text-[11px] text-ink-500">
                                <Clock size={10} className="text-ink-400" />
                                {d.timestamp}
                              </span>
                              <span className="text-ink-300">·</span>
                            </>
                          )}
                          <span className="inline-flex items-center gap-1 text-[11px] text-ink-500">
                            <User size={10} className="text-ink-400" />
                            {d.owner}
                          </span>
                          {'confidence' in d && (d as {confidence?: number}).confidence !== undefined && (
                            <>
                              <span className="text-ink-300">·</span>
                              <span className="inline-flex items-center gap-1 text-[11px] text-brand-600 font-medium">
                                <Zap size={10} />
                                {Math.round(((d as {confidence?: number}).confidence || 0) * 100)}% confidence
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${badge.bg} ${badge.text} text-[10px] font-medium flex-shrink-0`}>
                        <BadgeIcon size={10} strokeWidth={2.5} />
                        {badge.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
            )}

            {/* ---- ACTION ITEMS ---- */}
            {displayActionItems.length > 0 && (
            <section className="animate-fade-in-up stagger-3">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-100/80 flex items-center justify-center">
                    <ListChecks size={14} className="text-rose-600" strokeWidth={2.2} />
                  </div>
                  <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-ink-900">
                    Action Items
                  </h2>
                  <span className="px-1.5 py-0.5 rounded-full bg-ink-100 text-ink-600 text-[10px] font-mono font-medium">
                    {displayActionItems.length}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-ink-500">
                  <span className="font-medium text-ink-700">{displayActionItems.filter((a) => !a.completed).length}</span>
                  <span>open</span>
                  <span className="text-ink-300">·</span>
                  <span className="font-medium text-ink-700">{displayActionItems.filter((a) => a.completed).length}</span>
                  <span>done</span>
                </div>
              </div>

              <div className="rounded-xl bg-white border border-ink-200/70 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_1px_2px_rgba(15,17,21,0.04)] divide-y divide-ink-100/80 overflow-hidden">
                {displayActionItems.map((item) => {
                  const p = priorityBadge(item.priority);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-ink-50/60 transition-colors group"
                    >
                      <button
                        onClick={() => toggleAction(item.id)}
                        className="flex-shrink-0 transition-transform active:scale-90"
                      >
                        {item.completed || checkedActions.has(item.id) ? (
                          <div className="w-5 h-5 rounded-full bg-brand-600 flex items-center justify-center shadow-sm">
                            <Check size={11} className="text-white" strokeWidth={3} />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-ink-300 group-hover:border-brand-400 transition-colors" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-[13.5px] leading-snug ${
                            item.completed || checkedActions.has(item.id)
                              ? "text-ink-400 line-through"
                              : "text-ink-800"
                          }`}
                        >
                          {item.task}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-ink-500">
                          <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${item.ownerColor} flex items-center justify-center text-white text-[8px] font-semibold`}>
                            {item.ownerInitials}
                          </div>
                          <span>{item.owner}</span>
                          <span className="text-ink-300">·</span>
                          <span>Due {item.dueDate}</span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded ${p.bg} ${p.text} text-[10px] font-medium flex-shrink-0`}>
                        <span className={`w-1 h-1 rounded-full ${p.dot}`} />
                        {p.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
            )}

            {/* ---- TOPICS DISCUSSED ---- */}
            {displayTopics.length > 0 && (
            <section className="animate-fade-in-up stagger-4">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 rounded-lg bg-violet-50 border border-violet-100/80 flex items-center justify-center">
                  <Hash size={14} className="text-violet-600" strokeWidth={2.2} />
                </div>
                <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-ink-900">
                  Topics Discussed
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {displayTopics.map((topic) => (
                  <span
                    key={topic.label}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-ink-200/70 text-[12.5px] font-medium text-ink-700 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_1px_2px_rgba(15,17,21,0.04)] hover:border-brand-200/70 hover:text-brand-700 hover:bg-brand-50/50 transition-all cursor-default"
                  >
                    {topic.label}
                    <span className="px-1 py-0.5 rounded-full bg-ink-100 text-ink-500 text-[9.5px] font-mono">
                      {topic.count}
                    </span>
                  </span>
                ))}
              </div>
            </section>
            )}

            {/* ---- RISKS & BLOCKERS ---- */}
            {analysis && analysis.risks && (analysis.risks as Array<{risk: string; severity: string; mitigation?: string}>).length > 0 && (
              <section className="animate-fade-in-up">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-orange-50 border border-orange-100/80 flex items-center justify-center">
                    <AlertTriangle size={14} className="text-orange-600" strokeWidth={2.2} />
                  </div>
                  <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-ink-900">
                    Risks & Blockers
                  </h2>
                  <span className="px-1.5 py-0.5 rounded-full bg-ink-100 text-ink-600 text-[10px] font-mono font-medium">
                    {(analysis.risks as Array<{risk: string; severity: string; mitigation?: string}>).length}
                  </span>
                </div>
                <div className="rounded-xl bg-white border border-ink-200/70 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_1px_2px_rgba(15,17,21,0.04)] divide-y divide-ink-100/80 overflow-hidden">
                  {(analysis.risks as Array<{risk: string; severity: string; mitigation?: string}>).map((risk, i) => {
                    const severityColor = risk.severity === "high" ? "bg-rose-50 text-rose-700" : risk.severity === "medium" ? "bg-amber-50 text-amber-700" : "bg-ink-100 text-ink-600";
                    return (
                      <div key={i} className="px-5 py-3.5 hover:bg-ink-50/60 transition-colors">
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-[13.5px] text-ink-800">{risk.risk}</p>
                            {risk.mitigation && (
                              <p className="text-[12px] text-ink-500 mt-1">Mitigation: {risk.mitigation}</p>
                            )}
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0 ${severityColor}`}>
                            {risk.severity}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ---- QUESTIONS RAISED ---- */}
            {analysis && analysis.questions && (analysis.questions as string[]).length > 0 && (
              <section className="animate-fade-in-up">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-sky-50 border border-sky-100/80 flex items-center justify-center">
                    <HelpCircle size={14} className="text-sky-600" strokeWidth={2.2} />
                  </div>
                  <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-ink-900">
                    Questions Raised
                  </h2>
                </div>
                <div className="rounded-xl bg-white border border-ink-200/70 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_1px_2px_rgba(15,17,21,0.04)] divide-y divide-ink-100/80 overflow-hidden">
                  {(analysis.questions as string[]).map((q, i) => (
                    <div key={i} className="px-5 py-3.5 hover:bg-ink-50/60 transition-colors">
                      <div className="flex items-start gap-3">
                        <span className="mt-1 w-5 h-5 rounded-full bg-sky-50 border border-sky-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] font-bold text-sky-600">?</span>
                        </span>
                        <p className="text-[13.5px] text-ink-800">{q}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ---- KEYWORDS ---- */}
            {analysis && analysis.keywords && (analysis.keywords as string[]).length > 0 && (
              <section className="animate-fade-in-up">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-pink-50 border border-pink-100/80 flex items-center justify-center">
                    <Tag size={14} className="text-pink-600" strokeWidth={2.2} />
                  </div>
                  <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-ink-900">
                    Keywords
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(analysis.keywords as string[]).map((kw, i) => (
                    <span key={i} className="inline-flex items-center px-3 py-1.5 rounded-full bg-white border border-ink-200/70 text-[12px] font-medium text-ink-600 hover:border-brand-200/70 hover:text-brand-700 hover:bg-brand-50/50 transition-all cursor-default">
                      {kw}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* ---- PARTICIPANTS (hidden unless diarization data is available) ---- */}
            {meeting.participants.length > 0 && (
            <section className="animate-fade-in-up stagger-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-sky-50 border border-sky-100/80 flex items-center justify-center">
                    <Users size={14} className="text-sky-600" strokeWidth={2.2} />
                  </div>
                  <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-ink-900">
                    Participants
                  </h2>
                  <span className="px-1.5 py-0.5 rounded-full bg-ink-100 text-ink-600 text-[10px] font-mono font-medium">
                    {meeting.participants.length}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-white border border-ink-200/70 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_1px_2px_rgba(15,17,21,0.04)] divide-y divide-ink-100/80 overflow-hidden">
                {meeting.participants.map((p, i) => (
                  <div
                    key={p.name}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-ink-50/60 transition-colors"
                  >
                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-br ${p.color} flex items-center justify-center text-white text-[12px] font-semibold shadow-sm flex-shrink-0`}
                    >
                      {p.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[14px] font-medium text-ink-900">
                          {p.name}
                        </p>
                        {i === 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[9.5px] font-medium">
                            Host
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-ink-500">{p.role}</p>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="hidden sm:block text-right">
                        <p className="text-[11px] font-mono text-ink-500">{p.timeSpoken}</p>
                        <div className="flex items-center gap-1.5 mt-0.5 justify-end">
                          <div className="w-16 h-1.5 rounded-full bg-ink-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-700"
                              style={{ width: `${p.speakingPercentage}%` }}
                            />
                          </div>
                          <span className="text-[10.5px] font-mono text-ink-400 w-6 text-right">
                            {p.speakingPercentage}%
                          </span>
                        </div>
                      </div>
                      <div className="flex sm:hidden items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-ink-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-700"
                            style={{ width: `${p.speakingPercentage}%` }}
                          />
                        </div>
                        <span className="text-[10.5px] font-mono text-ink-500">
                          {p.speakingPercentage}%
                        </span>
                      </div>
                      <Mic size={13} className="text-ink-300" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
            )}

            {/* ---- TRANSCRIPT ---- */}
            {displayTranscript.length > 0 && (
            <section className="animate-fade-in-up stagger-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-brand-50 border border-brand-100/80 flex items-center justify-center">
                    <MessageSquare size={14} className="text-brand-600" strokeWidth={2.2} />
                  </div>
                  <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-ink-900">
                    Full Transcript
                  </h2>
                  <span className="px-1.5 py-0.5 rounded-full bg-ink-100 text-ink-600 text-[10px] font-mono font-medium">
                    {displayTranscript.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyTranscript}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-ink-600 hover:text-ink-900 hover:bg-ink-100 transition-all"
                  >
                    <Check size={13} className={copiedTranscript ? "text-emerald-500" : ""} />
                    {copiedTranscript ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-white border border-ink-200/70 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_1px_2px_rgba(15,17,21,0.04)] overflow-hidden">
                {/* Search */}
                <div className="px-5 py-3 border-b border-ink-100/80">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                    <input
                      type="text"
                      value={transcriptSearch}
                      onChange={(e) => setTranscriptSearch(e.target.value)}
                      placeholder="Search transcript..."
                      className="w-full pl-9 pr-4 py-2 rounded-lg bg-ink-50 border border-ink-200/60 text-[13px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-600/10 focus:border-brand-300 transition-all"
                    />
                    {transcriptSearch && (
                      <button
                        onClick={() => setTranscriptSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-ink-400 hover:text-ink-700"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Transcript entries */}
                <div
                  ref={transcriptRef}
                  className="divide-y divide-ink-100/50 max-h-[600px] overflow-y-auto"
                >
                  {filteredTranscript.length === 0 ? (
                    <div className="py-12 text-center">
                      <Search size={20} className="text-ink-300 mx-auto mb-2" />
                      <p className="text-[13px] text-ink-500">No matching entries found</p>
                    </div>
                  ) : (
                    filteredTranscript.map((entry, i) => {
                      const globalIndex = displayTranscript.findIndex(
                        (t) => t.timestamp === entry.timestamp && t.text === entry.text
                      );
                      return (
                        <div
                          key={i}
                          ref={(el) => { transcriptEntryRefs.current[globalIndex >= 0 ? globalIndex : i] = el; }}
                          className={`flex items-start gap-4 px-5 py-4 transition-colors group scroll-mt-24 ${
                            highlightedEntry === (globalIndex >= 0 ? globalIndex : i)
                              ? "bg-brand-50/70"
                              : "hover:bg-ink-50/60"
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full bg-gradient-to-br ${entry.speakerColor} flex items-center justify-center text-white text-[10px] font-semibold flex-shrink-0 mt-0.5`}
                          >
                            {entry.speakerInitials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[13px] font-semibold text-ink-900">
                                {entry.speaker}
                              </span>
                              <span className="text-[10.5px] font-mono text-ink-400">
                                {entry.timestamp}
                              </span>
                              <button
                                onClick={() => scrollToTranscriptEntry(globalIndex >= 0 ? globalIndex : i)}
                                className="ml-auto opacity-0 group-hover:opacity-100 p-1 rounded text-ink-400 hover:text-brand-600 hover:bg-brand-50 transition-all"
                                title="Jump to timestamp"
                              >
                                <ExternalLink size={11} />
                              </button>
                            </div>
                            <p className="text-[13.5px] text-ink-700 leading-relaxed">
                              {highlightText(entry.text, transcriptSearch)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-ink-100/80 bg-ink-50/50 flex items-center justify-between">
                  <p className="text-[11.5px] text-ink-500">
                    {filteredTranscript.length} of {displayTranscript.length} entries
                    {transcriptSearch && (
                      <button
                        onClick={() => setTranscriptSearch("")}
                        className="ml-2 text-brand-600 hover:text-brand-700 font-medium"
                      >
                        Clear filter
                      </button>
                    )}
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleCopyTranscript}
                      className="text-[11.5px] font-medium text-ink-600 hover:text-ink-900 transition-colors"
                    >
                      {copiedTranscript ? "Copied!" : "Copy transcript"}
                    </button>
                    <button
                      onClick={handleDownloadTranscript}
                      className="text-[11.5px] font-medium text-ink-600 hover:text-ink-900 transition-colors"
                    >
                      Download transcript →
                    </button>
                  </div>
                </div>
              </div>
            </section>
            )}

            {/* ---- FILES (only original recording) ---- */}
            {meeting.files.length > 0 && (
            <section className="animate-fade-in-up stagger-7">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-100/80 flex items-center justify-center">
                    <FolderOpen size={14} className="text-amber-600" strokeWidth={2.2} />
                  </div>
                  <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-ink-900">
                    Files & Attachments
                  </h2>
                  <span className="px-1.5 py-0.5 rounded-full bg-ink-100 text-ink-600 text-[10px] font-mono font-medium">
                    {meeting.files.length}
                  </span>
                </div>
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-brand-700 hover:text-brand-800 hover:bg-brand-50 transition-all">
                  <Plus size={13} />
                  Add file
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {meeting.files.map((file) => (
                  <button
                    key={file.name}
                    className="group flex items-center gap-3.5 p-4 rounded-xl bg-white border border-ink-200/70 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_1px_2px_rgba(15,17,21,0.04)] hover:border-brand-200/80 hover:shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_2px_8px_rgba(108,92,231,0.08)] transition-all text-left"
                  >
                    <div className={`w-10 h-10 rounded-xl ${file.bgColor} border border-ink-200/60 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                      <file.icon size={18} className={file.color} strokeWidth={1.8} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-ink-900 truncate group-hover:text-brand-700 transition-colors">
                        {file.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] font-mono text-ink-500 uppercase">
                          {file.type}
                        </span>
                        <span className="text-ink-300">·</span>
                        <span className="text-[11px] text-ink-500">
                          {file.size}
                        </span>
                      </div>
                    </div>
                    <Download size={14} className="text-ink-400 group-hover:text-brand-600 transition-colors flex-shrink-0" />
                  </button>
                ))}
              </div>
            </section>
            )}
          </div>

          {/* ===== RIGHT COLUMN — Sidebar ===== */}
          <div className="hidden xl:block w-[320px] flex-shrink-0 space-y-6">
            {/* ---- Quick Insights ---- */}
            <div className="sticky top-[73px] space-y-6">
              <section className="animate-fade-in-up">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-ink-100 flex items-center justify-center">
                    <Brain size={12} className="text-ink-600" strokeWidth={2.2} />
                  </div>
                  <h3 className="text-[13px] font-semibold text-ink-800">Meeting Intelligence</h3>
                </div>
                <div className="rounded-xl bg-white border border-ink-200/70 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_1px_2px_rgba(15,17,21,0.04)] p-4 space-y-3">
                  {[
                    { label: "Decisions Found", value: displayDecisions.length, icon: Lightbulb, accent: "emerald" },
                    { label: "Action Items", value: displayActionItems.length, icon: ListChecks, accent: "rose" },
                    { label: "Topics", value: displayTopics.length, icon: Hash, accent: "violet" },
                    { label: "Participants", value: meeting.participants.length, icon: Users, accent: "sky" },
                    { label: "Duration", value: meeting.duration, icon: Clock, accent: "amber" },
                    { label: "Sentiment", value: analysis ? ((analysis.sentiment as Record<string, string>)?.overall || "Neutral") : "Positive", icon: Lightbulb, accent: "emerald" },
                  ].map((m) => {
                    const accentMap: Record<string, string> = {
                      emerald: "bg-emerald-50 text-emerald-600",
                      rose: "bg-rose-50 text-rose-600",
                      violet: "bg-violet-50 text-violet-600",
                      sky: "bg-sky-50 text-sky-600",
                      amber: "bg-amber-50 text-amber-600",
                    };
                    const Icon = m.icon;
                    return (
                      <div
                        key={m.label}
                        className="flex items-center gap-3 py-2 first:pt-0 last:pb-0 border-b border-ink-100/60 last:border-0"
                      >
                        <div className={`w-8 h-8 rounded-lg ${accentMap[m.accent]} flex items-center justify-center`}>
                          <Icon size={14} strokeWidth={2.1} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-ink-500">{m.label}</p>
                          <p className="text-[15px] font-semibold text-ink-900">{m.value}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* ---- AI Ask Panel ---- */}
              <section className="animate-fade-in-up stagger-1">
                <div className={`rounded-xl bg-white border shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_1px_2px_rgba(15,17,21,0.04)] overflow-hidden transition-all duration-300 ${
                  aiPanelExpanded
                    ? "border-brand-200/80 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_2px_12px_rgba(108,92,231,0.10)]"
                    : "border-ink-200/70"
                }`}>
                  {/* Header */}
                  <div className="px-4 pt-4 pb-2">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="w-6 h-6 rounded-lg bg-brand-50 border border-brand-100/80 flex items-center justify-center">
                        <MessageSquare size={12} className="text-brand-600" strokeWidth={2.2} />
                      </div>
                      <h3 className="text-[13px] font-semibold text-ink-800">Ask This Meeting</h3>
                    </div>
                    <p className="text-[11px] text-ink-500 leading-relaxed">
                      Ask a question about this meeting...
                    </p>
                  </div>

                  {/* Input */}
                  <div className="px-4 pb-3">
                    <div className="relative">
                      <input
                        type="text"
                        value={aiQuestion}
                        onChange={(e) => setAiQuestion(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAskAI()}
                        placeholder="Ask a question about this meeting..."
                        className="w-full pl-3 pr-10 py-2.5 rounded-lg bg-ink-50 border border-ink-200/60 text-[12.5px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-600/10 focus:border-brand-300 transition-all"
                      />
                      <button
                        onClick={handleAskAI}
                        disabled={aiLoading || !aiQuestion.trim()}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-brand-600 hover:bg-brand-500 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {aiLoading ? (
                          <div className="w-3.5 h-3.5 rounded-full border-1.5 border-white border-t-transparent animate-spin" />
                        ) : (
                          <Send size={12} strokeWidth={2.5} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Sample questions */}
                  {!aiPanelExpanded && (
                    <div className="px-4 pb-4 space-y-1.5">
                      {[
                        "What was decided about pricing?",
                        "Who owns the homepage redesign?",
                        "What are the next steps?",
                        "What was the overall sentiment?",
                      ].map((q, i) => (
                        <button
                          key={i}
                          onClick={() => handleSampleQuestion(q, i)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-[11.5px] transition-all ${
                            activePromptIndex === i
                              ? "bg-brand-50 text-brand-700 border border-brand-200/70"
                              : "text-ink-500 hover:text-ink-700 hover:bg-ink-50 border border-transparent"
                          }`}
                        >
                          <Quote size={10} className="inline mr-1.5 opacity-50" />
                          {q}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* AI Answer (expanded) */}
                  {aiPanelExpanded && (
                    <div className="px-4 pb-4 space-y-3 animate-fade-in-up">
                      {/* Divider */}
                      <div className="border-t border-ink-100/80" />

                      {aiLoading ? (
                        <div className="flex items-center gap-2.5 py-3">
                          <div className="w-5 h-5 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
                          <div className="space-y-1.5 flex-1">
                            <div className="skeleton h-3 w-full rounded" />
                            <div className="skeleton h-3 w-3/4 rounded" />
                          </div>
                        </div>
                      ) : aiAnswer ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-md bg-brand-50 flex items-center justify-center">
                              <Brain size={11} className="text-brand-600" />
                            </div>
                            <span className="text-[11px] font-medium text-brand-700">AI Response</span>
                            <button
                              onClick={() => {
                                setAiPanelExpanded(false);
                                setAiAnswer("");
                                setAiQuestion("");
                                setActivePromptIndex(null);
                              }}
                              className="ml-auto p-0.5 rounded text-ink-400 hover:text-ink-700"
                            >
                              <X size={12} />
                            </button>
                          </div>
                          <div className="text-[12.5px] text-ink-700 leading-relaxed whitespace-pre-line">
                            {aiAnswer}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              </section>

              {/* ---- Mini recording player ---- */}
              <section className="animate-fade-in-up stagger-2">
                <div className="rounded-xl bg-white border border-ink-200/70 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_1px_2px_rgba(15,17,21,0.04)] p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <button className="w-10 h-10 rounded-full bg-ink-900 hover:bg-ink-800 text-white flex items-center justify-center transition-all shadow-sm hover:shadow-md">
                      <Play size={16} className="ml-0.5" fill="white" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-medium text-ink-900 truncate">Recording</p>
                      <p className="text-[10.5px] text-ink-500">45:00 · Full meeting</p>
                    </div>
                    <Volume2 size={15} className="text-ink-400" />
                  </div>
                  {/* Audio waveform */}
                  <div className="flex items-end gap-[2px] h-8">
                    {Array.from({ length: 40 }).map((_, i) => {
                      const h = 4 + Math.abs(Math.sin(i * 0.6 + 2)) * 20 + Math.random() * 4;
                      return (
                        <span
                          key={i}
                          className="flex-1 rounded-full bg-brand-400/80"
                          style={{ height: `${h}px` }}
                        />
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] font-mono text-ink-400">00:00</span>
                    <span className="text-[10px] font-mono text-ink-400">45:00</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
