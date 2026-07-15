"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Sparkles,
  Brain,
  ArrowRight,
  MessageSquare,
  Lightbulb,
  BookOpen,
  FolderOpen,
  Building2,
  Clock,
  Quote,
  Zap,
  Hash,
  Send,
  Filter,
  ExternalLink,
  Search,
} from "lucide-react";

/* ============================================================
   TYPES
   ============================================================ */
interface SearchResultItem {
  id: string;
  title: string;
  client: string;
  date: string;
  summary: string | null;
  duration: number | null;
  status: string;
  score: number;
  matchedFields: string[];
  topics: string[];
  keywords: string[];
  processing_status: string | null;
}

interface SourceDecision {
  title: string;
  description: string;
  confidence: number;
  meetingTitle: string;
  meetingDate: string;
  meetingId: string;
}

interface TranscriptSection {
  text: string;
  meetingTitle: string;
  meetingDate: string;
  meetingId: string;
}

interface SearchResponse {
  answer: string;
  results: SearchResultItem[];
  sources: {
    meetings: Array<{ id: string; title: string; date: string; client: string; summary: string }>;
    decisions: SourceDecision[];
    transcript_sections: TranscriptSection[];
  };
  searchTime: number;
}

interface Suggestion {
  type: "meeting" | "client";
  id?: string;
  title: string;
  subtitle: string;
}

interface SearchFilters {
  client: string;
  dateFrom: string;
  dateTo: string;
  status: string;
}

/* ============================================================
   SEARCH API
   ============================================================ */
async function searchMeetings(query: string, filters: SearchFilters, mode: "smart" | "keyword" = "smart"): Promise<SearchResponse> {
  const res = await fetch("/api/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      mode,
      filters: {
        ...(filters.client && { client: filters.client }),
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
        ...(filters.status && { status: filters.status }),
      },
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Search failed");
  }

  return res.json();
}

async function fetchSuggestions(q: string): Promise<Suggestion[]> {
  if (q.length < 2) return [];
  const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.suggestions || [];
}

/* ============================================================
   KNOWLEDGE SOURCES (for empty state)
   ============================================================ */
const KNOWLEDGE_SOURCES = [
  { label: "Meetings", icon: MessageSquare, accent: "brand" },
  { label: "Clients", icon: Building2, accent: "emerald" },
  { label: "Decisions", icon: Lightbulb, accent: "amber" },
  { label: "Files", icon: FolderOpen, accent: "sky" },
];

const SAMPLE_QUERIES = [
  "What decisions did Nike approve this month?",
  "What are all open action items?",
  "Which meetings discussed pricing?",
  "Show all marketing-related decisions.",
];

/* ============================================================
   HELPERS
   ============================================================ */
function formatDuration(seconds: number | null) {
  if (!seconds) return "";
  const mins = Math.floor(seconds / 60);
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    return `${hrs}h ${rem}m`;
  }
  return `${mins} min`;
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

function highlightMatch(text: string, query: string) {
  if (!query.trim() || !text) return text;
  const words = query.split(/\s+/).filter((w) => w.length > 2);
  if (words.length === 0) return text;

  const escaped = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="bg-[#fef3c7] text-[#1d1d1f] rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

/* ============================================================
   PAGE
   ============================================================ */
export default function AgencyBrainPage() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [currentResult, setCurrentResult] = useState<SearchResponse | null>(null);
  const [searchHistory, setSearchHistory] = useState<Array<{ query: string; timestamp: string }>>([]);
  const [showExamples, setShowExamples] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({ client: "", dateFrom: "", dateTo: "", status: "" });

  // Autocomplete
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const emptySuggestionsRef = useRef<HTMLDivElement>(null);
  const resultsSuggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      const inEmpty = emptySuggestionsRef.current?.contains(target);
      const inResults = resultsSuggestionsRef.current?.contains(target);
      if (!inEmpty && !inResults) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("agencyos_recent_searches");
      if (stored) setSearchHistory(JSON.parse(stored));
    } catch {}
  }, []);

  const searchHistoryRef = useRef<Array<{ query: string; timestamp: string }>>(searchHistory);
  searchHistoryRef.current = searchHistory;

  const handleSearch = useCallback(async (searchQuery?: string) => {
    const q = (searchQuery || query).trim();
    if (!q) return;

    setIsSearching(true);
    setHasSearched(true);
    setShowExamples(false);
    setError(null);
    setShowSuggestions(false);

    try {
      const result = await searchMeetings(q, filters);
      setCurrentResult(result);

      // Save to history
      const newEntry = { query: q, timestamp: "Just now" };
      const prev = searchHistoryRef.current;
      const newHistory = [newEntry, ...prev.filter((h) => h.query !== q)].slice(0, 10);
      setSearchHistory(newHistory);
      try {
        localStorage.setItem("agencyos_recent_searches", JSON.stringify(newHistory));
      } catch {}
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setIsSearching(false);
    }

    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, [query, filters]);

  const handleQueryChange = (value: string) => {
    setQuery(value);

    // Debounced autocomplete
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length >= 2) {
      debounceRef.current = setTimeout(async () => {
        const suggs = await fetchSuggestions(value);
        setSuggestions(suggs);
        setShowSuggestions(suggs.length > 0);
        setSelectedSuggestion(-1);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSuggestion((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSuggestion((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (sugg: Suggestion) => {
    setQuery(sugg.title);
    setShowSuggestions(false);
    handleSearch(sugg.title);
  };

  const handleSampleClick = (q: string) => {
    setQuery(q);
    handleSearch(q);
  };

  const handleHistoryClick = (q: string) => {
    setQuery(q);
    handleSearch(q);
  };

  const handleNewSearch = () => {
    setQuery("");
    setCurrentResult(null);
    setHasSearched(false);
    setShowExamples(true);
    setError(null);
    setFilters({ client: "", dateFrom: "", dateTo: "", status: "" });
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-ink-50">
      {/* ===== STICKY HEADER ===== */}
      <div className="sticky top-0 z-30 bg-white/85 backdrop-glass border-b border-ink-200/60">
        <div className="px-6 lg:px-10 py-4 lg:py-5 flex items-center justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <div className="hidden lg:flex w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-[0_4px_12px_-2px_rgba(108,92,231,0.3)] items-center justify-center">
              <Brain size={18} className="text-white" strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <h1 className="text-[24px] lg:text-[28px] font-semibold tracking-[-0.02em] text-ink-900 leading-tight">
                Agency <span className="font-display italic text-gradient-brand">Brain</span>
              </h1>
              <p className="text-[13px] text-ink-500 mt-0.5">
                Search across meetings, decisions, transcripts and company knowledge.
              </p>
            </div>
          </div>

          {hasSearched && (
            <button
              onClick={handleNewSearch}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[12px] bg-ink-900 hover:bg-ink-800 text-white text-[13px] font-medium transition-all shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_4px_14px_-2px_rgba(15,17,21,0.3)]"
            >
              <Sparkles size={15} strokeWidth={2.2} />
              New Search
            </button>
          )}
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="px-6 lg:px-10 py-8 lg:py-12">
        <div className="max-w-[1440px] mx-auto">
          {!hasSearched ? (
            /* ===== EMPTY STATE ===== */
            <div className="flex flex-col items-center pt-16 lg:pt-24 pb-16 animate-fade-in-up">
              <div className="relative mb-8">
                <div className="w-24 h-24 rounded-[28px] bg-gradient-to-br from-brand-500 to-brand-700 shadow-[0_8px_32px_-8px_rgba(108,92,231,0.4)] flex items-center justify-center">
                  <Brain size={44} className="text-white" strokeWidth={1.6} />
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border-2 border-ink-50 flex items-center justify-center shadow-sm">
                  <Sparkles size={13} className="text-brand-600" />
                </span>
              </div>

              <h2 className="text-[28px] lg:text-[34px] font-semibold tracking-[-0.02em] text-ink-900 text-center leading-tight">
                Search your meeting <span className="font-display italic">memory.</span>
              </h2>
              <p className="text-[15px] text-ink-500 mt-3 text-center max-w-lg leading-relaxed">
                Ask questions across every meeting, decision, transcript and action item.
              </p>

              {/* Search box */}
              <div className="w-full max-w-[640px] mt-10 relative" ref={emptySuggestionsRef}>
                <div className="relative group">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-brand-500/20 via-brand-400/10 to-brand-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 blur-xl" />
                  <div className="relative flex items-center bg-white border-2 border-ink-200/70 group-focus-within:border-brand-300 rounded-2xl shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_1px_2px_rgba(15,17,21,0.04)] group-focus-within:shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_4px_20px_-8px_rgba(108,92,231,0.15)] transition-all duration-300">
                    <Brain size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-ink-400 group-focus-within:text-brand-600 transition-colors" strokeWidth={1.8} />
                    <input
                      ref={inputRef}
                      type="text"
                      value={query}
                      onChange={(e) => handleQueryChange(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                      placeholder="Search your meeting memory..."
                      className="w-full pl-14 pr-14 py-5 bg-transparent text-[16px] text-ink-900 placeholder:text-ink-400 focus:outline-none"
                    />
                    <button
                      onClick={() => handleSearch()}
                      disabled={!query.trim() || isSearching}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-ink-900 hover:bg-ink-800 text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {isSearching ? (
                        <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      ) : (
                        <ArrowRight size={18} strokeWidth={2.2} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Autocomplete dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-ink-200/70 rounded-xl shadow-[0_8px_32px_-8px_rgba(15,17,21,0.12)] overflow-hidden z-50">
                    {suggestions.map((sugg, i) => (
                      <button
                        key={`${sugg.type}-${sugg.title}-${i}`}
                        onClick={() => handleSuggestionClick(sugg)}
                        className={`w-full text-left flex items-center gap-3 px-4 py-3 transition-colors ${
                          i === selectedSuggestion ? "bg-brand-50" : "hover:bg-ink-50"
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          sugg.type === "meeting" ? "bg-brand-50 text-brand-600" : "bg-emerald-50 text-emerald-600"
                        }`}>
                          {sugg.type === "meeting" ? <MessageSquare size={13} /> : <Building2 size={13} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium text-ink-900 truncate">{sugg.title}</p>
                          <p className="text-[11px] text-ink-500">{sugg.subtitle}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Example prompts */}
              {showExamples && (
                <div className="w-full max-w-[640px] mt-8 animate-fade-in-up stagger-1">
                  <p className="text-[12px] font-medium text-ink-500 mb-3 text-center">Try asking</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SAMPLE_QUERIES.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => handleSampleClick(q)}
                        className="text-left px-4 py-3 rounded-xl bg-white border border-ink-200/70 hover:border-brand-200/70 hover:shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_2px_8px_rgba(108,92,231,0.08)] transition-all group"
                      >
                        <Quote size={12} className="text-ink-400 mb-1.5" />
                        <p className="text-[12.5px] text-ink-700 leading-snug group-hover:text-brand-700 transition-colors">{q}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ===== RESULTS VIEW ===== */
            <div className="flex gap-8 xl:gap-10">
              <div ref={resultsRef} className="flex-1 min-w-0 max-w-[800px] space-y-6 pb-16">
                {/* Compact search bar */}
                <div className="max-w-[640px] animate-fade-in-up relative" ref={resultsSuggestionsRef}>
                  <div className="relative flex items-center bg-white border border-ink-200/70 focus-within:border-brand-300 rounded-xl shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_1px_2px_rgba(15,17,21,0.04)] transition-all">
                    <Brain size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" strokeWidth={1.8} />
                    <input
                      ref={inputRef}
                      type="text"
                      value={query}
                      onChange={(e) => handleQueryChange(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                      placeholder="Ask a follow-up..."
                      className="w-full pl-11 pr-24 py-3 bg-transparent text-[14px] text-ink-900 placeholder:text-ink-400 focus:outline-none"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                      <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-1.5 rounded-lg transition-all ${showFilters ? "bg-brand-50 text-brand-600" : "text-ink-400 hover:text-ink-700 hover:bg-ink-50"}`}
                        title="Filters"
                      >
                        <Filter size={14} />
                        {activeFilterCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-600 text-white text-[9px] font-bold flex items-center justify-center">
                            {activeFilterCount}
                          </span>
                        )}
                      </button>
                      <button
                        onClick={() => handleSearch()}
                        disabled={!query.trim() || isSearching}
                        className="p-1.5 rounded-lg bg-ink-900 hover:bg-ink-800 text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        {isSearching ? (
                          <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        ) : (
                          <Send size={14} strokeWidth={2.2} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Autocomplete dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-ink-200/70 rounded-xl shadow-[0_8px_32px_-8px_rgba(15,17,21,0.12)] overflow-hidden z-50">
                      {suggestions.map((sugg, i) => (
                        <button
                          key={`${sugg.type}-${sugg.title}-${i}`}
                          onClick={() => handleSuggestionClick(sugg)}
                          className={`w-full text-left flex items-center gap-3 px-4 py-3 transition-colors ${
                            i === selectedSuggestion ? "bg-brand-50" : "hover:bg-ink-50"
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            sugg.type === "meeting" ? "bg-brand-50 text-brand-600" : "bg-emerald-50 text-emerald-600"
                          }`}>
                            {sugg.type === "meeting" ? <MessageSquare size={13} /> : <Building2 size={13} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-ink-900 truncate">{sugg.title}</p>
                            <p className="text-[11px] text-ink-500">{sugg.subtitle}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Filters panel */}
                  {showFilters && (
                    <div className="mt-3 p-4 bg-white border border-ink-200/70 rounded-xl shadow-sm animate-fade-in">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-[12px] font-semibold text-ink-700">Filters</h4>
                        {activeFilterCount > 0 && (
                          <button
                            onClick={() => setFilters({ client: "", dateFrom: "", dateTo: "", status: "" })}
                            className="text-[11px] text-brand-600 hover:text-brand-700 font-medium"
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-[11px] text-ink-500 mb-1">Client</label>
                          <input
                            type="text"
                            value={filters.client}
                            onChange={(e) => setFilters({ ...filters, client: e.target.value })}
                            placeholder="e.g. Nike"
                            className="w-full px-2.5 py-1.5 rounded-lg bg-ink-50 border border-ink-200/60 text-[12px] text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-brand-300"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-ink-500 mb-1">From date</label>
                          <input
                            type="date"
                            value={filters.dateFrom}
                            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-ink-50 border border-ink-200/60 text-[12px] text-ink-900 focus:outline-none focus:border-brand-300"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-ink-500 mb-1">To date</label>
                          <input
                            type="date"
                            value={filters.dateTo}
                            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-ink-50 border border-ink-200/60 text-[12px] text-ink-900 focus:outline-none focus:border-brand-300"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-ink-500 mb-1">Status</label>
                          <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-ink-50 border border-ink-200/60 text-[12px] text-ink-900 focus:outline-none focus:border-brand-300"
                          >
                            <option value="">All</option>
                            <option value="uploaded">Uploaded</option>
                            <option value="processing">Processing</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* Error state */}
                {error && (
                  <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-[13px] text-red-700 animate-fade-in">
                    {error}
                  </div>
                )}

                {/* Loading state */}
                {isSearching && (
                  <div className="animate-fade-in-up">
                    <div className="rounded-2xl bg-white border border-ink-200/70 shadow-sm p-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                          <Brain size={18} className="text-white animate-pulse" />
                        </div>
                        <div className="flex-1 space-y-2.5">
                          <div className="skeleton h-3.5 w-3/4 rounded" />
                          <div className="skeleton h-3.5 w-1/2 rounded" />
                          <div className="skeleton h-3.5 w-5/6 rounded" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Current result */}
                {currentResult && !isSearching && (
                  <div className="animate-fade-in-up space-y-6">
                    {/* AI Answer */}
                    <div className="rounded-2xl bg-white border border-ink-200/70 shadow-sm overflow-hidden">
                      <div className="px-6 pt-6 pb-4 border-b border-ink-100/80">
                        <div className="flex items-center gap-2.5 mb-2">
                          <div className="w-7 h-7 rounded-lg bg-brand-50 border border-brand-100/80 flex items-center justify-center">
                            <Brain size={14} className="text-brand-600" strokeWidth={2.2} />
                          </div>
                          <span className="text-[12px] font-medium text-brand-700">Agency Brain</span>
                          <span className="text-ink-300">·</span>
                          <span className="text-[11px] text-ink-500">{currentResult.searchTime}ms</span>
                        </div>
                        <p className="text-[13px] text-ink-500">
                          <Quote size={12} className="inline mr-1.5 text-ink-400" />
                          {query}
                        </p>
                      </div>

                      <div className="px-6 py-5">
                        <div className="text-[13.5px] text-ink-700 leading-relaxed space-y-1">
                          {currentResult.answer.split("\n").map((line, i) => {
                            if (line.startsWith("**") && line.includes("**")) {
                              const rendered = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-ink-900">$1</strong>');
                              return <p key={i} className="mb-1" dangerouslySetInnerHTML={{ __html: rendered }} />;
                            }
                            if (line.startsWith("•") || line.startsWith("-")) {
                              return (
                                <li key={i} className="text-[13.5px] text-ink-700 leading-relaxed ml-4 mb-1 list-disc">
                                  {line.replace(/^[•-]\s*/, "")}
                                </li>
                              );
                            }
                            if (line.trim() === "") return <div key={i} className="h-2" />;
                            const rendered = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-ink-900">$1</strong>');
                            return <p key={i} className="mb-1" dangerouslySetInnerHTML={{ __html: rendered }} />;
                          })}
                        </div>
                      </div>

                      {/* Referenced Meetings */}
                      {currentResult.sources.meetings.length > 0 && (
                        <div className="px-6 py-4 border-t border-ink-100/80 bg-ink-50/30">
                          <div className="flex items-center gap-2 mb-3">
                            <MessageSquare size={13} className="text-ink-500" />
                            <h4 className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-500">
                              Referenced Meetings
                            </h4>
                            <span className="px-1.5 py-0.5 rounded-full bg-ink-100 text-ink-600 text-[9px] font-mono">
                              {currentResult.sources.meetings.length}
                            </span>
                          </div>
                          <div className="space-y-2">
                            {currentResult.sources.meetings.map((m, i) => (
                              <Link
                                key={i}
                                href={`/dashboard/meetings/${m.id}`}
                                className="flex items-start gap-3 p-3 rounded-xl bg-white border border-ink-200/60 hover:border-brand-200/70 transition-all group"
                              >
                                <div className="w-7 h-7 rounded-lg bg-brand-50 border border-brand-100/80 flex items-center justify-center flex-shrink-0">
                                  <MessageSquare size={12} className="text-brand-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="text-[12.5px] font-medium text-ink-900 truncate group-hover:text-brand-700 transition-colors">
                                      {highlightMatch(m.title, query)}
                                    </p>
                                    <span className="text-[10px] text-ink-500 flex-shrink-0">{m.client}</span>
                                  </div>
                                  {m.summary && (
                                    <p className="text-[11px] text-ink-600 mt-0.5 line-clamp-2">
                                      {highlightMatch(m.summary.substring(0, 150), query)}
                                    </p>
                                  )}
                                  <p className="text-[10px] text-ink-500 mt-1">{formatDate(m.date)}</p>
                                </div>
                                <ExternalLink size={13} className="text-ink-400 flex-shrink-0 mt-1 group-hover:text-brand-600" />
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Referenced Decisions */}
                      {currentResult.sources.decisions.length > 0 && (
                        <div className="px-6 py-4 border-t border-ink-100/80 bg-ink-50/30">
                          <div className="flex items-center gap-2 mb-3">
                            <Lightbulb size={13} className="text-ink-500" />
                            <h4 className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-500">
                              Referenced Decisions
                            </h4>
                            <span className="px-1.5 py-0.5 rounded-full bg-ink-100 text-ink-600 text-[9px] font-mono">
                              {currentResult.sources.decisions.length}
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            {currentResult.sources.decisions.map((d, i) => (
                              <Link
                                key={i}
                                href={`/dashboard/meetings/${d.meetingId}`}
                                className="flex items-center gap-3 p-2.5 rounded-lg bg-white border border-ink-200/60 hover:border-brand-200/70 transition-all group"
                              >
                                <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[12px] font-medium text-ink-900 group-hover:text-brand-700 transition-colors">
                                    {highlightMatch(d.title, query)}
                                  </p>
                                  {d.description && (
                                    <p className="text-[11px] text-ink-500 truncate">{d.description.substring(0, 100)}</p>
                                  )}
                                  <p className="text-[10px] text-ink-500">{d.meetingTitle} · {formatDate(d.meetingDate)}</p>
                                </div>
                                {d.confidence > 0 && (
                                  <span className="text-[10px] font-medium text-brand-600 flex-shrink-0">
                                    {Math.round(d.confidence * 100)}%
                                  </span>
                                )}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Transcript sections */}
                      {currentResult.sources.transcript_sections.length > 0 && (
                        <div className="px-6 py-4 border-t border-ink-100/80 bg-ink-50/30">
                          <div className="flex items-center gap-2 mb-3">
                            <BookOpen size={13} className="text-ink-500" />
                            <h4 className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-500">
                              Transcript Excerpts
                            </h4>
                            <span className="px-1.5 py-0.5 rounded-full bg-ink-100 text-ink-600 text-[9px] font-mono">
                              {currentResult.sources.transcript_sections.length}
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            {currentResult.sources.transcript_sections.map((ts, i) => (
                              <Link
                                key={i}
                                href={`/dashboard/meetings/${ts.meetingId}`}
                                className="block p-3 rounded-lg bg-white border border-ink-200/60 hover:border-brand-200/70 transition-all group"
                              >
                                <p className="text-[12px] text-ink-700 leading-relaxed">
                                  &ldquo;{highlightMatch(ts.text.substring(0, 250), query)}&rdquo;
                                </p>
                                <p className="text-[10px] text-ink-500 mt-1.5">
                                  — {ts.meetingTitle} · {formatDate(ts.meetingDate)}
                                </p>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Search results list */}
                    {currentResult.results.length > 0 && (
                      <div>
                        <h3 className="text-[13px] font-semibold text-ink-700 mb-3">
                          All matching meetings ({currentResult.results.length})
                        </h3>
                        <div className="space-y-2">
                          {currentResult.results.map((result) => (
                            <Link
                              key={result.id}
                              href={`/dashboard/meetings/${result.id}`}
                              className="flex items-center gap-4 p-4 rounded-xl bg-white border border-ink-200/70 hover:border-brand-200/70 hover:shadow-sm transition-all group"
                            >
                              <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100/80 flex items-center justify-center flex-shrink-0">
                                <MessageSquare size={18} className="text-brand-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-[13.5px] font-medium text-ink-900 truncate group-hover:text-brand-700 transition-colors">
                                    {highlightMatch(result.title, query)}
                                  </p>
                                  {result.duration && (
                                    <span className="text-[11px] text-ink-500 flex-shrink-0">
                                      {formatDuration(result.duration)}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-ink-500">
                                  <span>{result.client}</span>
                                  <span className="text-ink-300">·</span>
                                  <span>{formatDate(result.date)}</span>
                                  {result.matchedFields.length > 0 && (
                                    <>
                                      <span className="text-ink-300">·</span>
                                      <span className="text-brand-600 font-medium">
                                        matched: {result.matchedFields.join(", ")}
                                      </span>
                                    </>
                                  )}
                                </div>
                                {result.summary && (
                                  <p className="text-[11.5px] text-ink-600 mt-1 line-clamp-1">
                                    {highlightMatch(result.summary.substring(0, 120), query)}
                                  </p>
                                )}
                              </div>
                              <ExternalLink size={14} className="text-ink-400 group-hover:text-brand-600 transition-colors flex-shrink-0" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Search history */}
                    {searchHistory.length > 1 && (
                      <div className="animate-fade-in-up stagger-2">
                        <div className="flex items-center gap-2 mb-3 mt-6">
                          <Clock size={13} className="text-ink-400" />
                          <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-500">Previous Searches</h3>
                        </div>
                        <div className="space-y-1.5">
                          {searchHistory.slice(1).map((h, i) => (
                            <button
                              key={i}
                              onClick={() => handleHistoryClick(h.query)}
                              className="w-full text-left flex items-center gap-3 p-3 rounded-xl bg-white border border-ink-200/70 hover:border-brand-200/70 transition-all group"
                            >
                              <div className="w-7 h-7 rounded-lg bg-ink-100 flex items-center justify-center flex-shrink-0">
                                <Clock size={12} className="text-ink-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] text-ink-700 truncate group-hover:text-brand-700 transition-colors">{h.query}</p>
                                <p className="text-[10.5px] text-ink-500">{h.timestamp}</p>
                              </div>
                              <ArrowRight size={13} className="text-ink-400 flex-shrink-0" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Empty results */}
                {!isSearching && currentResult && currentResult.results.length === 0 && (
                  <div className="text-center py-12">
                    <Search size={24} className="text-ink-300 mx-auto mb-3" />
                    <p className="text-[14px] font-medium text-ink-700 mb-1">No matching meetings found.</p>
                    <p className="text-[12.5px] text-ink-500 mb-4">Try adjusting your search or filters.</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {SAMPLE_QUERIES.slice(0, 3).map((q, i) => (
                        <button
                          key={i}
                          onClick={() => handleSampleClick(q)}
                          className="text-[12px] text-brand-600 hover:text-brand-700 font-medium px-3 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right sidebar */}
              <div className="hidden xl:block w-[280px] flex-shrink-0">
                <div className="sticky top-[81px] space-y-6">
                  <div className="animate-fade-in-up">
                    <div className="flex items-center gap-2.5 mb-4">
                      <div className="w-6 h-6 rounded-lg bg-ink-100 flex items-center justify-center">
                        <Hash size={12} className="text-ink-600" strokeWidth={2.2} />
                      </div>
                      <h3 className="text-[13px] font-semibold text-ink-800">Knowledge Sources</h3>
                    </div>
                    <div className="rounded-xl bg-white border border-ink-200/70 shadow-sm p-3 space-y-0.5">
                      {KNOWLEDGE_SOURCES.map((source) => {
                        const accentMap: Record<string, string> = {
                          brand: "bg-brand-50 text-brand-600",
                          emerald: "bg-emerald-50 text-emerald-600",
                          amber: "bg-amber-50 text-amber-600",
                          sky: "bg-sky-50 text-sky-600",
                        };
                        const Icon = source.icon;
                        return (
                          <div key={source.label} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-ink-50 transition-colors">
                            <div className={`w-8 h-8 rounded-lg ${accentMap[source.accent]} flex items-center justify-center`}>
                              <Icon size={14} strokeWidth={2.1} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[12.5px] font-medium text-ink-900">{source.label}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="animate-fade-in-up stagger-1">
                    <div className="rounded-xl bg-gradient-to-br from-brand-50 to-white border border-brand-100/80 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap size={13} className="text-brand-600" />
                        <h4 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-brand-700">Tips</h4>
                      </div>
                      <ul className="space-y-1.5">
                        {[
                          "Ask about specific clients like 'Nike' or 'Helios Labs'",
                          'Use keywords: "decisions", "action items", "meetings"',
                          'Filter by topic: "pricing", "marketing", "product"',
                          'Ask about timeframes: "this month", "last quarter"',
                        ].map((tip, i) => (
                          <li key={i} className="flex items-start gap-2 text-[11.5px] text-ink-600">
                            <span className="mt-1 w-1 h-1 rounded-full bg-brand-400 flex-shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
