'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Property, SearchFilters } from '../../lib/types';
import { useListings } from '../../lib/listings-context';
import { filterProperties } from '../../lib/utils';
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';

interface MapViewProps {
  onPropertySelect: (property: Property) => void;
  onChatOpen: () => void;
}

const pins: Record<string, { color: string; icon: string }> = {
  room: { color: '#6366F1', icon: '<rect x="14" y="10" width="12" height="10" rx="1" fill="white"/><polygon points="20,6 12,12 28,12" fill="white"/><rect x="17" y="14" width="2" height="4" fill="#6366F1" rx="0.5"/>' },
  land: { color: '#10B981', icon: '<circle cx="20" cy="14" r="3" fill="white"/><path d="M16 18 Q20 10 24 18" fill="none" stroke="white" stroke-width="2"/><line x1="20" y1="14" x2="20" y2="20" stroke="white" stroke-width="1.5"/>' },
  plot: { color: '#F59E0B', icon: '<rect x="13" y="10" width="14" height="10" rx="1" fill="white" opacity="0.9"/><line x1="16" y1="10" x2="16" y2="20" stroke="currentColor" stroke-width="0.5" opacity="0.3"/><line x1="20" y1="10" x2="20" y2="20" stroke="currentColor" stroke-width="0.5" opacity="0.3"/><line x1="24" y1="10" x2="24" y2="20" stroke="currentColor" stroke-width="0.5" opacity="0.3"/>' },
};

const DEFAULT_CENTER = { lat: 28.6139, lng: 77.2090 };

export default function MapView({ onPropertySelect, onChatOpen }: MapViewProps) {
  const { listings } = useListings();
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    radius: 50,
    latitude: DEFAULT_CENTER.lat,
    longitude: DEFAULT_CENTER.lng,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: DEFAULT_CENTER.lat, lng: DEFAULT_CENTER.lng });
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const filteredProperties = filterProperties(listings, filters, userLocation?.lat, userLocation?.lng);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserLocation(loc);
          setMapCenter(loc);
          setFilters((prev) => ({ ...prev, latitude: loc.lat, longitude: loc.lng }));
        },
        () => {
          setUserLocation(DEFAULT_CENTER);
        }
      );
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || leafletMapRef.current) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      if (!mapRef.current) return;

      const map = L.map(mapRef.current, {
        center: [mapCenter.lat, mapCenter.lng],
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(map);

      if (userLocation) {
        const userIcon = L.divIcon({
          html: `<div style="width:18px;height:18px;background:linear-gradient(135deg,#6366F1,#06B6D4);border:3px solid white;border-radius:50%;box-shadow:0 0 0 3px rgba(99,102,241,0.3),0 0 20px rgba(99,102,241,0.3);"></div>`,
          className: '',
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });
        L.marker([userLocation.lat, userLocation.lng], { icon: userIcon }).addTo(map)           .bindPopup('<div style="padding:8px 12px;font-weight:600;color:#6366F1;">Your Location</div>');
      }

      leafletMapRef.current = map;
      setMapLoaded(true);
    };

    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
      document.head.appendChild(link);
    }

    initMap();

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [userLocation]);

  useEffect(() => {
    if (!leafletMapRef.current || !mapLoaded) return;

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;
      const map = leafletMapRef.current;

      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      filteredProperties.forEach((property) => {
        const pin = pins[property.propertyType];
        const icon = L.divIcon({
          html: `
            <div style="
              width:44px;height:44px;
              background:${pin.color};
              border-radius:50% 50% 50% 0;
              transform:rotate(-45deg);
              display:flex;align-items:center;justify-content:center;
              box-shadow:0 6px 20px ${pin.color}40;
              cursor:pointer;
              transition:all 0.3s cubic-bezier(0.16,1,0.3,1);
            ">
              <svg width="20" height="20" viewBox="0 0 40 40" style="transform:rotate(45deg)" fill="none">${pin.icon}</svg>
            </div>
            ${property.featured ? `<div style="position:absolute;top:-6px;right:-6px;width:18px;height:18px;background:linear-gradient(135deg,#F59E0B,#F97316);border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(245,158,11,0.4);"><svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></div>` : ''}
          `,
          className: '',
          iconSize: [44, 44],
          iconAnchor: [22, 44],
          popupAnchor: [0, -44],
        });

        const marker = L.marker([property.latitude, property.longitude], { icon }).addTo(map);

        const popupContent = `
          <div style="min-width:240px;font-family:system-ui;-webkit-font-smoothing:antialiased;">
            <div style="position:relative;overflow:hidden;">
              <img src="${property.photos[0]}" style="width:100%;height:130px;object-fit:cover;" />
              <div style="position:absolute;top:8px;left:8px;display:flex;gap:4px;">                 ${property.featured ? '<span style="background:linear-gradient(135deg,#F59E0B,#F97316);color:white;font-size:9px;font-weight:700;padding:3px 8px;border-radius:100px;">Featured</span>' : ''}
                ${property.verified === 'verified' ? '<span style="background:linear-gradient(135deg,#10B981,#059669);color:white;font-size:9px;font-weight:700;padding:3px 8px;border-radius:100px;">✓ Verified</span>' : ''}
              </div>
            </div>
            <div style="padding:12px 14px;">
              <div style="font-weight:700;font-size:14px;color:#0F172A;margin-bottom:4px;line-height:1.3;">${property.title}</div>
              <div style="font-size:12px;color:#64748B;margin-bottom:10px;display:flex;align-items:center;gap:4px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ${property.locality}</div>
              <div style="display:flex;align-items:center;justify-content:space-between;">
                <span style="font-weight:800;background:linear-gradient(135deg,#6366F1,#3B82F6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:17px;">
                  ₹${property.price.toLocaleString('en-IN')}${property.priceUnit === 'month' ? '/mo' : ''}
                </span>
                <span style="font-size:11px;color:#94A3B8;background:#F1F5F9;padding:3px 8px;border-radius:6px;">${property.size} ${property.sizeUnit}</span>
              </div>
              <button onclick="window.__selectProperty('${property.id}')" style="
                width:100%;margin-top:12px;padding:11px;
                background:linear-gradient(135deg,#6366F1,#3B82F6);color:white;border:none;border-radius:14px;
                font-size:13px;font-weight:600;cursor:pointer;
                box-shadow:0 4px 16px rgba(99,102,241,0.3);
                transition:all 0.2s;
              ">View Details →</button>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, { maxWidth: 280, closeButton: true });
        marker.on('click', () => setSelectedProperty(property));
        markersRef.current.push(marker);
      });
    };

    updateMarkers();
  }, [filteredProperties, mapLoaded]);

  useEffect(() => {
    (window as any).__selectProperty = (id: string) => {
      const prop = filteredProperties.find((p) => p.id === id);
      if (prop) onPropertySelect(prop);
    };
    return () => { delete (window as any).__selectProperty; };
  }, [filteredProperties, onPropertySelect]);

  useEffect(() => {
    if (selectedProperty && leafletMapRef.current) {
      leafletMapRef.current.flyTo([selectedProperty.latitude, selectedProperty.longitude], 15, { duration: 1.5 });
      onPropertySelect(selectedProperty);
    }
  }, [selectedProperty]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />

      {/* Premium Search Bar */}
      <div className="absolute top-0 left-0 right-0 z-[1000] p-4">
        <div className="glass dark:glass-dark rounded-2xl shadow-[var(--shadow-elevated)] border border-white/30 overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 py-3.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
            <input
              type="text"
              value={filters.query}
              onChange={(e) => {
                const q = e.target.value;
                setFilters((prev) => ({ ...prev, query: q }));
              }}
              placeholder="Search areas, localities, cities..."
              className="flex-1 bg-transparent outline-none text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 font-medium"
            />
            <button
              onClick={() => setShowFilters(true)}
              className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-zinc-500">
                <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>
              </svg>
            </button>
          </div>
          {/* Active filter chips */}
          <div className="flex items-center gap-2 px-4 pb-3 flex-wrap">
            {filters.listingType && (
              <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-[10px] font-semibold shadow-sm">
                {filters.listingType === 'rent' ? 'Rent' : 'Buy'}
              </span>
            )}
            {filters.propertyType && (
              <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-semibold shadow-sm">
                {filters.propertyType}
              </span>
            )}
            {filters.maxBudget && (
              <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-semibold shadow-sm">
                ≤ ₹{filters.maxBudget.toLocaleString('en-IN')}
              </span>
            )}
            <span className="text-[11px] text-zinc-400 ml-auto font-medium">{filteredProperties.length} found</span>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <FilterPanel
          filters={filters}
          onFiltersChange={setFilters}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* AI Chat FAB */}
      <button
        onClick={onChatOpen}
        className="absolute bottom-6 right-4 z-[999] w-16 h-16 rounded-2xl flex items-center justify-center shadow-[var(--shadow-elevated)] hover:scale-105 active:scale-95 transition-all duration-300 animate-gradient"
        style={{ background: 'linear-gradient(135deg, #6366F1, #3B82F6, #06B6D4)', backgroundSize: '200% 200%' }}
        title="AI Property Assistant"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
        </svg>
      </button>

      {/* Re-center button */}
      {userLocation && (
        <button
          onClick={() => leafletMapRef.current?.flyTo([userLocation.lat, userLocation.lng], 14)}
          className="absolute bottom-6 left-4 z-[999] w-12 h-12 glass dark:glass-dark rounded-2xl flex items-center justify-center shadow-[var(--shadow-card)] border border-white/20 hover:scale-105 active:scale-95 transition-all duration-300"
          title="My Location"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#grad)" strokeWidth="2" strokeLinecap="round">
            <defs><linearGradient id="grad" x1="0" y1="0" x2="24" y2="24"><stop offset="0%" stopColor="#6366F1"/><stop offset="100%" stopColor="#06B6D4"/></linearGradient></defs>
            <circle cx="12" cy="12" r="3" fill="url(#grad)" stroke="none"/>
            <path d="M12 2v4m0 12v4M2 12h4m12 0h4" stroke="url(#grad)"/>
          </svg>
        </button>
      )}

      {/* Property count badge */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[999]">
        <div className="glass dark:glass-dark px-5 py-2.5 rounded-full text-sm font-semibold text-zinc-700 dark:text-zinc-200 shadow-[var(--shadow-card)] border border-white/20 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 animate-pulse" />
          {filteredProperties.length} properties nearby
        </div>
      </div>
    </div>
  );
}
