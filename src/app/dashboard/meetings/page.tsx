"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  Calendar,
  Search,
  Plus,
  Clock,
  Trash2,
  Upload,
  HardDrive,
} from "lucide-react";
import type { Meeting } from "@/lib/types/database";

function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024 * 1024) return (bytes / 1024 ** 3).toFixed(2) + " GB";
  if (bytes >= 1024 * 1024) return (bytes / 1024 ** 2).toFixed(1) + " MB";
  return (bytes / 1024).toFixed(1) + " KB";
}

function formatDuration(seconds: number | null) {
  if (!seconds) return null;
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins} min`;
}

function statusDisplay(status: string, processingStatus?: string | null) {
  // Show more specific status based on processing_status
  if (processingStatus === "ready") {
    return { label: "Ready for Transcription", color: "bg-[#eafaf1] text-[#1d8348] border border-[#1d8348]/15" };
  }
  if (processingStatus && processingStatus !== "ready" && processingStatus !== "failed") {
    return { label: "Processing", color: "bg-[#fef9ec] text-[#9a6700] border border-[#9a6700]/15" };
  }
  if (processingStatus === "failed") {
    return { label: "Failed", color: "bg-[#fdf2f0] text-[#c0392b] border border-[#c0392b]/15" };
  }
  switch (status) {
    case "uploaded":
      return { label: "Uploaded", color: "bg-[#e8f0fb] text-[#0071e3] border border-[#0071e3]/15" };
    case "processing":
      return { label: "Processing", color: "bg-[#fef9ec] text-[#9a6700] border border-[#9a6700]/15" };
    case "completed":
      return { label: "Ready for Transcription", color: "bg-[#eafaf1] text-[#1d8348] border border-[#1d8348]/15" };
    case "failed":
      return { label: "Failed", color: "bg-[#fdf2f0] text-[#c0392b] border border-[#c0392b]/15" };
    default:
      return { label: status, color: "bg-[#f5f5f7] text-[#86868b] border border-[#e5e5e7]" };
  }
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterClient, setFilterClient] = useState("all");
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const res = await fetch("/api/meetings");
      if (res.ok) {
        const data = await res.json();
        setMeetings(data.meetings || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const filteredMeetings = meetings.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.client_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClient =
      filterClient === "all" || m.client_name === filterClient;
    return matchesSearch && matchesClient;
  });

  const sortedMeetings = [...filteredMeetings].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const uniqueClients = [...new Set(meetings.map((m) => m.client_name))].sort();

  const handleDelete = async (meetingId: string) => {
    setDeleting(meetingId);
    try {
      const res = await fetch(`/api/meetings/${meetingId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMeetings((prev) => prev.filter((m) => m.id !== meetingId));
      }
    } catch {
      // ignore
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-[#0071e3] border-t-transparent animate-spin" />
          <span className="text-[#86868b]">Loading meetings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 lg:p-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="heading-display text-[36px] lg:text-[44px] text-[#1d1d1f]">
            Meetings
          </h1>
          <p className="text-[#86868b] mt-1">
            All your meeting recordings and transcripts.
          </p>
        </div>
        <Link
          href="/dashboard/upload"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0071e3] text-white font-medium transition-all duration-200 hover:bg-[#0062c9] shadow-sm"
        >
          <Upload size={16} />
          Upload Meeting
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a1a6]"
          />
          <input
            type="text"
            placeholder="Search meetings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-[#e5e5e7] text-[#1d1d1f] placeholder:text-[#a1a1a6] focus:outline-none focus:border-[#0071e3]/40 focus:ring-2 focus:ring-[#0071e3]/10 transition-all duration-200"
          />
        </div>

        {uniqueClients.length > 0 && (
          <select
            value={filterClient}
            onChange={(e) => setFilterClient(e.target.value)}
            className="px-4 py-3 rounded-xl bg-white border border-[#e5e5e7] text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]/40 focus:ring-2 focus:ring-[#0071e3]/10 transition-all duration-200 appearance-none pr-10"
          >
            <option value="all" className="bg-white">
              All Clients
            </option>
            {uniqueClients.map((client) => (
              <option key={client} value={client} className="bg-white">
                {client}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Meetings List */}
      {sortedMeetings.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#e5e5e7]">
          <div className="w-16 h-16 rounded-full bg-[#0071e3]/10 border border-[#0071e3]/20 flex items-center justify-center mx-auto mb-4">
            <FileText size={28} className="text-[#0071e3]" />
          </div>
          <h3 className="text-lg font-display text-[#1d1d1f] mb-2">
            {meetings.length === 0 ? "No meetings yet" : "No matching meetings"}
          </h3>
          <p className="text-sm text-[#86868b] max-w-sm mx-auto mb-6">
            {meetings.length === 0
              ? "Upload your first meeting to start building your agency memory."
              : "Try adjusting your search or filter criteria."}
          </p>
          {meetings.length === 0 && (
            <Link
              href="/dashboard/upload"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0071e3] text-white font-medium transition-all duration-200 hover:bg-[#0062c9]"
            >
              <Plus size={16} />
              Upload Meeting
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {sortedMeetings.map((meeting) => (
            <div
              key={meeting.id}
              className="bg-white rounded-xl p-5 flex items-center gap-4 border border-[#e5e5e7] hover:bg-[#fafafa] transition-colors group"
            >
              <Link
                href={`/dashboard/meetings/${meeting.id}`}
                className="flex items-center gap-4 flex-1 min-w-0"
              >
                <div className="w-11 h-11 rounded-xl bg-[#0071e3]/10 border border-[#0071e3]/20 flex items-center justify-center flex-shrink-0">
                  <FileText size={20} className="text-[#0071e3]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#1d1d1f] truncate group-hover:text-[#0071e3] transition-colors">
                    {meeting.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-[#86868b]">
                      {meeting.client_name}
                    </span>
                    <span className="text-[#c7c7cc]">·</span>
                    <span className="text-xs text-[#86868b] flex items-center gap-1">
                      <Calendar size={10} />
                      {new Date(meeting.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    {meeting.duration && meeting.duration > 0 && (
                      <>
                        <span className="text-[#c7c7cc]">·</span>
                        <span className="text-xs text-[#86868b] flex items-center gap-1">
                          <Clock size={10} />
                          {formatDuration(meeting.duration)}
                        </span>
                      </>
                    )}
                    {meeting.file_size > 0 && (
                      <>
                        <span className="text-[#c7c7cc]">·</span>
                        <span className="text-xs text-[#86868b] flex items-center gap-1">
                          <HardDrive size={10} />
                          {formatFileSize(meeting.file_size)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10.5px] font-medium px-2 py-0.5 rounded-full ${statusDisplay(meeting.status, meeting.processing_status).color}`}>
                    {statusDisplay(meeting.status, meeting.processing_status).label}
                  </span>
                  <div className="text-xs text-[#a1a1a6] hidden sm:flex items-center gap-1">
                    <Clock size={10} />
                    {new Date(meeting.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </Link>

              <button
                onClick={() => handleDelete(meeting.id)}
                disabled={deleting === meeting.id}
                className="p-2 rounded-lg text-[#a1a1a6] hover:text-[#c0392b] hover:bg-[#c0392b]/10 transition-all duration-200 opacity-0 group-hover:opacity-100 disabled:opacity-50"
                title="Delete meeting"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Count */}
      {sortedMeetings.length > 0 && (
        <p className="mt-4 text-xs text-[#a1a1a6] text-center">
          {sortedMeetings.length} of {meetings.length} meetings
        </p>
      )}
    </div>
  );
}
