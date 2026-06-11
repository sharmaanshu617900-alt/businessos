'use client';

import React from 'react';
import { SearchFilters, PropertyType, ListingType, RoomConfig, LandType, FurnishedStatus } from '../../lib/types';

interface FilterPanelProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onClose: () => void;
}

const propertyTypes: { value: PropertyType; label: string }[] = [
  { value: 'room', label: 'Room/Flat' },
  { value: 'land', label: 'Land' },
  { value: 'plot', label: 'Plot' },
];

const listingTypes: { value: ListingType; label: string }[] = [
  { value: 'rent', label: 'Rent' },
  { value: 'sale', label: 'Buy' },
];

const roomConfigs: RoomConfig[] = ['1BHK', '2BHK', '3BHK', 'PG', 'studio'];
const landTypes: { value: LandType; label: string }[] = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'agricultural', label: 'Agricultural' },
];
const furnishedOptions: { value: FurnishedStatus; label: string }[] = [
  { value: 'furnished', label: 'Furnished' },
  { value: 'semi-furnished', label: 'Semi-Furnished' },
  { value: 'unfurnished', label: 'Unfurnished' },
];

const budgetPresets: { label: string; value: number }[] = [
  { label: '₹5K', value: 5000 },
  { label: '₹10K', value: 10000 },
  { label: '₹15K', value: 15000 },
  { label: '₹20K', value: 20000 },
  { label: '₹30K', value: 30000 },
  { label: '₹50K', value: 50000 },
];

export default function FilterPanel({ filters, onFiltersChange, onClose }: FilterPanelProps) {
  const updateFilter = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    onFiltersChange({ query: filters.query, radius: 50, latitude: filters.latitude, longitude: filters.longitude });
  };

  return (
    <div className="absolute inset-0 z-[1001] bg-zinc-50 dark:bg-zinc-950 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 px-5 py-4 flex items-center justify-between z-10">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Filters</h2>
        <div className="flex items-center gap-2">
          <button onClick={resetFilters} className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 font-medium rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            Reset
          </button>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-zinc-500"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* Listing Type */}
        <div>
          <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">I want to</h3>
          <div className="grid grid-cols-2 gap-2.5">
            {listingTypes.map((lt) => (
              <button
                key={lt.value}
                onClick={() => updateFilter('listingType', filters.listingType === lt.value ? undefined : lt.value)}
                className={`py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                  filters.listingType === lt.value
                    ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg shadow-indigo-500/25'
                    : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 border border-zinc-100 dark:border-zinc-700/50'
                }`}
              >
                {lt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Property Type */}
        <div>
          <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">Property Type</h3>
          <div className="grid grid-cols-3 gap-2.5">
            {propertyTypes.map((pt) => (
              <button
                key={pt.value}
                onClick={() => updateFilter('propertyType', filters.propertyType === pt.value ? undefined : pt.value)}
                className={`py-3.5 rounded-2xl text-xs font-semibold transition-all duration-300 flex flex-col items-center gap-1.5 ${
                  filters.propertyType === pt.value
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25'
                    : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 border border-zinc-100 dark:border-zinc-700/50'
                }`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  {pt.value === 'room' && <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>}
                  {pt.value === 'land' && <><path d="M12 2L2 22h20L12 2z"/><path d="M8 22l4-10 4 10"/></>}
                  {pt.value === 'plot' && <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>}
                </svg>
                <span>{pt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Budget */}
        <div>
          <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">
            Budget {filters.listingType === 'sale' ? '(Total)' : '(/month)'}
          </h3>
          <div className="flex flex-wrap gap-2">
            {budgetPresets.map((bp) => (
              <button
                key={bp.value}
                onClick={() => updateFilter('maxBudget', filters.maxBudget === bp.value ? undefined : bp.value)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 ${
                  filters.maxBudget === bp.value
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25'
                    : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 border border-zinc-100 dark:border-zinc-700/50'
                }`}
              >
                {bp.label}
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-medium">Max:</span>
            <input
              type="number"
              value={filters.maxBudget || ''}
              onChange={(e) => updateFilter('maxBudget', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Custom amount"
              className="flex-1 px-4 py-2.5 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 outline-none rounded-xl border border-zinc-200 dark:border-zinc-700/50 focus:border-indigo-500 transition-colors font-medium"
            />
          </div>
        </div>

        {/* Room Config */}
        {filters.propertyType === 'room' && (
          <div>
            <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">Room Type</h3>
            <div className="flex flex-wrap gap-2">
              {roomConfigs.map((rc) => (
                <button
                  key={rc}
                  onClick={() => updateFilter('roomConfig', filters.roomConfig === rc ? undefined : rc)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 ${
                    filters.roomConfig === rc
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25'
                      : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 border border-zinc-100 dark:border-zinc-700/50'
                  }`}
                >
                  {rc}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Land Type */}
        {(filters.propertyType === 'land' || filters.propertyType === 'plot') && (
          <div>
            <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">Land Type</h3>
            <div className="flex flex-wrap gap-2">
              {landTypes.map((lt) => (
                <button
                  key={lt.value}
                  onClick={() => updateFilter('landType', filters.landType === lt.value ? undefined : lt.value)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 ${
                    filters.landType === lt.value
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25'
                      : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 border border-zinc-100 dark:border-zinc-700/50'
                  }`}
                >
                  {lt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Furnished */}
        {filters.propertyType === 'room' && (
          <div>
            <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">Furnishing</h3>
            <div className="flex flex-wrap gap-2">
              {furnishedOptions.map((fo) => (
                <button
                  key={fo.value}
                  onClick={() => updateFilter('furnishedStatus', filters.furnishedStatus === fo.value ? undefined : fo.value)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 ${
                    filters.furnishedStatus === fo.value
                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/25'
                      : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 border border-zinc-100 dark:border-zinc-700/50'
                  }`}
                >
                  {fo.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Distance Radius */}
        <div>
          <h3 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-3 uppercase tracking-wider">
            Distance: {filters.radius} km
          </h3>
          <input
            type="range"
            min="1"
            max="50"
            value={filters.radius}
            onChange={(e) => updateFilter('radius', Number(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer"
            style={{ background: `linear-gradient(to right, #6366F1 ${(filters.radius / 50) * 100}%, #E5E7EB ${(filters.radius / 50) * 100}%)` }}
          />
          <div className="flex justify-between text-[10px] text-zinc-400 mt-1 font-medium">
            <span>1 km</span>
            <span>50 km</span>
          </div>
        </div>
      </div>

      {/* Apply Button */}
      <div className="sticky bottom-0 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 p-5">
        <button
          onClick={onClose}
          className="w-full py-4 btn-luxury text-sm font-bold"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}
