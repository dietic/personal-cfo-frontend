"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

/**
 * User Settings Context - Think of this as the "control panel" for user preferences
 * 
 * This manages all user customization options, like choosing between authentic 
 * bank colors vs. generic card styling. It's like having a remote control for 
 * your app's visual experience.
 */

interface UserSettings {
  brandedCards: boolean; // When true, show authentic bank colors; when false, use generic styling
}

interface SettingsContextType {
  settings: UserSettings;
  updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
  resetSettings: () => void;
}

// Default settings - like factory defaults on a new device
const DEFAULT_SETTINGS: UserSettings = {
  brandedCards: true, // Default to ON - show the beautiful bank colors by default
};

// Local storage key - like a file name where we save user preferences
const SETTINGS_STORAGE_KEY = 'personal-cfo-user-settings';

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  // Load settings from localStorage on component mount - like reading saved preferences from disk
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        // Merge with defaults to handle new settings that might not exist in old saves
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
      }
    } catch (error) {
      console.warn('Failed to load user settings from localStorage:', error);
      // If loading fails, just use defaults - graceful degradation
    }
  }, []);

  // Save settings to localStorage whenever they change - like auto-save
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save user settings to localStorage:', error);
    }
  }, [settings]);

  // Update a specific setting - like changing one option in a menu
  const updateSetting = <K extends keyof UserSettings>(
    key: K, 
    value: UserSettings[K]
  ) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Reset all settings to defaults - like factory reset
  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

// Custom hook to use settings - like a remote control that any component can use
export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

// Convenience hook to get just the brandedCards setting
export function useBrandedCards() {
  const { settings } = useSettings();
  return settings.brandedCards;
}
