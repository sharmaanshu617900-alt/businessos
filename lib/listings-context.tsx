'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Property } from '../lib/types';
import { mockProperties } from '../lib/mock-data';

interface ListingsContextType {
  listings: Property[];
  addListing: (listing: Property) => void;
  updateListing: (id: string, updates: Partial<Property>) => void;
  removeListing: (id: string) => void;
}

const ListingsContext = createContext<ListingsContextType | undefined>(undefined);

export function ListingsProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<Property[]>(mockProperties);

  const addListing = useCallback((listing: Property) => {
    setListings((prev) => [listing, ...prev]);
  }, []);

  const updateListing = useCallback((id: string, updates: Partial<Property>) => {
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l))
    );
  }, []);

  const removeListing = useCallback((id: string) => {
    setListings((prev) => prev.filter((l) => l.id !== id));
  }, []);

  return (
    <ListingsContext.Provider value={{ listings, addListing, updateListing, removeListing }}>
      {children}
    </ListingsContext.Provider>
  );
}

export function useListings() {
  const context = useContext(ListingsContext);
  if (!context) throw new Error('useListings must be used within ListingsProvider');
  return context;
}
