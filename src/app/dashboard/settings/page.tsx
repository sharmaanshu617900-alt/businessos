"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  User,
  Bell,
  Shield,
  Save,
  Loader2,
  Check,
} from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const userMeta = user?.user_metadata || {};
  const [formData, setFormData] = useState({
    name: (userMeta.name as string) || "",
    email: user?.email || "",
    agencyName: (userMeta.agency_name as string) || "",
    teamSize: (userMeta.team_size as string) || "",
  });

  const [notifications, setNotifications] = useState({
    emailDigest: true,
    meetingAlerts: true,
    weeklyReport: false,
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleNotificationChange = (field: string) => {
    setNotifications((prev) => ({
      ...prev,
      [field]: !prev[field as keyof typeof prev],
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-3xl">
      <div className="mb-8">
        <h1 className="heading-display text-[36px] lg:text-[44px] text-[#1d1d1f]">
          Settings
        </h1>
        <p className="text-[#86868b] mt-1">
          Manage your account and preferences.
        </p>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-2xl p-6 mb-6 border border-[#e5e5e7]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-[#0071e3]/10 border border-[#0071e3]/20 flex items-center justify-center">
            <User size={16} className="text-[#0071e3]" />
          </div>
          <h2 className="text-lg font-semibold text-[#1d1d1f]">Profile</h2>
        </div>

        <div className="space-y-5">
          <div>
            <label htmlFor="settings-name" className="block text-sm font-medium text-[#86868b] mb-1.5">
              Full Name
            </label>
            <input
              id="settings-name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-3 rounded-xl bg-[#f5f5f7] border border-[#e5e5e7] text-[#1d1d1f] placeholder:text-[#a1a1a6] focus:outline-none focus:border-[#0071e3]/40 focus:ring-2 focus:ring-[#0071e3]/10 transition-all duration-200"
            />
          </div>

          <div>
            <label htmlFor="settings-email" className="block text-sm font-medium text-[#86868b] mb-1.5">
              Email Address
            </label>
            <input
              id="settings-email"
              type="email"
              value={formData.email}
              disabled
              className="w-full px-4 py-3 rounded-xl bg-[#f5f5f7] border border-[#e5e5e7] text-[#a1a1a6] cursor-not-allowed"
            />
            <p className="text-xs text-[#a1a1a6] mt-1">
              Email cannot be changed here.
            </p>
          </div>

          <div>
            <label htmlFor="settings-agency" className="block text-sm font-medium text-[#86868b] mb-1.5">
              Agency Name
            </label>
            <input
              id="settings-agency"
              type="text"
              value={formData.agencyName}
              onChange={(e) => handleChange("agencyName", e.target.value)}
              placeholder="Your agency name"
              className="w-full px-4 py-3 rounded-xl bg-[#f5f5f7] border border-[#e5e5e7] text-[#1d1d1f] placeholder:text-[#a1a1a6] focus:outline-none focus:border-[#0071e3]/40 focus:ring-2 focus:ring-[#0071e3]/10 transition-all duration-200"
            />
          </div>

          <div>
            <label htmlFor="settings-team" className="block text-sm font-medium text-[#86868b] mb-1.5">
              Team Size
            </label>
            <select
              id="settings-team"
              value={formData.teamSize}
              onChange={(e) => handleChange("teamSize", e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#f5f5f7] border border-[#e5e5e7] text-[#1d1d1f] focus:outline-none focus:border-[#0071e3]/40 focus:ring-2 focus:ring-[#0071e3]/10 transition-all duration-200 appearance-none"
            >
              <option value="">Select team size</option>
              <option value="1-5">1-5 people</option>
              <option value="6-15">6-15 people</option>
              <option value="16-30">16-30 people</option>
              <option value="31-50">31-50 people</option>
              <option value="50+">50+ people</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="bg-white rounded-2xl p-6 mb-6 border border-[#e5e5e7]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-[#0071e3]/10 border border-[#0071e3]/20 flex items-center justify-center">
            <Bell size={16} className="text-[#0071e3]" />
          </div>
          <h2 className="text-lg font-semibold text-[#1d1d1f]">Notifications</h2>
        </div>

        <div className="space-y-4">
          {[
            { key: "emailDigest", label: "Email Digest", description: "Receive a daily summary of meeting activity" },
            { key: "meetingAlerts", label: "Meeting Alerts", description: "Get notified when a new meeting is processed" },
            { key: "weeklyReport", label: "Weekly Report", description: "Receive a weekly report of action items and decisions" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e7]">
              <div>
                <p className="font-medium text-sm text-[#1d1d1f]">{item.label}</p>
                <p className="text-xs text-[#86868b] mt-0.5">{item.description}</p>
              </div>
              <button
                onClick={() => handleNotificationChange(item.key)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                  notifications[item.key as keyof typeof notifications]
                    ? "bg-[#0071e3]"
                    : "bg-[#d2d2d7]"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                    notifications[item.key as keyof typeof notifications]
                      ? "translate-x-[22px]"
                      : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white rounded-2xl p-6 mb-6 border border-[#e5e5e7]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-[#1d8348]/10 border border-[#1d8348]/20 flex items-center justify-center">
            <Shield size={16} className="text-[#1d8348]" />
          </div>
          <h2 className="text-lg font-semibold text-[#1d1d1f]">Security</h2>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e7]">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-[#1d1d1f]">Password</p>
                <p className="text-xs text-[#86868b] mt-0.5">Last changed: Never</p>
              </div>
              <button className="px-4 py-2 rounded-lg bg-[#f5f5f7] border border-[#e5e5e7] text-sm text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#e5e5e7] transition-all duration-200">
                Change Password
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#fafafa] border border-[#e5e5e7]">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-[#1d1d1f]">Two-Factor Auth</p>
                <p className="text-xs text-[#86868b] mt-0.5">Add an extra layer of security</p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-[#9a6700]/10 border border-[#9a6700]/20 text-[#9a6700]">
                Coming Soon
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1d1d1f] text-white font-medium transition-all duration-200 hover:bg-[#2d2d2f] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <Check size={16} />
              Saved!
            </>
          ) : (
            <>
              <Save size={16} />
              Save Changes
            </>
          )}
        </button>

        {saved && (
          <span className="text-sm text-[#1d8348] animate-fade-in">
            Settings saved successfully!
          </span>
        )}
      </div>
    </div>
  );
}
