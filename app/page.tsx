'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Property, UserRole } from '../lib/types';
import { AuthProvider, useAuth } from '../lib/auth-context';
import { FavoritesProvider } from '../lib/favorites-context';
import { ListingsProvider, useListings } from '../lib/listings-context';
import MapView from '../components/map/MapView';
import PropertyDetail from '../components/property/PropertyDetail';
import OwnerListingForm from '../components/owner/OwnerListingForm';
import AiChat from '../components/chat/AiChat';
import Messaging from '../components/chat/Messaging';
import FavoritesPage from '../components/favorites/FavoritesPage';
import AlertsPage from '../components/alerts/AlertsPage';
import AdminPanel from '../components/admin/AdminPanel';
import AdminLogin from '../components/admin/AdminLogin';
import AgreementGenerator from '../components/agreement/AgreementGenerator';
import SplashScreen from '../components/ui/SplashScreen';

type Screen =
  | 'map'
  | 'property-detail'
  | 'create-listing'
  | 'ai-chat'
  | 'messages'
  | 'favorites'
  | 'alerts'
  | 'admin'
  | 'agreement';

function AppContent() {
  const { user, switchRole } = useAuth();
  const { addListing } = useListings();
  const [currentScreen, setCurrentScreen] = useState<Screen>('map');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showNav, setShowNav] = useState(true);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [screenKey, setScreenKey] = useState(0);
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);

  // Register service worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handlePropertySelect = useCallback((property: Property) => {
    setSelectedProperty(property);
    setCurrentScreen('property-detail');
    setShowNav(false);
  }, []);

  const handleBack = useCallback(() => {
    setCurrentScreen('map');
    setSelectedProperty(null);
    setShowNav(true);
  }, []);

  const handleListingSubmit = useCallback((property: Property) => {
    addListing(property);
    setCurrentScreen('map');
    setShowNav(true);
  }, [addListing]);

  const navigateTo = useCallback((screen: Screen) => {
    setCurrentScreen(screen);
    setScreenKey((prev) => prev + 1);
    setShowNav(!['property-detail', 'ai-chat', 'agreement'].includes(screen));
  }, []);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'map':
        return (
          <MapView
            onPropertySelect={handlePropertySelect}
            onChatOpen={() => navigateTo('ai-chat')}
          />
        );
      case 'property-detail':
        return selectedProperty ? (
          <PropertyDetail
            property={selectedProperty}
            onBack={handleBack}
            onChatWithOwner={() => navigateTo('messages')}
            onGenerateAgreement={() => navigateTo('agreement')}
          />
        ) : null;
      case 'create-listing':
        return (
          <OwnerListingForm
            onBack={handleBack}
            onSubmit={handleListingSubmit}
          />
        );
      case 'ai-chat':
        return (
          <AiChat
            onClose={handleBack}
            onPropertySelect={(prop) => {
              setSelectedProperty(prop);
              setCurrentScreen('property-detail');
              setShowNav(false);
            }}
          />
        );
      case 'messages':
        return <Messaging />;
      case 'favorites':
        return (
          <FavoritesPage
            onBack={handleBack}
            onPropertySelect={handlePropertySelect}
          />
        );
      case 'alerts':
        return <AlertsPage onBack={handleBack} />;
      case 'admin':
        if (!adminAuthenticated) {
          return <AdminLogin onSuccess={() => setAdminAuthenticated(true)} onBack={handleBack} />;
        }
        return <AdminPanel onBack={handleBack} onLogout={() => { setAdminAuthenticated(false); handleBack(); }} />;
      case 'agreement':
        return selectedProperty ? (
          <AgreementGenerator
            property={selectedProperty}
            onBack={handleBack}
          />
        ) : null;
      default:
        return null;
    }
  };

  const navItems = [
    { id: 'map' as Screen, label: 'Discover', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
        <line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
      </svg>
    )},
    { id: 'favorites' as Screen, label: 'Saved', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    )},
    { id: 'messages' as Screen, label: 'Chat', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    )},
    { id: 'alerts' as Screen, label: 'Alerts', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    )},
  ];

  const ownerNavItems = [
    { id: 'create-listing' as Screen, label: 'List', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
      </svg>
    )},
    { id: 'admin' as Screen, label: 'Admin', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    )},
  ];

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950">
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      {/* Main Content */}
      <div className="flex-1 relative overflow-hidden">
        <div key={screenKey} className="w-full h-full animate-fade-in">
          {renderScreen()}
        </div>
      </div>

      {/* Bottom Navigation */}
      {showNav && (
        <nav className="flex items-center glass dark:glass-dark border-t border-white/20 dark:border-white/5 safe-bottom animate-slide-up">
          {navItems.map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`flex-1 flex flex-col items-center py-2.5 pt-3 transition-all duration-300 relative ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                }`}
              >
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full" />
                )}
                <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
                  {item.icon}
                </div>
                <span className={`text-[10px] mt-1 font-medium ${isActive ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
          {(user?.role === 'owner' || user?.role === 'admin' || user?.role === 'buyer' || user?.role === 'guest') && ownerNavItems.map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`flex-1 flex flex-col items-center py-2.5 pt-3 transition-all duration-300 relative ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                }`}
              >
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full" />
                )}
                <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
                  {item.icon}
                </div>
                <span className={`text-[10px] mt-1 font-medium ${isActive ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* Dark mode toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="flex-1 flex flex-col items-center py-2.5 pt-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-all duration-300"
          >
            <div className="transition-transform duration-500" style={{ transform: isDark ? 'rotate(180deg)' : 'rotate(0deg)' }}>
              {isDark ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </div>
            <span className="text-[10px] mt-1 font-medium">{isDark ? 'Light' : 'Dark'}</span>
          </button>

          {/* Role switcher */}
          <button
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
            className="flex-1 flex flex-col items-center py-2.5 pt-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-all duration-300"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-400 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-indigo-500/20">
              {user?.role === 'admin' ? 'A' : user?.role === 'owner' ? 'O' : user?.role === 'buyer' ? 'B' : 'G'}
            </div>
            <span className="text-[10px] mt-1 font-medium capitalize">{user?.role || 'Guest'}</span>
          </button>
        </nav>
      )}

      {/* Role Switcher Modal */}
      {showRoleSwitcher && (
        <div className="fixed inset-0 z-[2000] bg-black/40 backdrop-blur-sm flex items-end animate-fade-in" onClick={() => setShowRoleSwitcher(false)}>
          <div
            className="w-full glass dark:glass-dark rounded-t-3xl p-6 animate-slide-up border-t border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-600 rounded-full mx-auto mb-6" />
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">Switch Role</h3>
            <p className="text-xs text-zinc-500 mb-6">Try different user perspectives</p>
            <div className="space-y-2.5">
              {(['guest', 'buyer', 'owner', 'admin'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    switchRole(role);
                    setShowRoleSwitcher(false);
                    if (role === 'admin') {
                      navigateTo('admin');
                    } else {
                      handleBack();
                    }
                  }}
                  className={`w-full py-4 rounded-2xl text-sm font-semibold transition-all capitalize flex items-center gap-3 ${
                    user?.role === role
                      ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/30'
                      : 'bg-white/60 dark:bg-white/5 text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-white/10 border border-white/20'
                  }`}
                >
                  <span className="text-lg">
                    {role === 'guest' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                    {role === 'buyer' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>}
                    {role === 'owner' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="22" x2="9" y2="17"/><line x1="15" y1="22" x2="15" y2="17"/><line x1="9" y1="17" x2="15" y2="17"/></svg>}
                    {role === 'admin' && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>}
                  </span>
                  <span className="flex-1 text-left">{role}</span>
                  {user?.role === role && (
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Current</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <ListingsProvider>
        <FavoritesProvider>
          <AppContent />
        </FavoritesProvider>
      </ListingsProvider>
    </AuthProvider>
  );
}
