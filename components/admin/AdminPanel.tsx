'use client';

import React, { useState } from 'react';
import { Property } from '../../lib/types';
import { t } from '../../lib/i18n';
import { useListings } from '../../lib/listings-context';
import { formatPrice, formatDate } from '../../lib/utils';
import { mockUsers } from '../../lib/mock-data';

interface AdminPanelProps {
  onBack: () => void;
  onLogout?: () => void;
}

export default function AdminPanel({ onBack, onLogout }: AdminPanelProps) {
  const { listings, removeListing, updateListing } = useListings();
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'users' | 'areas'>('overview');

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/session', { method: 'DELETE' });
    } catch {}
    localStorage.removeItem('admin_session');
    onLogout?.();
  };

  const stats = {
    totalListings: listings.length,
    activeListings: listings.filter((l) => l.status === 'active').length,
    flaggedListings: listings.filter((l) => l.status === 'flagged').length,
    totalUsers: mockUsers.length,
    totalOwners: mockUsers.filter((u) => u.role === 'owner').length,
    verifiedPending: listings.filter((l) => l.verified === 'pending').length,
    searchesToday: 1247,
    topAreas: [
      { name: 'Lajpat Nagar', count: 89 },
      { name: 'Saket', count: 76 },
      { name: 'Dwarka', count: 64 },
      { name: 'Defence Colony', count: 52 },
      { name: 'Hauz Khas', count: 48 },
    ],
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900">
      {/* Header */}
      <div className="px-4 py-4 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex-1">{t('admin.title')}</h1>
          {onLogout && (
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-semibold rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              Logout
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
          {(['overview', 'listings', 'users', 'areas'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: t('admin.totalListings'), value: stats.totalListings, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="1.8" strokeLinecap="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg> },
                { label: t('admin.activeListings'), value: stats.activeListings, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
                { label: t('admin.flagged'), value: stats.flaggedListings, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg> },
                { label: t('admin.users'), value: stats.totalUsers, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="1.8" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
                { label: 'Pending Verification', value: stats.verifiedPending, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EC4899" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
                { label: 'Searches Today', value: stats.searchesToday.toLocaleString(), icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06B6D4" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
              ].map((stat, i) => (
                <div key={i} className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="flex-shrink-0">{stat.icon}</span>
                    <span className="text-xs text-zinc-500">{stat.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stat.value}</p>
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">{t('admin.topAreas')}</h3>
              <div className="space-y-2">
                {stats.topAreas.map((area, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                    <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                    <span className="flex-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">{area.name}</span>
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{area.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Listings Management */}
        {activeTab === 'listings' && (
          <div className="space-y-3">
            {listings.map((listing) => (
              <div key={listing.id} className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                <div className="flex items-start gap-3">
                  <img src={listing.photos[0]} alt={listing.title} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{listing.title}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{listing.locality} • {formatPrice(listing.price, listing.priceUnit)}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${listing.status === 'active' ? 'bg-emerald-100 text-emerald-700' : listing.status === 'flagged' ? 'bg-red-100 text-red-700' : 'bg-zinc-100 text-zinc-600'}`}>{listing.status}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${listing.verified === 'verified' ? 'bg-blue-100 text-blue-700' : listing.verified === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-zinc-100 text-zinc-600'}`}>{listing.verified}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    {listing.verified === 'pending' && (
                      <button onClick={() => updateListing(listing.id, { verified: 'verified' })} className="px-2 py-1 bg-emerald-500 text-white text-[10px] font-medium rounded-lg">{t('admin.verify')}</button>
                    )}
                    <button onClick={() => updateListing(listing.id, { status: listing.status === 'flagged' ? 'active' : 'flagged' })} className={`px-2 py-1 text-[10px] font-medium rounded-lg ${listing.status === 'flagged' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{listing.status === 'flagged' ? 'Unflag' : 'Flag'}</button>
                    <button onClick={() => removeListing(listing.id)} className="px-2 py-1 bg-red-100 text-red-700 text-[10px] font-medium rounded-lg">{t('admin.remove')}</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Users */}
        {activeTab === 'users' && (
          <div className="space-y-3">
            {mockUsers.map((user) => (
              <div key={user.id} className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">{user.name.charAt(0)}</div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{user.name}</p>
                  <p className="text-xs text-zinc-500">{user.phone}</p>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : user.role === 'owner' ? 'bg-blue-100 text-blue-700' : 'bg-zinc-100 text-zinc-600'}`}>{user.role}</span>
                  {user.aadhaarVerified && <p className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Aadhaar Verified</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Top Areas */}
        {activeTab === 'areas' && (
          <div className="space-y-3">
            {stats.topAreas.map((area, i) => (
              <div key={i} className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="1.8" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{area.name}</p>
                  <div className="mt-1.5 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${(area.count / stats.topAreas[0].count) * 100}%` }} /></div>
                </div>
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{area.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
