'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Property } from '../lib/types';
import { mockProperties } from '../lib/mock-data';

interface FavoritesContextType {
  favorites: string[];
  toggleFavorite: (propertyId: string) => void;
  isFavorite: (propertyId: string) => boolean;
  getFavoriteProperties: () => Property[];
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>(['prop-1', 'prop-5']);

  const toggleFavorite = useCallback((propertyId: string) => {
    setFavorites((prev) =>
      prev.includes(propertyId)
        ? prev.filter((id) => id !== propertyId)
        : [...prev, propertyId]
    );
  }, []);

  const isFavorite = useCallback(
    (propertyId: string) => favorites.includes(propertyId),
    [favorites]
  );

  const getFavoriteProperties = useCallback(() => {
    return mockProperties.filter((p) => favorites.includes(p.id));
  }, [favorites]);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, getFavoriteProperties }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used within FavoritesProvider');
  return context;
}
