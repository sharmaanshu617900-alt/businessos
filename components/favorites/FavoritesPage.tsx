'use client';

import React, { useState } from 'react';
import { Property } from '../../lib/types';
import { t } from '../../lib/i18n';
import { useFavorites } from '../../lib/favorites-context';
import { formatPrice, formatSize, shareWhatsApp } from '../../lib/utils';

interface FavoritesPageProps {
  onBack: () => void;
  onPropertySelect: (property: Property) => void;
}

export default function FavoritesPage({ onBack, onPropertySelect }: FavoritesPageProps) {
  const { getFavoriteProperties, toggleFavorite, isFavorite } = useFavorites();
  const favorites = getFavoriteProperties();

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900">
      {/* Header */}
      <div className="px-4 py-4 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800">
            ←
          </button>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{t('nav.favorites')}</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-8">              <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#A3A3A3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </div>
            <p className="text-zinc-500">No favorites yet</p>
            <p className="text-xs text-zinc-400 mt-1">Tap the heart icon on any property to save it here</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {favorites.map((property) => (
              <div
                key={property.id}
                onClick={() => onPropertySelect(property)}
                className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex gap-3 p-3">
                  <img
                    src={property.photos[0]}
                    alt={property.title}
                    className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{property.title}</h3>
                    <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> {property.locality}, {property.city}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        {formatPrice(property.price, property.priceUnit)}
                      </span>
                      <span className="text-xs text-zinc-400">•</span>
                      <span className="text-xs text-zinc-500">{formatSize(property.size, property.sizeUnit)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {property.verified === 'verified' && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full font-medium">
                          ✓ Verified
                        </span>
                      )}
                      {property.featured && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full font-medium flex items-center gap-1">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                          Featured
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(property.id);
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        shareWhatsApp(property);
                      }}
                      className="p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full transition-colors"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
