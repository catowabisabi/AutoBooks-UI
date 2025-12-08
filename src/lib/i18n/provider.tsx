'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Locale, defaultLocale, locales, getMessages, localeNames } from '@/locales';

type Messages = typeof import('@/locales/en.json');

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, defaultValueOrParams?: string | Record<string, string | number>, params?: Record<string, string | number>) => string;
  messages: Messages;
  locales: readonly Locale[];
  localeNames: Record<Locale, string>;
}

const I18nContext = createContext<I18nContextType | null>(null);

const LOCALE_STORAGE_KEY = 'wisematic-locale';

function getNestedValue(obj: any, path: string): string | undefined {
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      return undefined;
    }
  }
  
  return typeof result === 'string' ? result : undefined;
}

interface I18nProviderProps {
  children: ReactNode;
  initialLocale?: Locale;
}

export function I18nProvider({ children, initialLocale }: I18nProviderProps) {
  // Always use defaultLocale for initial render to match SSR
  const [locale, setLocaleState] = useState<Locale>(initialLocale || defaultLocale);
  const [messages, setMessages] = useState<Messages>(() => getMessages(initialLocale || defaultLocale) as Messages);
  const [isHydrated, setIsHydrated] = useState(false);

  // After hydration, apply client-side locale preference
  useEffect(() => {
    setIsHydrated(true);
    
    // Check localStorage for saved preference
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && locales.includes(stored as Locale)) {
      setLocaleState(stored as Locale);
      setMessages(getMessages(stored as Locale) as Messages);
      return;
    }
    
    // Check browser language preference
    const browserLang = navigator.language;
    if (browserLang.startsWith('zh')) {
      setLocaleState('zh-TW');
      setMessages(getMessages('zh-TW') as Messages);
    }
  }, []);

  // Update messages when locale changes (after initial hydration)
  useEffect(() => {
    if (isHydrated) {
      setMessages(getMessages(locale) as Messages);
    }
  }, [locale, isHydrated]);

  const setLocale = useCallback((newLocale: Locale) => {
    if (locales.includes(newLocale)) {
      setLocaleState(newLocale);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
        // Update html lang attribute
        document.documentElement.lang = newLocale;
      }
    }
  }, []);

  // Set initial html lang attribute
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const t = useCallback((key: string, defaultValueOrParams?: string | Record<string, string | number>, params?: Record<string, string | number>): string => {
    let value = getNestedValue(messages, key);
    
    // Handle the case where second argument is a default value string
    const defaultValue = typeof defaultValueOrParams === 'string' ? defaultValueOrParams : undefined;
    const actualParams = typeof defaultValueOrParams === 'object' ? defaultValueOrParams : params;
    
    if (!value) {
      // Return default value if provided, otherwise return the key
      return defaultValue || key;
    }
    
    // Replace parameters like {name} with actual values
    if (actualParams) {
      Object.entries(actualParams).forEach(([paramKey, paramValue]) => {
        value = value!.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
      });
    }
    
    return value;
  }, [messages]);

  const value: I18nContextType = {
    locale,
    setLocale,
    t,
    messages,
    locales,
    localeNames,
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

export function useTranslation() {
  const { t, locale, setLocale } = useI18n();
  return { t, locale, setLocale };
}
