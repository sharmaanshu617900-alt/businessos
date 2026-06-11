import { SearchFilters, Property } from './types';

export function calculateDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function filterProperties(
  properties: Property[],
  filters: SearchFilters,
  userLat?: number,
  userLng?: number
): Property[] {
  return properties
    .filter((p) => {
      if (filters.propertyType && p.propertyType !== filters.propertyType) return false;
      if (filters.listingType && p.listingType !== filters.listingType) return false;
      if (filters.maxBudget && p.price > filters.maxBudget) return false;
      if (filters.minBudget && p.price < filters.minBudget) return false;
      if (filters.minSize && p.size < filters.minSize) return false;
      if (filters.maxSize && p.size > filters.maxSize) return false;
      if (filters.roomConfig && p.roomConfig !== filters.roomConfig) return false;
      if (filters.landType && p.landType !== filters.landType) return false;
      if (filters.furnishedStatus && p.furnishedStatus !== filters.furnishedStatus) return false;
      if (filters.query) {
        const q = filters.query.toLowerCase();
        const searchable = `${p.title} ${p.description} ${p.locality} ${p.city} ${p.address}`.toLowerCase();
        if (!searchable.includes(q)) return false;
      }
      return true;
    })
    .map((p) => {
      if (userLat && userLng) {
        const dist = calculateDistance(userLat, userLng, p.latitude, p.longitude);
        return { ...p, distance: dist };
      }
      return p;
    })
    .filter((p) => {
      if (p.distance !== undefined && p.distance > filters.radius) return false;
      return true;
    })
    .sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      if (a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance;
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function getPropertyTypeColor(type: string): string {
  switch (type) {
    case 'room': return '#3B82F6';
    case 'land': return '#10B981';
    case 'plot': return '#F59E0B';
    default: return '#6B7280';
  }
}

export function getPropertyTypeEmoji(type: string): string {
  switch (type) {
    case 'room': return '🏠';
    case 'land': return '🌿';
    case 'plot': return '📐';
    default: return '📍';
  }
}

export function validatePhone(phone: string): boolean {
  return /^[+]?[0-9\s-]{10,15}$/.test(phone);
}

export function formatPrice(price: number, unit: 'month' | 'total'): string {
  if (unit === 'month') {
    return `₹${price.toLocaleString('en-IN')}/mo`;
  }
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(1)} Cr`;
  }
  if (price >= 100000) {
    return `₹${(price / 100000).toFixed(1)} L`;
  }
  return `₹${price.toLocaleString('en-IN')}`;
}

export function formatSize(size: number, unit: string): string {
  return `${size} ${unit}`;
}

export function shareWhatsApp(property: Property): void {
  const text = encodeURIComponent(
    `Check out this property on GharDhoondo!\n\n${property.title}\n₹${property.price.toLocaleString('en-IN')}${property.priceUnit === 'month' ? '/mo' : ''}\n${property.address}, ${property.locality}\n\nhttps://ghardhoondo.in/property/${property.id}`
  );
  window.open(`https://wa.me/?text=${text}`, '_blank');
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}
