'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { SearchFilters, PropertyType, ListingType, RoomConfig, LandType, FurnishedStatus } from '../../lib/types';
import { t } from '../../lib/i18n';

interface SearchBarProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onFilterToggle: () => void;
  resultCount: number;
}

export default function SearchBar({ filters, onFiltersChange, onFilterToggle, resultCount }: SearchBarProps) {
  const [query, setQuery] = useState(filters.query);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange({ ...filters, query });
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="absolute top-0 left-0 right-0 z-[1000] p-3">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3">
          <Search className="w-5 h-5 text-zinc-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('map.search')}
            className="flex-1 bg-transparent outline-none text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); onFiltersChange({ ...filters, query: '' }); }}
              className="p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <X className="w-4 h-4 text-zinc-400" />
            </button>
          )}
          <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700" />
          <button
            onClick={onFilterToggle}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">{t('filter.title')}</span>
          </button>
        </div>
        <div className="flex items-center gap-2 px-4 pb-3 flex-wrap">
          {filters.listingType && (
            <span className="px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium">
              {filters.listingType === 'rent' ? t('filter.rent') : t('filter.buy')}
            </span>
          )}
          {filters.propertyType && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
              {filters.propertyType}
            </span>
          )}
          {filters.maxBudget && (
            <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium">
              ≤ ₹{filters.maxBudget.toLocaleString('en-IN')}
            </span>
          )}
          {filters.roomConfig && (
            <span className="px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium">
              {filters.roomConfig}
            </span>
          )}
          <span className="text-xs text-zinc-400 ml-auto">{resultCount} properties</span>
        </div>
      </div>
    </div>
  );
}
