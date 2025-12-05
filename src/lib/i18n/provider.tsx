'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Locale, defaultLocale, locales, getMessages, localeNames } from '@/locales';

type Messages = typeof import('@/locales/en.json');

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
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
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (initialLocale) return initialLocale;
    
    // Check localStorage (client-side only)
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (stored && locales.includes(stored as Locale)) {
        return stored as Locale;
      }
      
      // Check browser language
      const browserLang = navigator.language;
      if (browserLang.startsWith('zh')) {
        return 'zh-TW';
      }
    }
    
    return defaultLocale;
  });

  const [messages, setMessages] = useState<Messages>(() => getMessages(locale) as Messages);

  // Update messages when locale changes
  useEffect(() => {
    setMessages(getMessages(locale) as Messages);
  }, [locale]);

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

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    let value = getNestedValue(messages, key);
    
    if (!value) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    
    // Replace parameters like {name} with actual values
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
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
