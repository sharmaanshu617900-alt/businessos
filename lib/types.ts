export type PropertyType = 'room' | 'land' | 'plot';
export type ListingType = 'rent' | 'sale';
export type LandType = 'residential' | 'commercial' | 'agricultural';
export type RoomConfig = '1BHK' | '2BHK' | '3BHK' | 'PG' | 'studio';
export type FurnishedStatus = 'furnished' | 'unfurnished' | 'semi-furnished';
export type UserRole = 'guest' | 'buyer' | 'owner' | 'admin';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';
export type ListingStatus = 'active' | 'sold' | 'rented' | 'expired' | 'flagged';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  avatar?: string;
  aadhaarVerified: boolean;
  createdAt: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  listingType: ListingType;
  price: number;
  priceUnit: 'month' | 'total';
  size: number;
  sizeUnit: 'sqft' | 'sqyd' | 'acre' | 'bigha';
  roomConfig?: RoomConfig;
  landType?: LandType;
  furnishedStatus?: FurnishedStatus;
  address: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  photos: string[];
  videoUrl?: string;
  virtualTourUrl?: string;
  amenities: string[];
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  ownerAvatar?: string;
  verified: VerificationStatus;
  status: ListingStatus;
  featured: boolean;
  availableFrom: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  saves: number;
  distance?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  propertyId: string;
  propertyTitle: string;
  buyerId: string;
  buyerName: string;
  ownerId: string;
  ownerName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface Alert {
  id: string;
  userId: string;
  locality: string;
  propertyType?: PropertyType;
  listingType?: ListingType;
  maxBudget?: number;
  minSize?: number;
  roomConfig?: RoomConfig;
  active: boolean;
  createdAt: string;
}

export interface SearchFilters {
  query: string;
  propertyType?: PropertyType;
  listingType?: ListingType;
  maxBudget?: number;
  minBudget?: number;
  minSize?: number;
  maxSize?: number;
  roomConfig?: RoomConfig;
  landType?: LandType;
  furnishedStatus?: FurnishedStatus;
  radius: number;
  latitude?: number;
  longitude?: number;
}

export interface RentAgreement {
  id: string;
  propertyId: string;
  propertyAddress: string;
  tenantName: string;
  tenantPhone: string;
  ownerName: string;
  ownerPhone: string;
  monthlyRent: number;
  securityDeposit: number;
  startDate: string;
  endDate: string;
  terms: string[];
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  properties?: Property[];
}

export interface AdminStats {
  totalListings: number;
  activeListings: number;
  totalUsers: number;
  totalOwners: number;
  flaggedListings: number;
  searchesToday: number;
  topAreas: { name: string; count: number }[];
}
