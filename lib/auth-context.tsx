'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, UserRole } from '../lib/types';
import { mockUsers } from '../lib/mock-data';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (phone: string) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(mockUsers[2]); // Default as buyer for demo

  const login = useCallback(async (phone: string) => {
    const found = mockUsers.find((u) => u.phone === phone);
    if (found) {
      setUser(found);
    } else {
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: 'Guest User',
        phone,
        role: 'buyer',
        aadhaarVerified: false,
        createdAt: new Date().toISOString(),
      };
      setUser(newUser);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    if (user) {
      setUser({ ...user, role });
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
