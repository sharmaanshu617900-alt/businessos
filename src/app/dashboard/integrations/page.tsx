"use client";

import { useState, useEffect } from "react";
import {
  Video,
  VideoIcon,
  MessageSquare,
  HardDrive,
  Puzzle,
  ArrowRight,
  Check,
} from "lucide-react";

interface IntegrationData {
  id: string;
  provider: string;
  connected: boolean;
}

const PROVIDERS = [
  {
    id: "zoom",
    name: "Zoom",
    description: "Automatically record and transcribe Zoom meetings.",
    icon: Video,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    category: "Video Conferencing",
  },
  {
    id: "google_meet",
    name: "Google Meet",
    description: "Record Google Meet sessions and extract meeting notes.",
    icon: VideoIcon,
    color: "text-green-500",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    category: "Video Conferencing",
  },
  {
    id: "slack",
    name: "Slack",
    description: "Sync Slack channels to capture decisions and discussions.",
    icon: MessageSquare,
    color: "text-purple-500",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    category: "Communication",
  },
  {
    id: "google_drive",
    name: "Google Drive",
    description: "Import documents and meeting notes from Google Drive.",
    icon: HardDrive,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    category: "Storage",
  },
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<IntegrationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const res = await fetch("/api/integrations");
      if (res.ok) {
        const data = await res.json();
        setIntegrations(data.integrations || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (provider: string) => {
    setToggling(provider);
    try {
      const res = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });
      if (res.ok) {
        const data = await res.json();
        const integration = data.integration;
        setIntegrations((prev) => {
          const exists = prev.find((i) => i.provider === provider);
          if (exists) {
            return prev.map((i) =>
              i.provider === provider
                ? { ...i, connected: integration.connected }
                : i
            );
          }
          return [...prev, integration];
        });
      }
    } catch {
      // ignore
    } finally {
      setToggling(null);
    }
  };

  const isConnected = (provider: string) =>
    integrations.find((i) => i.provider === provider)?.connected || false;

  const connectedCount = PROVIDERS.filter((p) => isConnected(p.id)).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-[#0071e3] border-t-transparent animate-spin" />
          <span className="text-[#86868b]">Loading integrations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 lg:p-10">
      <div className="mb-8">
        <h1 className="heading-display text-[36px] lg:text-[44px] text-[#1d1d1f] leading-[1.0]">
          Integrations
        </h1>
        <p className="text-[#86868b] mt-2">
          Connect your favorite tools to MeetingOS.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 border border-[#e5e5e7]">
          <p className="heading-display text-[36px] text-[#1d1d1f] leading-[0.9]">{connectedCount}</p>
          <p className="text-xs text-[#86868b] mt-2">Connected</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-[#e5e5e7]">
          <p className="heading-display text-[36px] text-[#1d1d1f] leading-[0.9]">
            {PROVIDERS.length - connectedCount}
          </p>
          <p className="text-xs text-[#86868b] mt-2">Available</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-[#e5e5e7]">
          <p className="heading-display text-[36px] text-[#1d1d1f] leading-[0.9]">{PROVIDERS.length}</p>
          <p className="text-xs text-[#86868b] mt-2">Total Integrations</p>
        </div>
      </div>

      {/* Integration Cards */}
      <div className="grid gap-4">
        {PROVIDERS.map((provider) => {
          const Icon = provider.icon;
          const connected = isConnected(provider.id);
          const isToggling = toggling === provider.id;

          return (
            <div
              key={provider.id}
              className="bg-white rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 border border-[#e5e5e7]"
            >
              <div className={`w-14 h-14 rounded-xl ${provider.bgColor} border ${provider.borderColor} flex items-center justify-center flex-shrink-0`}>
                <Icon size={26} className={provider.color} strokeWidth={1.5} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-[#1d1d1f]">{provider.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#f5f5f7] border border-[#e5e5e7] text-[#86868b]">
                    {provider.category}
                  </span>
                </div>
                <p className="text-sm text-[#86868b] leading-relaxed">{provider.description}</p>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto">
                {connected ? (
                  <>
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#eafaf1] border border-[#1d8348]/20 text-[#1d8348] text-sm font-medium">
                      <Check size={16} />
                      Connected
                    </div>
                    <button
                      onClick={() => handleToggle(provider.id)}
                      disabled={isToggling}
                      className="px-4 py-2.5 rounded-xl bg-[#f5f5f7] border border-[#e5e5e7] text-[#86868b] hover:text-[#1d1d1f] text-sm font-medium transition-all duration-200 hover:bg-[#e5e5e7] disabled:opacity-50"
                    >
                      {isToggling ? "..." : "Disconnect"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleToggle(provider.id)}
                    disabled={isToggling}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0071e3] text-white text-sm font-medium transition-all duration-200 hover:bg-[#0062c9] disabled:opacity-60"
                  >
                    {isToggling ? "..." : "Connect"}
                    {!isToggling && <ArrowRight size={14} />}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Coming Soon */}
      <div className="mt-8 bg-white rounded-2xl p-6 border border-[#e5e5e7]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-[#0071e3]/10 border border-[#0071e3]/20 flex items-center justify-center">
            <Puzzle size={16} className="text-[#0071e3]" />
          </div>
          <h3 className="font-display text-[18px] text-[#1d1d1f]">More Coming Soon</h3>
        </div>
        <p className="text-sm text-[#86868b] leading-relaxed">
          We&apos;re working on integrations with Notion, Asana, Trello, Microsoft Teams, and more.
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          {["Notion", "Asana", "Trello", "Microsoft Teams", "HubSpot"].map((name) => (
            <span key={name} className="text-xs px-3 py-1.5 rounded-full bg-[#f5f5f7] border border-[#e5e5e7] text-[#86868b]">
              {name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
