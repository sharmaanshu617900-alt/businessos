'use client';

import React, { useState } from 'react';
import { Property } from '../../lib/types';
import { useFavorites } from '../../lib/favorites-context';
import { useAuth } from '../../lib/auth-context';
import { shareWhatsApp } from '../../lib/utils';
import dynamic from 'next/dynamic';

const RoomViewer3D = dynamic(() => import('./RoomViewer3D'), { ssr: false });
const VirtualTour = dynamic(() => import('./VirtualTour'), { ssr: false });

interface PropertyDetailProps {
  property: Property;
  onBack: () => void;
  onChatWithOwner: () => void;
  onGenerateAgreement?: () => void;
}

export default function PropertyDetail({ property, onBack, onChatWithOwner, onGenerateAgreement }: PropertyDetailProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user } = useAuth();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [show3D, setShow3D] = useState(false);
  const [showTour, setShowTour] = useState(false);

  const fav = isFavorite(property.id);
  const displayedAmenities = showAllAmenities ? property.amenities : property.amenities.slice(0, 8);

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 overflow-y-auto">
      {/* Photo Gallery */}
      <div className="relative">
        <div className="aspect-[4/3] bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
          <img
            src={property.photos[currentPhotoIndex]}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          {/* Photo counter */}
          {property.photos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 glass rounded-full text-white text-xs font-semibold">
              {currentPhotoIndex + 1} / {property.photos.length}
            </div>
          )}
          {/* Photo navigation dots */}
          <div className="absolute bottom-4 right-4 flex gap-1.5">
            {property.photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPhotoIndex(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === currentPhotoIndex ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Back button */}
        <button
          onClick={onBack}
          className="absolute top-4 left-4 w-11 h-11 glass rounded-2xl flex items-center justify-center shadow-lg border border-white/20 hover:scale-105 transition-transform"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-zinc-700">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>

        {/* Action buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => toggleFavorite(property.id)}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg border border-white/20 transition-all duration-300 hover:scale-105 ${
              fav ? 'bg-gradient-to-br from-red-500 to-pink-500 text-white' : 'glass text-zinc-600'
            }`}
          >
            {fav ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            )}
          </button>
          <button
            onClick={() => shareWhatsApp(property)}
            className="w-11 h-11 glass rounded-2xl flex items-center justify-center shadow-lg border border-white/20 text-zinc-600 hover:scale-105 transition-transform"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          </button>
        </div>

        {/* Badges */}
        <div className="absolute top-4 left-16 flex gap-2">
          {property.featured && (
            <span className="badge-premium flex items-center gap-1 shadow-lg">
              Featured
            </span>
          )}
          {property.verified === 'verified' && (
            <span className="px-2.5 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-bold rounded-full shadow-lg flex items-center gap-1">
              ✓ Verified
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-5 -mt-1">
        {/* Title & Price */}
        <div className="animate-fade-in">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight">{property.title}</h1>
          <p className="text-sm text-zinc-500 mt-1.5 flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-400">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            {property.address}, {property.locality}, {property.city}
          </p>
          <div className="flex items-baseline gap-1 mt-3">
            <span className="text-3xl font-extrabold text-gradient">
              ₹{property.price.toLocaleString('en-IN')}
            </span>
            <span className="text-sm text-zinc-400 font-medium">{property.priceUnit === 'month' ? '/month' : ''}</span>
          </div>
        </div>

        {/* 3D View Button */}
        {property.roomConfig && property.propertyType === 'room' && (
          <button
            onClick={() => setShow3D(true)}
            className="w-full p-4 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 dark:from-indigo-500/20 dark:to-cyan-500/20 rounded-2xl border border-indigo-200/50 dark:border-indigo-500/20 flex items-center gap-3 hover:from-indigo-500/15 hover:to-cyan-500/15 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">View in 3D</p>
              <p className="text-[10px] text-zinc-500">Explore the room layout interactively</p>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-auto text-indigo-400"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        )}

        {show3D && (
          <RoomViewer3D
            roomConfig={property.roomConfig}
            photos={property.photos}
            onClose={() => setShow3D(false)}
          />
        )}

        {/* Virtual Tour Button */}
        {property.propertyType === 'room' && (
          <button
            onClick={() => setShowTour(true)}
            className="w-full p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 rounded-2xl border border-purple-200/50 dark:border-purple-500/20 flex items-center gap-3 hover:from-purple-500/15 hover:to-pink-500/15 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" y1="8" x2="12" y2="8"/><line x1="3.95" y1="6.06" x2="8.54" y2="14"/><line x1="10.88" y1="21.94" x2="15.46" y2="14"/></svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">360° Virtual Tour</p>
              <p className="text-[10px] text-zinc-500">Walk through the property from anywhere</p>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-auto text-purple-400"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        )}

        {showTour && (
          <VirtualTour
            propertyTitle={property.title}
            photos={property.photos}
            onClose={() => setShowTour(false)}
          />
        )}

        {/* Quick Info Cards */}
        <div className="grid grid-cols-3 gap-3 animate-fade-in">
          <div className="p-3.5 bg-white dark:bg-zinc-800 rounded-2xl text-center shadow-sm border border-zinc-100 dark:border-zinc-700/50">
            <div className="w-9 h-9 mx-auto mb-2 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 flex items-center justify-center"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2"><path d="M21 3H3v7h18V3z"/><path d="M21 14H3v7h18v-7z"/></svg></div>
            <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Size</p>
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">{property.size} {property.sizeUnit}</p>
          </div>
          {property.roomConfig && (
            <div className="p-3.5 bg-white dark:bg-zinc-800 rounded-2xl text-center shadow-sm border border-zinc-100 dark:border-zinc-700/50">
              <div className="w-9 h-9 mx-auto mb-2 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 flex items-center justify-center"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><rect x="9" y="13" width="6" height="8"/></svg></div>
              <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Type</p>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">{property.roomConfig}</p>
            </div>
          )}
          {property.furnishedStatus && (
            <div className="p-3.5 bg-white dark:bg-zinc-800 rounded-2xl text-center shadow-sm border border-zinc-100 dark:border-zinc-700/50">
              <div className="w-9 h-9 mx-auto mb-2 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 flex items-center justify-center"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2"><path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3"/><path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H6v-2a2 2 0 0 0-4 0z"/><path d="M4 18v2"/><path d="M20 18v2"/></svg></div>
              <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Furnish</p>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-0.5 capitalize">{property.furnishedStatus}</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-5 text-sm text-zinc-400">
          <span className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            {property.views}
          </span>
          <span className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            {property.saves}
          </span>
          <span className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            {new Date(property.availableFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </span>
        </div>

        {/* About */}
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-3">About this property</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{property.description}</p>
        </div>

        {/* Amenities */}
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-3">Amenities</h3>
          <div className="flex flex-wrap gap-2">
            {displayedAmenities.map((amenity) => (
              <span
                key={amenity}
                className="px-3.5 py-1.5 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold rounded-xl border border-zinc-100 dark:border-zinc-700/50 shadow-sm"
              >
                {amenity}
              </span>
            ))}
          </div>
          {property.amenities.length > 8 && !showAllAmenities && (
            <button
              onClick={() => setShowAllAmenities(true)}
              className="mt-3 text-sm text-indigo-500 hover:text-indigo-600 font-semibold"
            >
              +{property.amenities.length - 8} more →
            </button>
          )}
        </div>

        {/* Owner Info */}
        <div className="p-5 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-700/50">
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-3">Owner</h3>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-cyan-400 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
              {property.ownerName.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{property.ownerName}</p>
              <p className="text-xs text-zinc-500">{property.ownerPhone}</p>
            </div>
            {property.verified === 'verified' && (
              <span className="px-2.5 py-1 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-xl">
                ✓ Verified
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pb-8">
          <a
            href={`tel:${property.ownerPhone}`}
            className="w-full py-4 btn-luxury text-center block text-sm"
          >
            Contact Owner
          </a>
          <button
            onClick={onChatWithOwner}
            className="w-full py-4 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-semibold rounded-2xl transition-all shadow-sm border border-zinc-100 dark:border-zinc-700/50 text-sm"
          >
            Chat with Owner
          </button>
          {user?.role === 'owner' && onGenerateAgreement && (
            <button
              onClick={onGenerateAgreement}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-emerald-500/20 text-sm"
            >
              Generate Rent Agreement
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
