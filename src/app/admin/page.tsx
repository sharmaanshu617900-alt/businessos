"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Users,
  UserPlus,
  Building2,
  Users2,
  Search,
  ArrowUpDown,
  Calendar,
  Loader2,
  AlertCircle,
  RefreshCw,
  Mail,
  Download,
} from "lucide-react";

interface WaitlistEntry {
  id: number;
  name: string;
  email: string;
  agency: string;
  team_size: string;
  created_at: string;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminDashboard() {
  const [data, setData] = useState<WaitlistEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortField, setSortField] = useState<"created_at" | "name" | "email" | "agency" | "team_size">("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Debounce search input
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);

      const res = await fetch(`/api/admin/waitlist?${params}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));

        if (body.error === "rls_blocked") {
          setError(
            "Supabase RLS policy is blocking access. Please run the SQL command shown below to fix this."
          );
        } else {
          setError(body.message || "Failed to load data.");
        }
        setData([]);
        setTotal(0);
        return;
      }

      const json = await res.json();
      setData(json.data ?? []);
      setTotal(json.total ?? 0);
    } catch {
      setError("Failed to connect to the server.");
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Client-side sorting
  const sorted = [...data].sort((a, b) => {
    let cmp = 0;
    switch (sortField) {
      case "name":
        cmp = a.name.localeCompare(b.name);
        break;
      case "email":
        cmp = a.email.localeCompare(b.email);
        break;
      case "agency":
        cmp = a.agency.localeCompare(b.agency);
        break;
      case "team_size":
        cmp = a.team_size.localeCompare(b.team_size);
        break;
      case "created_at":
      default:
        cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  // Stats
  const todayCount = data.filter(
    (d) => new Date(d.created_at).toDateString() === new Date().toDateString()
  ).length;

  const teamSizeCounts: Record<string, number> = {};
  data.forEach((d) => {
    teamSizeCounts[d.team_size] = (teamSizeCounts[d.team_size] || 0) + 1;
  });

  const uniqueAgencies = new Set(data.map((d) => d.agency.toLowerCase())).size;

  const downloadCSV = () => {
    const headers = ["Name", "Email", "Agency", "Team Size", "Date Joined"];
    const rows = sorted.map((d) => [
      d.name,
      d.email,
      d.agency,
      d.team_size,
      formatDate(d.created_at),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "waitlist-signups.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <header className="border-b border-white/5 bg-black/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-600 flex items-center justify-center">
              <Users size={16} className="text-white" />
            </div>
            <span className="font-semibold font-heading">
              Agency<span className="text-brand-400">OS</span>{" "}
              <span className="text-gray-500 font-normal text-sm">Admin</span>
            </span>
          </div>
        </header>

        <div className="max-w-3xl mx-auto px-4 py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={32} className="text-red-400" />
          </div>
          <h2 className="text-2xl font-bold font-heading mb-4">
            Waitlist Table Not Accessible
          </h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto leading-relaxed">
            {error}
          </p>

          <div className="glass-panel rounded-2xl p-6 text-left mb-8">
            <p className="text-sm font-semibold text-white mb-3">
              Run this SQL in your Supabase SQL Editor:
            </p>
            <pre className="text-xs text-gray-300 bg-black/50 rounded-xl p-4 overflow-x-auto leading-relaxed">
{`-- Allow SELECT for anonymous users (admin dashboard)
CREATE POLICY "Enable select for anonymous users"
  ON waitlist_signups
  FOR SELECT
  TO anon
  USING (true);`}
            </pre>
          </div>

          <button
            onClick={fetchData}
            className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/5 bg-black/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-600 flex items-center justify-center">
              <Users size={16} className="text-white" />
            </div>
            <span className="font-semibold font-heading">
              Agency<span className="text-brand-400">OS</span>{" "}
              <span className="text-gray-500 font-normal text-sm">
                Admin
              </span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={downloadCSV}
              disabled={data.length === 0}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-gray-400 hover:text-white hover:border-white/20 transition-all duration-200 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download size={14} />
              Export CSV
            </button>
            <button
              onClick={fetchData}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all duration-200"
              title="Refresh"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-panel rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                <Users size={18} className="text-brand-400" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold font-heading tracking-tight">
              {loading ? "—" : total}
            </p>
            <p className="text-xs text-gray-500 mt-1">Total Signups</p>
          </div>

          <div className="glass-panel rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-accent-500/10 border border-accent-500/20 flex items-center justify-center">
                <UserPlus size={18} className="text-accent-400" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold font-heading tracking-tight">
              {loading ? "—" : todayCount}
            </p>
            <p className="text-xs text-gray-500 mt-1">Joined Today</p>
          </div>

          <div className="glass-panel rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Building2 size={18} className="text-emerald-400" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold font-heading tracking-tight">
              {loading ? "—" : uniqueAgencies}
            </p>
            <p className="text-xs text-gray-500 mt-1">Unique Agencies</p>
          </div>

          <div className="glass-panel rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Users2 size={18} className="text-amber-400" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold font-heading tracking-tight">
              {loading ? "—" : Object.keys(teamSizeCounts).length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Team Size Groups</p>
          </div>
        </div>

        {/* Team Size Distribution */}
        {!loading && data.length > 0 && (
          <div className="glass-panel rounded-2xl p-6 mb-8">
            <h3 className="text-sm font-semibold font-heading mb-4">
              Team Size Distribution
            </h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries(teamSizeCounts)
                .sort(([a], [b]) => {
                  const order = ["1-5", "6-15", "16-30", "31-50", "50+"];
                  return order.indexOf(a) - order.indexOf(b);
                })
                .map(([size, count]) => {
                  const maxCount = Math.max(...Object.values(teamSizeCounts));
                  const pct = (count / maxCount) * 100;
                  return (
                    <div key={size} className="flex-1 min-w-[100px]">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-gray-400">{size}</span>
                        <span className="text-xs font-medium text-white">
                          {count}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all duration-500"
                          style={{ width: `${Math.max(pct, 4)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Search & Table */}
        <div className="glass-panel rounded-2xl overflow-hidden">
          {/* Search Bar */}
          <div className="p-4 border-b border-white/5">
            <div className="relative max-w-sm">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />
              <input
                type="text"
                placeholder="Search by name, email, or agency..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all duration-200"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {[
                    { key: "name", label: "Name" },
                    { key: "email", label: "Email" },
                    { key: "agency", label: "Agency" },
                    { key: "team_size", label: "Team" },
                    { key: "created_at", label: "Joined" },
                  ].map((col) => (
                    <th
                      key={col.key}
                      className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-300 transition-colors select-none"
                      onClick={() =>
                        toggleSort(col.key as typeof sortField)
                      }
                    >
                      <div className="flex items-center gap-1.5">
                        {col.label}
                        {sortField === col.key && (
                          <ArrowUpDown
                            size={12}
                            className={`text-brand-400 transition-transform ${
                              sortDir === "asc" ? "rotate-180" : ""
                            }`}
                          />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-16 text-center">
                      <Loader2
                        size={20}
                        className="animate-spin mx-auto text-gray-500"
                      />
                    </td>
                  </tr>
                ) : sorted.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Mail
                          size={24}
                          className="text-gray-600"
                        />
                        <p className="text-sm text-gray-500">
                          {search
                            ? "No signups match your search."
                            : "No waitlist signups yet."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sorted.map((entry) => (
                    <tr
                      key={entry.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <span className="font-medium text-white">
                          {entry.name}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <a
                          href={`mailto:${entry.email}`}
                          className="text-brand-400 hover:text-brand-300 transition-colors"
                        >
                          {entry.email}
                        </a>
                      </td>
                      <td className="px-4 py-3.5 text-gray-300">
                        {entry.agency}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2.5 py-0.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-gray-400">
                          {entry.team_size}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Calendar size={12} />
                          <span className="text-xs whitespace-nowrap">
                            {formatDate(entry.created_at)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {!loading && data.length > 0 && (
            <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Showing {sorted.length} of {total} signups
              </p>
              <p className="text-xs text-gray-600">
                Page 1 of 1
              </p>
            </div>
          )}
        </div>

        {/* Footer note */}
        <p className="mt-6 text-xs text-gray-600 text-center">
          Admin dashboard — view-only. Data fetched from Supabase in real-time.
        </p>
      </main>
    </div>
  );
}
