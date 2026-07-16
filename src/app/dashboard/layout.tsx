"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard,
  Video,
  Building2,
  CheckCircle2,

  Brain,
  Puzzle,
  Settings,
  Menu,
  X,
  LogOut,
  ArrowUpRight,
  Upload,
  MessageSquare,
} from "lucide-react";
import NotificationCenter from "@/components/NotificationCenter";
import Logo from "@/app/components/Logo";

const sidebarLinks = [
  { label: "Dashboard",      href: "/dashboard",           icon: LayoutDashboard, group: "Overview" },
  { label: "Meetings",       href: "/dashboard/meetings",  icon: Video,           group: "Overview" },
  { label: "Upload",         href: "/dashboard/upload",    icon: Upload,          group: "Overview" },
  { label: "Clients",        href: "/dashboard/clients",   icon: Building2,       group: "Knowledge" },
  { label: "Decisions",      href: "/dashboard/decisions", icon: CheckCircle2,    group: "Knowledge" },
  { label: "AI Chat",        href: "/dashboard/chat",     icon: MessageSquare,   group: "Intelligence" },
  { label: "Agency Brain",   href: "/dashboard/search",    icon: Brain,           group: "Intelligence" },
  { label: "Integrations",   href: "/dashboard/integrations", icon: Puzzle,       group: "Account" },
  { label: "Settings",       href: "/dashboard/settings",  icon: Settings,        group: "Account" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    window.location.href = "/";
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const userMeta = user?.user_metadata || {};
  const displayName =
    (userMeta.name as string) || user?.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");

  const grouped = sidebarLinks.reduce<Record<string, typeof sidebarLinks>>(
    (acc, link) => {
      (acc[link.group] ||= []).push(link);
      return acc;
    },
    {}
  );

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-[240px] z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 bg-white border-r border-[#e5e5e7] ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="h-[52px] flex items-center justify-between px-5 border-b border-[#e5e5e7]">
          <Logo size="sm" variant="inline" />
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {Object.entries(grouped).map(([group, links]) => (
            <div key={group} className="mb-5">
              <p className="px-3 mb-2 eyebrow text-[#a1a1a6] text-[10px]">{group}</p>
              <div className="space-y-0.5">
                {links.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`group relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all duration-150 ${
                        active
                          ? "bg-[#f5f5f7] text-[#1d1d1f]"
                          : "text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#fafafa]"
                      }`}
                    >
                      {active && (
                        <span
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 rounded-full bg-[#0071e3]"
                        />
                      )}
                      <Icon
                        size={15}
                        strokeWidth={active ? 1.8 : 1.5}
                        className="shrink-0"
                        style={{ color: active ? "#0071e3" : undefined }}
                      />
                      <span className="flex-1 tracking-tight">{link.label}</span>
                      {active && (
                        <ArrowUpRight
                          size={11}
                          className="text-[#a1a1a6] opacity-60"
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Profile */}
        <div className="border-t border-[#e5e5e7] p-3">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[#f5f5f7] transition-colors group">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-medium shrink-0"
              style={{
                background: "linear-gradient(135deg, #0071e3, #0062c9)",
              }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12.5px] font-medium truncate text-[#1d1d1f]">
                {displayName}
              </p>
              <p className="text-[11px] text-[#a1a1a6] truncate">
                {user?.email}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="p-1.5 text-[#a1a1a6] hover:text-[#1d1d1f] hover:bg-[#e5e5e7] rounded-lg transition-colors"
              title="Sign out"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="lg:ml-[240px] min-h-screen flex flex-col">
        {/* Mobile header */}
        <header
          className="sticky top-0 z-30 h-[52px] flex items-center justify-between px-5 lg:hidden border-b border-[#e5e5e7] bg-white/85 backdrop-glass"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 -ml-1.5 text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] rounded-lg transition-colors"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <Logo size="sm" variant="inline" />
          </div>
        </header>

        {/* Desktop header */}
        <header className="hidden lg:flex sticky top-0 z-30 h-[52px] items-center justify-end px-6 gap-2 border-b border-[#e5e5e7] bg-white/85 backdrop-glass">
          <NotificationCenter />
          <Link
            href="/dashboard/upload"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0071e3] text-white text-[13px] font-medium hover:bg-[#0062c9] transition-colors shadow-sm"
          >
            <Upload size={14} />
            Upload Meeting
          </Link>
        </header>

        <main className="flex-1 relative">{children}</main>
      </div>
    </div>
  );
}
