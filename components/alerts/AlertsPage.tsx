'use client';

import React, { useState, useEffect } from 'react';
import { Alert, PropertyType, ListingType, RoomConfig } from '../../lib/types';
import { t } from '../../lib/i18n';
import { popularLocalities } from '../../lib/mock-data';
import { generateId, formatDate } from '../../lib/utils';

interface AlertsPageProps {
  onBack: () => void;
}

export default function AlertsPage({ onBack }: AlertsPageProps) {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: 'alert-1',
      userId: 'user-3',
      locality: 'Lajpat Nagar',
      propertyType: 'room',
      listingType: 'rent',
      maxBudget: 15000,
      active: true,
      createdAt: '2026-06-01',
    },
    {
      id: 'alert-2',
      userId: 'user-3',
      locality: 'Dwarka',
      propertyType: 'plot',
      listingType: 'sale',
      maxBudget: 15000000,
      active: true,
      createdAt: '2026-05-20',
    },
  ]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAlert, setNewAlert] = useState({
    locality: '',
    propertyType: '' as PropertyType | '',
    listingType: '' as ListingType | '',
    maxBudget: '',
  });

  const handleCreate = () => {
    if (!newAlert.locality) return;
    const alert: Alert = {
      id: generateId(),
      userId: 'user-3',
      locality: newAlert.locality,
      propertyType: newAlert.propertyType as PropertyType || undefined,
      listingType: newAlert.listingType as ListingType || undefined,
      maxBudget: newAlert.maxBudget ? Number(newAlert.maxBudget) : undefined,
      active: true,
      createdAt: new Date().toISOString(),
    };
    setAlerts((prev) => [alert, ...prev]);
    setShowCreateForm(false);
    setNewAlert({ locality: '', propertyType: '', listingType: '', maxBudget: '' });
  };

  const toggleAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, active: !a.active } : a))
    );
  };

  const deleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900">
      {/* Header */}
      <div className="px-4 py-4 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800">
            ←
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{t('alerts.title')}</h1>
            <p className="text-xs text-zinc-500">{t('alerts.description')}</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-3 py-1.5 bg-blue-500 text-white text-sm font-medium rounded-lg"
          >
            + {t('alerts.create')}
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 space-y-3">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">New Alert</h3>

          <select
            value={newAlert.locality}
            onChange={(e) => setNewAlert((prev) => ({ ...prev, locality: e.target.value }))}
            className="w-full px-3 py-2.5 bg-white dark:bg-zinc-800 rounded-xl text-sm border border-zinc-200 dark:border-zinc-700"
          >
            <option value="">Select locality...</option>
            {popularLocalities.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-2">
            <select
              value={newAlert.propertyType}
              onChange={(e) => setNewAlert((prev) => ({ ...prev, propertyType: e.target.value as any }))}
              className="px-3 py-2.5 bg-white dark:bg-zinc-800 rounded-xl text-sm border border-zinc-200 dark:border-zinc-700"
            >
              <option value="">Any type</option>
              <option value="room">Room/Flat</option>
              <option value="land">Land</option>
              <option value="plot">Plot</option>
            </select>
            <select
              value={newAlert.listingType}
              onChange={(e) => setNewAlert((prev) => ({ ...prev, listingType: e.target.value as any }))}
              className="px-3 py-2.5 bg-white dark:bg-zinc-800 rounded-xl text-sm border border-zinc-200 dark:border-zinc-700"
            >
              <option value="">Any</option>
              <option value="rent">Rent</option>
              <option value="sale">Buy</option>
            </select>
          </div>

          <input
            type="number"
            value={newAlert.maxBudget}
            onChange={(e) => setNewAlert((prev) => ({ ...prev, maxBudget: e.target.value }))}
            placeholder="Max budget (optional)"
            className="w-full px-3 py-2.5 bg-white dark:bg-zinc-800 rounded-xl text-sm border border-zinc-200 dark:border-zinc-700"
          />

          <div className="flex gap-2">
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-sm font-medium rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!newAlert.locality}
              className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-zinc-300 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Create Alert
            </button>
          </div>
        </div>
      )}

      {/* Alerts List */}
      <div className="flex-1 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">              <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#A3A3A3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </div>
            <p className="text-zinc-500">No alerts yet</p>
            <p className="text-xs text-zinc-400 mt-1">Create an alert to get notified about new properties</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="px-4 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                alert.active ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-zinc-100 dark:bg-zinc-800'
              }`}>
                <span className={`${alert.active ? '' : 'opacity-50'}`}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{alert.locality}</p>
                <p className="text-xs text-zinc-500">
                  {alert.propertyType || 'Any type'} • {alert.listingType === 'rent' ? 'Rent' : alert.listingType === 'sale' ? 'Buy' : 'Any'}
                  {alert.maxBudget ? ` • ≤ ₹${alert.maxBudget.toLocaleString('en-IN')}` : ''}
                </p>
              </div>
              <button
                onClick={() => toggleAlert(alert.id)}
                className={`w-12 h-7 rounded-full transition-colors relative ${
                  alert.active ? 'bg-blue-500' : 'bg-zinc-300 dark:bg-zinc-600'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform ${
                    alert.active ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <button
                onClick={() => deleteAlert(alert.id)}
                className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
