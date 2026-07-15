"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Bell, CheckCheck, X, Clock, Sparkles, FileText, AlertTriangle, Languages, Users } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  metadata: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

const NOTIFICATION_ICONS: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  transcript_ready: { icon: FileText, color: "text-[#0071e3]", bg: "bg-[#e8f0fb]" },
  analysis_complete: { icon: Sparkles, color: "text-[#1d8348]", bg: "bg-[#eafaf1]" },
  diarization_complete: { icon: Users, color: "text-[#9a6700]", bg: "bg-[#fef9ec]" },
  translation_complete: { icon: Languages, color: "text-[#8b5cf6]", bg: "bg-[#f3e8ff]" },
  processing_failed: { icon: AlertTriangle, color: "text-[#c0392b]", bg: "bg-[#fdf2f0]" },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications?limit=20");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        open &&
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const markAllRead = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications", { method: "PATCH" });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: "PATCH" });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch {
      // ignore
    }
  };

  const getMeetingLink = (n: Notification) => {
    const meetingId = n.metadata?.meeting_id as string | undefined;
    if (meetingId) return `/dashboard/meetings/${meetingId}`;
    return "#";
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] transition-all"
        aria-label="Notifications"
      >
        <Bell size={18} strokeWidth={1.5} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-[#0071e3] text-white text-[9px] font-bold flex items-center justify-center border-2 border-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          className="absolute top-full right-0 mt-2 w-[380px] max-h-[520px] bg-white rounded-2xl border border-[#e5e5e7] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12)] overflow-hidden z-50 animate-fade-in-up"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e5e7]">
            <div className="flex items-center gap-2">
              <Bell size={15} className="text-[#86868b]" strokeWidth={1.5} />
              <h3 className="text-[14px] font-semibold text-[#1d1d1f]">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-[#0071e3]/10 text-[#0071e3] text-[10px] font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                disabled={loading}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] transition-colors"
              >
                <CheckCheck size={13} />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto max-h-[440px]">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center py-12 px-6 text-center">
                <Bell size={24} className="text-[#d2d2d7] mb-3" strokeWidth={1.5} />
                <p className="text-[13px] font-medium text-[#86868b]">No notifications yet</p>
                <p className="text-[11px] text-[#a1a1a6] mt-1">
                  You&apos;ll be notified when AI processing completes.
                </p>
              </div>
            ) : (
              notifications.map((n) => {
                const config = NOTIFICATION_ICONS[n.type] || {
                  icon: Bell,
                  color: "text-[#86868b]",
                  bg: "bg-[#f5f5f7]",
                };
                const Icon = config.icon;
                const meetingLink = getMeetingLink(n);

                return (
                  <Link
                    key={n.id}
                    href={meetingLink}
                    onClick={() => {
                      if (!n.read) markRead(n.id);
                    }}
                    className={`flex items-start gap-3.5 px-5 py-4 transition-colors border-b border-[#f0f0f2] last:border-0 ${
                      n.read
                        ? "hover:bg-[#fafafa]"
                        : "bg-[#0071e3]/[0.02] hover:bg-[#0071e3]/[0.04]"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}
                    >
                      <Icon size={16} className={config.color} strokeWidth={1.8} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-[12.5px] leading-snug ${
                            n.read ? "text-[#1d1d1f]" : "text-[#1d1d1f] font-semibold"
                          }`}
                        >
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className="mt-1 w-2 h-2 rounded-full bg-[#0071e3] flex-shrink-0" />
                        )}
                      </div>
                      {n.body && (
                        <p className="text-[11.5px] text-[#86868b] mt-1 leading-relaxed line-clamp-2">
                          {n.body}
                        </p>
                      )}
                      <p className="text-[10px] text-[#a1a1a6] mt-1.5 flex items-center gap-1">
                        <Clock size={9} />
                        {timeAgo(n.created_at)}
                      </p>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
