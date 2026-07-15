"use client";

import { useState, useRef, useEffect, DragEvent, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  X,
  Video,
  HardDrive,
  FileAudio,
  CheckCircle2,
  CloudUpload,
  Sparkles,
  Clock,
  ChevronRight,
  Loader2,
  AlertCircle,
  Trash2,
  Calendar,
  RotateCcw,
  MessageCircle,
  Phone,
  Zap,
  Globe,
  Headphones,
  Bot,
  FileText,
  Download,
  Eye,
  Music,
  Lock,
  Send,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Meeting } from "@/lib/types/database";

/* ─── CONFIG ─── */
const ACCEPTED_TYPES = [".mp3", ".mp4", ".wav", ".m4a", ".aac", ".webm", ".ogg", ".zip"];
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2 GB

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English", hi: "Hindi", ur: "Urdu", bn: "Bengali",
  te: "Telugu", ta: "Tamil", mr: "Marathi", gu: "Gujarati",
  pa: "Punjabi", kn: "Kannada", ml: "Malayalam", or: "Odia",
  as: "Assamese", ne: "Nepali", sd: "Sindhi", ks: "Kashmiri",
  sa: "Sanskrit", kok: "Konkani", bho: "Bhojpuri", mai: "Maithili",
};

/* ─── SOURCE CARDS ─── */
const IMPORT_SOURCES = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    description: "Audio, voice notes, & exported chats",
    icon: MessageCircle,
    gradient: "from-emerald-500 to-green-600",
    accent: "emerald",
    badge: "India First",
  },
  {
    id: "meet",
    label: "Google Meet",
    description: "Drive or Meet recordings",
    icon: Video,
    gradient: "from-emerald-400 to-teal-600",
    accent: "teal",
    badge: null,
  },
  {
    id: "zoom",
    label: "Zoom",
    description: "Cloud or local recordings",
    icon: Video,
    gradient: "from-sky-400 to-blue-600",
    accent: "blue",
    badge: null,
  },
  {
    id: "teams",
    label: "Microsoft Teams",
    description: "Stream or local Teams files",
    icon: Video,
    gradient: "from-violet-400 to-indigo-600",
    accent: "violet",
    badge: null,
  },
  {
    id: "telegram",
    label: "Telegram",
    description: "Voice notes & recordings",
    icon: Send,
    gradient: "from-sky-400 to-cyan-600",
    accent: "cyan",
    badge: null,
  },
  {
    id: "phone",
    label: "Phone Calls",
    description: "Call recordings & voicemails",
    icon: Phone,
    gradient: "from-rose-400 to-pink-600",
    accent: "rose",
    badge: null,
  },
  {
    id: "local",
    label: "Local Files",
    description: "MP3, MP4, WAV, AAC & more",
    icon: HardDrive,
    gradient: "from-[#0071e3] to-[#0052a8]",
    accent: "blue",
    badge: null,
    default: true,
  },
];

/* ─── PROCESSING MESSAGES ─── */
const PROCESSING_PHASES = [
  {
    id: "uploaded",
    icon: CloudUpload,
    label: "Upload complete",
    message: "File saved to secure storage",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    id: "detecting_language",
    icon: Globe,
    label: "Detecting language...",
    message: "AI is identifying the spoken languages",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
  {
    id: "reading",
    icon: Music,
    label: "Reading file...",
    message: "Analyzing audio format & quality",
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
  },
  {
    id: "processing_audio",
    icon: Headphones,
    label: "Processing audio...",
    message: "Enhancing speech clarity",
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-200",
  },
  {
    id: "transcribing",
    icon: FileText,
    label: "Generating transcript...",
    message: "Converting speech to text",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
  },
  {
    id: "understanding_speakers",
    icon: Bot,
    label: "Understanding speakers...",
    message: "Identifying who said what",
    color: "text-rose-600",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
  },
  {
    id: "finding_decisions",
    icon: Zap,
    label: "Finding decisions...",
    message: "Extracting key decisions & action items",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
  },
  {
    id: "generating_summary",
    icon: Sparkles,
    label: "Building summary...",
    message: "Creating AI meeting summary",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
  },
  {
    id: "building_brain",
    icon: Bot,
    label: "Building Company Brain...",
    message: "Indexing into your knowledge graph",
    color: "text-[#0071e3]",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    id: "finalizing",
    icon: Sparkles,
    label: "Almost finished...",
    message: "Finalizing everything for you",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
];

/* ─── WHAT WE GENERATE ─── */
const WHAT_WE_GENERATE = [
  { title: "Full Transcript", description: "Word-perfect transcript with speaker labels & timestamps" },
  { title: "AI Summary", description: "Concise executive summary of the entire meeting" },
  { title: "Key Decisions", description: "Every decision extracted with context" },
  { title: "Action Items", description: "Tasks assigned to people with deadlines & priority" },
  { title: "Questions Raised", description: "Unanswered questions & discussion points" },
  { title: "Company Brain", description: "Everything indexed into your searchable knowledge graph" },
];

type UploadState = "idle" | "select_source" | "uploading" | "processing" | "success" | "error";
type SourceId = "whatsapp" | "meet" | "zoom" | "teams" | "telegram" | "phone" | "local";

/* ─── HELPERS ─── */
function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024 * 1024) return (bytes / 1024 ** 3).toFixed(2) + " GB";
  if (bytes >= 1024 * 1024) return (bytes / 1024 ** 2).toFixed(1) + " MB";
  return (bytes / 1024).toFixed(1) + " KB";
}

function formatDuration(seconds: number | null) {
  if (!seconds) return null;
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

function statusColor(status: string) {
  switch (status) {
    case "uploaded": return "bg-[#e8f0fb] text-[#0071e3] border border-[#0071e3]/15";
    case "processing": return "bg-[#fef9ec] text-[#9a6700] border border-[#9a6700]/15";
    case "completed": return "bg-[#eafaf1] text-[#1d8348] border border-[#1d8348]/15";
    case "failed": return "bg-[#fdf2f0] text-[#c0392b] border border-[#c0392b]/15";
    default: return "bg-[#f5f5f7] text-[#86868b] border border-[#e5e5e7]";
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "completed": return "Ready";
    default: return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

const accentColors: Record<string, { bg: string; text: string; ring: string; border: string }> = {
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200", border: "border-emerald-200" },
  teal: { bg: "bg-teal-50", text: "text-teal-700", ring: "ring-teal-200", border: "border-teal-200" },
  blue: { bg: "bg-blue-50", text: "text-blue-700", ring: "ring-blue-200", border: "border-blue-200" },
  violet: { bg: "bg-violet-50", text: "text-violet-700", ring: "ring-violet-200", border: "border-violet-200" },
  cyan: { bg: "bg-cyan-50", text: "text-cyan-700", ring: "ring-cyan-200", border: "border-cyan-200" },
  rose: { bg: "bg-rose-50", text: "text-rose-700", ring: "ring-rose-200", border: "border-rose-200" },
};

/* ═══════════════════════════════════════
   PAGE COMPONENT
   ═══════════════════════════════════════ */
export default function UploadMeetingPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [meetingTitle, setMeetingTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split("T")[0]);
  const [activeSource, setActiveSource] = useState<SourceId | null>(null);
  const [showWhatsAppGuide, setShowWhatsAppGuide] = useState(false);

  // Processing state
  const [processingPhase, setProcessingPhase] = useState(0);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [processingMeetingId, setProcessingMeetingId] = useState<string | null>(null);
  const [finishedMeetingId, setFinishedMeetingId] = useState<string | null>(null);
  const [extractedMetadata, setExtractedMetadata] = useState<{
    duration: number | null;
    codec: string | null;
    resolution: string | null;
    language: string | null;
    languageName: string | null;
  } | null>(null);

  // Recent uploads
  const [recentMeetings, setRecentMeetings] = useState<Meeting[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  useEffect(() => { fetchRecentMeetings(); }, []);

  // Auto-redirect to meeting workspace
  useEffect(() => {
    if (uploadState === "success" && finishedMeetingId) {
      const timer = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push(`/dashboard/meetings/${finishedMeetingId}`);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [uploadState, finishedMeetingId, router]);

  const fetchRecentMeetings = async () => {
    try {
      const res = await fetch("/api/meetings?limit=5");
      if (res.ok) {
        const data = await res.json();
        setRecentMeetings((data.meetings || []).slice(0, 5));
      }
    } catch { /* ignore */ } finally { setRecentLoading(false); }
  };

  /* ─── FILE HANDLING ─── */
  const handleFileSelect = (selectedFile: File | null) => {
    if (!selectedFile) return;

    const ext = "." + (selectedFile.name.split(".").pop() || "").toLowerCase();
    if (!ACCEPTED_TYPES.includes(ext)) {
      setError(`Unsupported file type (.${ext.replace(".","")}). Please use MP3, MP4, WAV, M4A, AAC, or WEBM.`);
      return;
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("File exceeds the 2 GB limit.");
      return;
    }

    setFile(selectedFile);
    setError(null);

    if (!meetingTitle) {
      const name = selectedFile.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setMeetingTitle(name);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDragOver(false); };
  const handleDrop = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files?.[0] || null); };
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => { handleFileSelect(e.target.files?.[0] || null); };

  const removeFile = () => {
    setFile(null); setError(null); setProcessingError(null); setProcessingMeetingId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const cancelUpload = () => {
    if (xhrRef.current) { xhrRef.current.abort(); xhrRef.current = null; }
    setUploadState("idle"); setUploadProgress(0);
  };

  /* ─── PROCESSING PIPELINE ─── */
  const triggerProcessing = async (meetingId: string) => {
    // Animate through each phase with natural timing
    for (let i = 0; i < PROCESSING_PHASES.length; i++) {
      setProcessingPhase(i);
      // Each phase has a minimum display time for the animation
      const minDuration = i === 0 ? 800 : 400 + Math.random() * 600;
      await new Promise((r) => setTimeout(r, minDuration));

      // Call real APIs at the right points
      if (i === 2) {
        // Phase: reading → call process endpoint
        try {
          const processRes = await fetch(`/api/meetings/${meetingId}/process`, { method: "POST" });
          if (processRes.ok) {
            const processData = await processRes.json();
            setExtractedMetadata({
              duration: processData.metadata?.duration || null,
              codec: processData.metadata?.codec || null,
              resolution: processData.metadata?.resolution || null,
              language: null,
              languageName: null,
            });
          }
        } catch { /* continue despite error */ }
      }

      if (i === 4) {
        // Phase: transcribing → call transcribe endpoint
        try {
          const transcribeRes = await fetch(`/api/meetings/${meetingId}/transcribe`, { method: "POST" });
          if (transcribeRes.ok) {
            const transcribeData = await transcribeRes.json();
            const langCode = transcribeData.metadata?.language || null;
            const langName = transcribeData.metadata?.language_name || (langCode ? LANGUAGE_NAMES[langCode as string] || langCode : null);
            setExtractedMetadata((prev) => ({
              duration: prev?.duration ?? null,
              codec: prev?.codec ?? null,
              resolution: prev?.resolution ?? null,
              language: langCode,
              languageName: langName,
            }));
          }
        } catch { /* continue */ }
      }

      if (i === 5) {
        // Phase: diarize → call diarize endpoint
        try {
          await fetch(`/api/meetings/${meetingId}/diarize`, { method: "POST" });
        } catch { /* continue */ }
      }

      if (i === 6) {
        // Phase: finding decisions → call analyze endpoint
        try {
          await fetch(`/api/meetings/${meetingId}/analyze`, { method: "POST" });
        } catch { /* continue */ }
      }
    }
  };

  /* ─── UPLOAD FLOW ─── */
  const handleUpload = async () => {
    if (!file) return;
    if (!meetingTitle.trim()) { setError("Please enter a meeting title."); return; }
    if (!clientName.trim()) { setError("Please enter a client name."); return; }

    setUploadState("uploading");
    setUploadProgress(0);
    setError(null);
    setProcessingError(null);
    setExtractedMetadata(null);
    setFinishedMeetingId(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to upload meetings.");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No active session. Please sign in again.");

      const fileExt = file.name.split(".").pop();
      const filePath = `meetings/${user.id}/${Date.now()}-${file.name}`;
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!supabaseUrl || !supabaseKey) throw new Error("Supabase configuration is missing.");

      // Upload to Supabase Storage with XHR progress
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhrRef.current = xhr;
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
        });
        xhr.addEventListener("load", () => {
          xhrRef.current = null;
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else {
            try {
              const body = JSON.parse(xhr.responseText);
              reject(new Error(body.message || body.error || `Upload failed (${xhr.status})`));
            } catch { reject(new Error(`Upload failed with status ${xhr.status}`)); }
          }
        });
        xhr.addEventListener("error", () => { xhrRef.current = null; reject(new Error("Network error during upload.")); });
        xhr.addEventListener("abort", () => { xhrRef.current = null; reject(new Error("Upload cancelled.")); });
        xhr.open("POST", `${supabaseUrl}/storage/v1/object/meeting-recordings/${filePath}`);
        xhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`);
        xhr.setRequestHeader("apikey", supabaseKey);
        const formData = new FormData();
        formData.append("file", file);
        xhr.send(formData);
      });

      setUploadProgress(100);

      // Create meeting record
      const meetingData = {
        title: meetingTitle.trim(),
        client_name: clientName.trim(),
        date: meetingDate,
        file_type: fileExt?.toUpperCase() || "AUDIO",
        file_name: file.name,
        original_file_name: file.name,
        file_size: file.size,
        storage_path: filePath,
        status: "uploaded" as const,
      };

      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(meetingData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create meeting record.");
      }

      const meetingResult = await res.json();
      const meetingId = meetingResult.meeting?.id;
      if (meetingId) {
        setProcessingMeetingId(meetingId);
        setFinishedMeetingId(meetingId);
      }

      // Switch to processing state
      setUploadState("processing");
      setProcessingPhase(0);

      // Start the processing pipeline
      if (meetingId) {
        try { await triggerProcessing(meetingId); } catch { /* continue */ }
      }

      setUploadState("success");
      setRedirectCountdown(5);
      fetchRecentMeetings();
    } catch (err) {
      if (err instanceof Error && err.message === "Upload cancelled.") {
        setUploadState("idle");
        setUploadProgress(0);
        return;
      }
      setUploadState("error");
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    }
  };

  const retryUpload = () => {
    setUploadState("idle"); setUploadProgress(0); setError(null);
    setProcessingError(null); setProcessingPhase(0);
    setTimeout(() => handleUpload(), 100);
  };

  const handleDeleteRecent = async (meetingId: string) => {
    setDeletingId(meetingId);
    try {
      const res = await fetch(`/api/meetings/${meetingId}`, { method: "DELETE" });
      if (res.ok) setRecentMeetings((prev) => prev.filter((m) => m.id !== meetingId));
    } catch { /* ignore */ } finally { setDeletingId(null); }
  };

  const fileExt = file?.name.split(".").pop()?.toUpperCase() || "";

  /* ─── SOURCE SELECTION ─── */
  const selectSource = (sourceId: SourceId) => {
    setActiveSource(sourceId);
    setUploadState("select_source");
    if (sourceId === "whatsapp") setShowWhatsAppGuide(true);
    else setShowWhatsAppGuide(false);
    // For non-local sources that need integration, show coming soon
    if (sourceId !== "local" && sourceId !== "whatsapp") {
      // For now, fall back to local file upload for all sources
      setTimeout(() => fileInputRef.current?.click(), 100);
    }
  };

  const resetSource = () => {
    setActiveSource(null);
    setUploadState("idle");
    setShowWhatsAppGuide(false);
    setFile(null);
  };

  /* ═══════════════════════════════════════
     RENDER: SUCCESS STATE
     ═══════════════════════════════════════ */
  if (uploadState === "success") {
    return (
      <div className="px-6 lg:px-10 py-8 lg:py-10 max-w-[1280px] mx-auto">
        <div className="flex flex-col items-center justify-center py-16 lg:py-24">
          {/* Success animation */}
          <div className="relative mb-8">
            <div className="w-24 h-24 rounded-full bg-[#eafaf1] border-4 border-[#1d8348]/20 flex items-center justify-center animate-breathe">
              <CheckCircle2 size={48} className="text-[#1d8348]" strokeWidth={1.5} />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#1d8348] flex items-center justify-center">
              <Sparkles size={12} className="text-white" />
            </div>
          </div>

          <h2 className="heading-display text-[36px] lg:text-[44px] text-[#1d1d1f] mb-2 text-center">
            Ready in your <span className="italic text-[#0071e3]">Company Brain</span>
          </h2>
          <p className="text-[15px] text-[#86868b] mb-2 text-center max-w-lg">
            &ldquo;{meetingTitle}&rdquo; has been processed and indexed into your knowledge graph.
          </p>

          {extractedMetadata && (
            <div className="flex items-center gap-4 mb-6 mt-3 flex-wrap justify-center">
              {extractedMetadata.duration && (
                <span className="text-[12px] text-[#86868b] flex items-center gap-1 bg-[#f5f5f7] px-3 py-1.5 rounded-full">
                  <Clock size={11} /> {formatDuration(extractedMetadata.duration)}
                </span>
              )}
              {extractedMetadata.languageName && (
                <span className="text-[12px] text-[#0071e3] flex items-center gap-1 bg-[#e8f0fb] px-3 py-1.5 rounded-full font-medium">
                  <Globe size={11} /> {extractedMetadata.languageName}
                </span>
              )}
              {extractedMetadata.codec && (
                <span className="text-[12px] text-[#86868b] bg-[#f5f5f7] px-3 py-1.5 rounded-full">
                  {extractedMetadata.codec}
                </span>
              )}
            </div>
          )}

          {/* Auto-redirect countdown */}
          <div className="mb-10 text-center">
            <p className="text-[12px] text-[#a1a1a6]">
              Opening meeting workspace in <span className="font-mono font-medium text-[#1d1d1f]">{redirectCountdown}s</span>...
            </p>
            <div className="w-48 h-1 rounded-full bg-[#f5f5f7] mx-auto mt-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#0071e3] transition-all duration-1000 ease-linear"
                style={{ width: `${((5 - redirectCountdown) / 5) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={finishedMeetingId ? `/dashboard/meetings/${finishedMeetingId}` : "/dashboard/meetings"}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0071e3] text-white text-[13px] font-medium hover:bg-[#0062c9] transition-all shadow-sm hover:shadow-md"
            >
              <Eye size={15} />
              View Meeting
            </Link>
            <button
              onClick={() => {
                setUploadState("idle"); setFile(null); setMeetingTitle(""); setClientName("");
                setMeetingDate(new Date().toISOString().split("T")[0]);
                setUploadProgress(0); setProcessingPhase(0); setExtractedMetadata(null);
                setActiveSource(null); setFinishedMeetingId(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#f5f5f7] text-[#1d1d1f] text-[13px] font-medium hover:bg-[#e5e5e7] transition-colors border border-[#e5e5e7]"
            >
              <Upload size={14} />
              Import Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════
     RENDER: PROCESSING STATE
     ═══════════════════════════════════════ */
  if (uploadState === "processing") {
    const phase = PROCESSING_PHASES[Math.min(processingPhase, PROCESSING_PHASES.length - 1)];
    const PhaseIcon = phase.icon;

    return (
      <div className="px-6 lg:px-10 py-8 lg:py-10 max-w-[1280px] mx-auto">
        <div className="flex flex-col items-center justify-center py-16 lg:py-24">
          {/* Animated orb */}
          <div className="relative mb-10">
            <div className={`w-28 h-28 rounded-full ${phase.bgColor} border-4 ${phase.borderColor} flex items-center justify-center relative`}>
              <div className="absolute inset-0 rounded-full animate-glow-pulse opacity-30" style={{ background: `radial-gradient(circle, ${phase.color === "text-blue-600" ? "#0071e3" : phase.color.replace("text-", "")}20 0%, transparent 70%)` }} />
              <PhaseIcon size={40} className={`${phase.color} animate-float`} strokeWidth={1.5} />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
              <div className="flex gap-1">
                {[0, 0.3, 0.6].map((delay) => (
                  <span
                    key={delay}
                    className="w-2 h-2 rounded-full bg-[#0071e3] animate-bounce"
                    style={{ animationDelay: `${delay}s` }}
                  />
                ))}
              </div>
            </div>
          </div>

          <h2 className="text-[28px] lg:text-[32px] font-semibold tracking-[-0.02em] text-[#1d1d1f] mb-2 text-center">
            {phase.label}
          </h2>
          <p className="text-[15px] text-[#86868b] mb-12 max-w-md text-center">
            {phase.message}
          </p>

          {/* Premium timeline */}
          <div className="w-full max-w-lg">
            {PROCESSING_PHASES.map((p, i) => {
              const isCompleted = i < processingPhase;
              const isCurrent = i === processingPhase;
              const isFuture = i > processingPhase;
              const Icon = p.icon;

              return (
                <div key={p.id} className="flex items-start gap-4 mb-0">
                  <div className="relative flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${
                        isCompleted
                          ? "bg-[#eafaf1] border-2 border-[#1d8348] scale-100"
                          : isCurrent
                          ? `${p.bgColor} border-2 ${p.borderColor} scale-110 shadow-lg`
                          : "bg-[#f5f5f7] border-2 border-[#e5e5e7] scale-100"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 size={18} className="text-[#1d8348]" strokeWidth={2.5} />
                      ) : (
                        <Icon size={16} className={isCurrent ? p.color : "text-[#c7c7cc]"} strokeWidth={1.8} />
                      )}
                    </div>
                    {i < PROCESSING_PHASES.length - 1 && (
                      <div
                        className={`w-0.5 h-8 transition-colors duration-500 ${
                          isCompleted ? "bg-[#1d8348]" : "bg-[#e5e5e7]"
                        }`}
                      />
                    )}
                  </div>

                  <div className={`pt-2 flex-1 transition-all duration-500 ${isCurrent ? "translate-x-1" : ""}`}>
                    <p
                      className={`text-[14px] font-semibold transition-colors duration-300 ${
                        isCompleted ? "text-[#1d8348]" : isCurrent ? "text-[#1d1d1f]" : "text-[#a1a1a6]"
                      }`}
                    >
                      {p.label}
                    </p>
                    <p
                      className={`text-[12px] mt-0.5 transition-colors duration-300 ${
                        isCompleted ? "text-[#1d8348]/70" : isCurrent ? "text-[#86868b]" : "text-[#c7c7cc]"
                      }`}
                    >
                      {p.message}
                    </p>
                  </div>

                  {isCurrent && (
                    <div className="pt-2.5">
                      <div className="w-4 h-4 rounded-full border-2 border-[#0071e3] border-t-transparent animate-spin" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Error */}
          {processingError && (
            <div className="mt-10 w-full max-w-lg p-4 rounded-xl border border-[#c0392b]/20 bg-[#c0392b]/[0.03] text-center">
              <AlertCircle size={20} className="text-[#c0392b] mx-auto mb-2" />
              <p className="text-[13px] text-[#c0392b] font-medium mb-3">{processingError}</p>
              <button
                onClick={() => { setProcessingError(null); setProcessingPhase(0); if (processingMeetingId) triggerProcessing(processingMeetingId); }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0071e3] text-white text-[12.5px] font-medium hover:bg-[#0062c9] transition-colors"
              >
                <RotateCcw size={12} /> Retry
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════
     RENDER: IDLE / SOURCE SELECTION
     ═══════════════════════════════════════ */
  return (
    <div className="px-6 lg:px-10 py-8 lg:py-10 max-w-[1280px] mx-auto">
      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#86868b] hover:text-[#1d1d1f] transition-colors mb-6 group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
        Back to dashboard
      </Link>

      {/* Header */}
      <div className="mb-8">
        <p className="eyebrow text-[#a1a1a6] mb-2">Import</p>
        <h1 className="heading-display text-[36px] lg:text-[44px] text-[#1d1d1f] leading-[1.0]">
          Import <span className="italic text-[#0071e3]">Hub</span>
        </h1>
        <p className="text-[14px] text-[#86868b] mt-2 max-w-2xl">
          Import from any source. MeetingOS automatically transcribes, detects language, analyzes, and indexes everything into your Company Brain.
        </p>
      </div>

      {/* ═══ SOURCE GRID ═══ */}
      {!activeSource && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 mb-10">
          {IMPORT_SOURCES.map((src, i) => {
            const Icon = src.icon;
            const accent = accentColors[src.accent];
            return (
              <button
                key={src.id}
                onClick={() => selectSource(src.id as SourceId)}
                className="group relative bg-white rounded-2xl p-5 border border-[#e5e5e7] text-left hover:shadow-md transition-all duration-200 animate-fade-in-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {src.badge && (
                  <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-semibold border border-emerald-200 shadow-sm">
                    {src.badge}
                  </span>
                )}
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${src.gradient} flex items-center justify-center mb-3 shadow-sm group-hover:scale-105 transition-transform`}>
                  <Icon size={20} className="text-white" strokeWidth={1.8} />
                </div>
                <p className="text-[13.5px] font-semibold text-[#1d1d1f] leading-snug">{src.label}</p>
                <p className="text-[11px] text-[#86868b] mt-1 leading-relaxed">{src.description}</p>
                <div className="mt-3 flex items-center gap-1 text-[11px] font-medium text-[#a1a1a6] group-hover:text-[#0071e3] transition-colors">
                  Import <ChevronRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* ═══ WHATSAPP GUIDE ═══ */}
      {showWhatsAppGuide && !file && (
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 animate-fade-in-up">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center flex-shrink-0 shadow-sm">
              <MessageCircle size={22} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-[17px] font-semibold text-[#1d1d1f] mb-1">Import from WhatsApp</h3>
              <p className="text-[13px] text-[#86868b] mb-4 max-w-xl">
                Drag and drop WhatsApp audio files, voice notes, or exported chat (.zip) below. MeetingOS automatically detects the language, transcribes, and indexes everything into your Company Brain.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                {[
                  { icon: MessageCircle, label: "Voice Notes", desc: "WhatsApp voice messages (.ogg)" },
                  { icon: FileAudio, label: "Audio Files", desc: "Meeting recordings from WhatsApp" },
                  { icon: FileText, label: "Chat Export", desc: "Exported .zip chat with media" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-2.5 p-3 rounded-xl bg-white/80 border border-emerald-100">
                    <item.icon size={16} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[12.5px] font-medium text-[#1d1d1f]">{item.label}</p>
                      <p className="text-[11px] text-[#86868b]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 text-[11.5px] text-[#86868b]">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-medium">
                  <Globe size={10} /> Auto language detection
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-medium">
                  <Bot size={10} /> AI transcript
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-medium">
                  <Zap size={10} /> Action items
                </span>
              </div>
              <button onClick={() => { setShowWhatsAppGuide(false); setActiveSource(null); }} className="mt-4 text-[12px] text-[#86868b] hover:text-[#1d1d1f] transition-colors">
                ← Choose different source
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ UPLOAD ZONE ═══ */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInputRef.current?.click(); } }}
              className={`group relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 px-6 py-20 lg:py-24 text-center ${
                dragOver
                  ? "border-[#0071e3] bg-[#0071e3]/[0.03] scale-[1.005]"
                  : "border-[#d2d2d7] hover:border-[#0071e3]/40 hover:bg-[#f5f5f7]"
              }`}
              style={{ boxShadow: dragOver ? "0 16px 40px -12px rgba(0,113,227,0.12)" : "0 1px 3px rgba(0,0,0,0.04)" }}
            >
              <div className="relative">
                <div className="inline-flex w-20 h-20 rounded-2xl bg-[#f5f5f7] border border-[#e5e5e7] items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <CloudUpload size={32} className="text-[#0071e3]" strokeWidth={1.6} />
                </div>

                <h2 className="text-[22px] lg:text-[24px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">
                  {dragOver ? "Drop to import" : "Drop your recording here"}
                </h2>
                <p className="text-[14px] text-[#86868b] mt-2">or</p>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="mt-3 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0071e3] text-white text-[14px] font-medium transition-all hover:bg-[#0062c9] shadow-sm hover:shadow-md"
                >
                  <Upload size={15} strokeWidth={2.2} />
                  Browse Files
                </button>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-[12px]">
                  <div className="flex items-center gap-1.5">
                    {["MP3", "MP4", "WAV", "M4A", "AAC", "OGG"].map((fmt) => (
                      <span key={fmt} className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#f5f5f7] border border-[#e5e5e7] text-[#6e6e73] font-mono text-[11px] font-medium">
                        {fmt}
                      </span>
                    ))}
                  </div>
                  <span className="text-[#c7c7cc]">·</span>
                  <span className="text-[#86868b] inline-flex items-center gap-1">
                    <Clock size={12} /> Max <span className="font-mono text-[#6e6e73] ml-0.5">2 GB</span>
                  </span>
                </div>

                <input ref={fileInputRef} type="file" accept={ACCEPTED_TYPES.join(",")} className="hidden" onChange={handleInputChange} />
              </div>
            </div>
          ) : (
            /* ═══ SELECTED FILE ═══ */
            <div className="bg-white rounded-2xl p-6 lg:p-8 border border-[#e5e5e7] shadow-sm">
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-[#f5f5f7] border border-[#e5e5e7] flex items-center justify-center flex-shrink-0">
                  <FileAudio size={22} className="text-[#0071e3]" strokeWidth={1.8} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-[#f5f5f7] text-[#6e6e73] font-mono text-[10.5px] font-medium border border-[#e5e5e7]">{fileExt}</span>
                    {uploadState !== "uploading" && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#1d8348]">
                        <CheckCircle2 size={11} strokeWidth={2.2} /> Ready to import
                      </span>
                    )}
                    {activeSource === "whatsapp" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-medium">
                        <MessageCircle size={10} /> WhatsApp
                      </span>
                    )}
                  </div>
                  <p className="text-[15px] font-semibold text-[#1d1d1f] truncate">{file.name}</p>
                  <p className="text-[12.5px] text-[#86868b] mt-1">{formatFileSize(file.size)} · {fileExt} file</p>
                </div>

                {uploadState !== "uploading" && (
                  <button onClick={removeFile} className="p-2 rounded-lg hover:bg-[#f5f5f7] text-[#86868b] hover:text-[#1d1d1f] transition-colors" aria-label="Remove file">
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Meeting details */}
              <div className="mt-5 pt-5 border-t border-[#e5e5e7] space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[12px] font-medium text-[#86868b] mb-1.5">Meeting Title</label>
                    <input type="text" value={meetingTitle} onChange={(e) => setMeetingTitle(e.target.value)}
                      placeholder="e.g. Q3 Strategy Review" disabled={uploadState === "uploading"}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#fafafa] border border-[#e5e5e7] text-[13.5px] text-[#1d1d1f] placeholder:text-[#a1a1a6] focus:outline-none focus:border-[#0071e3]/40 focus:ring-2 focus:ring-[#0071e3]/10 transition-all disabled:opacity-50" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-[#86868b] mb-1.5">Date</label>
                    <input type="date" value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)}
                      disabled={uploadState === "uploading"}
                      className="w-full px-3 py-2.5 rounded-xl bg-[#fafafa] border border-[#e5e5e7] text-[13.5px] text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]/40 focus:ring-2 focus:ring-[#0071e3]/10 transition-all disabled:opacity-50" />
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#86868b] mb-1.5">Client Name</label>
                  <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Nike, Acme Co." disabled={uploadState === "uploading"}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#fafafa] border border-[#e5e5e7] text-[13.5px] text-[#1d1d1f] placeholder:text-[#a1a1a6] focus:outline-none focus:border-[#0071e3]/40 focus:ring-2 focus:ring-[#0071e3]/10 transition-all disabled:opacity-50" />
                </div>
              </div>

              {/* Upload progress */}
              {uploadState === "uploading" && (
                <div className="mt-4 pt-4 border-t border-[#e5e5e7]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Loader2 size={14} className="text-[#0071e3] animate-spin" />
                      <span className="text-[13px] text-[#1d1d1f] font-medium">Uploading... {uploadProgress}%</span>
                    </div>
                    <button onClick={cancelUpload} className="text-[12px] font-medium text-[#c0392b] hover:text-[#a93226] transition-colors">Cancel</button>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#f5f5f7] overflow-hidden">
                    <div className="h-full rounded-full bg-[#0071e3] transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <p className="text-[11px] text-[#a1a1a6] mt-1.5">{formatFileSize((file.size * uploadProgress) / 100)} of {formatFileSize(file.size)} uploaded</p>
                </div>
              )}

              {/* Error */}
              {uploadState === "error" && (
                <div className="mt-4 pt-4 border-t border-[#e5e5e7]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#c0392b]">
                      <AlertCircle size={14} /> <span className="text-[13px] font-medium">Upload failed</span>
                    </div>
                    <button onClick={retryUpload} className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#0071e3] hover:text-[#0062c9] transition-colors">
                      <RotateCcw size={12} /> Retry
                    </button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-5 pt-5 border-t border-[#e5e5e7] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <button onClick={removeFile} disabled={uploadState === "uploading"}
                  className="text-[12.5px] font-medium text-[#86868b] hover:text-[#1d1d1f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  Choose different file
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploadState === "uploading" || !meetingTitle.trim() || !clientName.trim()}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0071e3] text-white text-[13px] font-medium transition-all hover:bg-[#0062c9] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  {uploadState === "uploading" ? (
                    <><Loader2 size={14} className="animate-spin" /> Uploading...</>
                  ) : (
                    <><Upload size={14} strokeWidth={2.2} /> Import Meeting</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="p-3 rounded-xl border border-[#c0392b]/20 bg-[#c0392b]/[0.03] text-[12.5px] text-[#c0392b] flex items-center gap-2 animate-fade-in">
              <AlertCircle size={14} className="flex-shrink-0" /> {error}
            </div>
          )}

          {/* ═══ RECENT UPLOADS ═══ */}
          <section>
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="eyebrow text-[#a1a1a6] mb-1">History</p>
                <h2 className="text-[17px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">Recent Imports</h2>
              </div>
              {recentMeetings.length > 0 && (
                <Link href="/dashboard/meetings" className="text-[12px] font-medium text-[#0071e3] hover:text-[#0062c9] transition-colors">View all →</Link>
              )}
            </div>

            {recentLoading ? (
              <div className="bg-white rounded-2xl border border-[#e5e5e7] py-10 px-6 flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-[#0071e3] border-t-transparent animate-spin" />
                  <span className="text-[12.5px] text-[#86868b]">Loading...</span>
                </div>
              </div>
            ) : recentMeetings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#e5e5e7] py-14 px-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#f5f5f7] border border-[#e5e5e7] flex items-center justify-center mb-4">
                  <HardDrive size={20} className="text-[#a1a1a6]" strokeWidth={1.8} />
                </div>
                <p className="text-[14px] font-medium text-[#1d1d1f]">No imports yet.</p>
                <p className="text-[12.5px] text-[#86868b] mt-1.5 max-w-sm">Once you import a meeting, it will appear here with its current status.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#e5e5e7] overflow-hidden">
                {recentMeetings.map((meeting, i) => (
                  <Link
                    key={meeting.id}
                    href={`/dashboard/meetings/${meeting.id}`}
                    className={`flex items-center gap-4 px-5 py-4 hover:bg-[#fafafa] transition-colors group ${i < recentMeetings.length - 1 ? "border-b border-[#f0f0f2]" : ""}`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#0071e3]/10 border border-[#0071e3]/20 flex items-center justify-center flex-shrink-0">
                      <FileAudio size={18} className="text-[#0071e3]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13.5px] font-medium text-[#1d1d1f] truncate">{meeting.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11.5px] text-[#86868b]">{meeting.client_name}</span>
                        <span className="text-[#c7c7cc] text-[9px]">·</span>
                        <span className="text-[11px] text-[#a1a1a6] flex items-center gap-1"><Calendar size={9} />{new Date(meeting.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                        {meeting.file_size > 0 && (<><span className="text-[#c7c7cc] text-[9px]">·</span><span className="text-[11px] text-[#a1a1a6]">{formatFileSize(meeting.file_size)}</span></>)}
                        {meeting.duration && meeting.duration > 0 && (<><span className="text-[#c7c7cc] text-[9px]">·</span><span className="text-[11px] text-[#a1a1a6] flex items-center gap-1"><Clock size={9} />{formatDuration(meeting.duration)}</span></>)}
                      </div>
                    </div>
                    <span className={`text-[10.5px] font-medium px-2 py-0.5 rounded-full ${statusColor(meeting.status)}`}>{statusLabel(meeting.status)}</span>
                    <button onClick={(e) => { e.preventDefault(); handleDeleteRecent(meeting.id); }}
                      disabled={deletingId === meeting.id}
                      className="p-1.5 rounded-lg text-[#a1a1a6] hover:text-[#c0392b] hover:bg-[#c0392b]/10 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* ═══ RIGHT SIDEBAR ═══ */}
        <aside className="xl:sticky xl:top-24 xl:self-start space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-[#e5e5e7] shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-[#0071e3]/10 border border-[#0071e3]/20 flex items-center justify-center">
                <Sparkles size={13} className="text-[#0071e3]" strokeWidth={2.2} />
              </div>
              <h3 className="text-[14px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">What we&apos;ll generate</h3>
            </div>
            <p className="text-[12px] text-[#86868b] mb-4">After import, MeetingOS processes everything automatically.</p>
            <ul className="space-y-3">
              {WHAT_WE_GENERATE.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <div className="mt-0.5 w-4 h-4 rounded-full bg-[#eafaf1] border border-[#1d8348]/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 size={10} className="text-[#1d8348]" strokeWidth={2.4} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-semibold text-[#1d1d1f] leading-snug">{item.title}</p>
                    <p className="text-[11.5px] text-[#86868b] leading-relaxed mt-0.5">{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-[#e5e5e7] bg-[#fafafa] p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md bg-[#f5f5f7] border border-[#e5e5e7] flex items-center justify-center">
                <Globe size={11} className="text-[#86868b]" strokeWidth={2.2} />
              </div>
              <h3 className="eyebrow text-[#6e6e73]">Multilingual</h3>
            </div>
            <p className="text-[12px] text-[#86868b] leading-relaxed">
              Supports 20+ Indian languages. Language detection, code-switching, and speaker diarization happen automatically.
            </p>
          </div>

          <div className="rounded-2xl border border-[#e5e5e7] bg-[#fafafa] p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md bg-[#f5f5f7] border border-[#e5e5e7] flex items-center justify-center">
                <Lock size={11} className="text-[#86868b]" strokeWidth={2.2} />
              </div>
              <h3 className="eyebrow text-[#6e6e73]">Privacy</h3>
            </div>
            <p className="text-[12px] text-[#86868b] leading-relaxed">
              Recordings are encrypted at rest and in transit. Only people in your workspace can access them.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
