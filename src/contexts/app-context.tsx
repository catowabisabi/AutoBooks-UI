'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode
} from 'react';
import { usePathname } from 'next/navigation';
import { APPS_CONFIG } from '@/config/apps-config';
import { accountingFirm, getDemoCompany, type DemoCompany, type CompanyType } from '@/constants/demo-companies';

interface AppContextType {
  currentApp: string | null;
  setCurrentApp: (appId: string | null) => void;
  getCurrentAppConfig: () => (typeof APPS_CONFIG)[0] | null;
  currentCompany: DemoCompany;
  setCurrentCompany: (company: DemoCompany) => void;
  setCompanyByType: (type: CompanyType) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentApp, setCurrentApp] = useState<string | null>(null);
  const [currentCompany, setCurrentCompany] = useState<DemoCompany>(accountingFirm);
  const pathname = usePathname();

  // Load saved company preference
  useEffect(() => {
    const savedCompanyType = localStorage.getItem('demo_company_type') as CompanyType | null;
    if (savedCompanyType) {
      setCurrentCompany(getDemoCompany(savedCompanyType));
    }
  }, []);

  // Save company preference
  const handleSetCompany = (company: DemoCompany) => {
    setCurrentCompany(company);
    localStorage.setItem('demo_company_type', company.type);
  };

  const setCompanyByType = (type: CompanyType) => {
    const company = getDemoCompany(type);
    handleSetCompany(company);
  };

  // Update current app based on URL
  useEffect(() => {
    const pathSegments = pathname.split('/');
    if (pathSegments.length >= 3 && pathSegments[1] === 'dashboard') {
      const appFromPath = pathSegments[2];
      const validApp = APPS_CONFIG.find((app) => app.id === appFromPath);
      setCurrentApp(validApp ? appFromPath : null);
    } else {
      setCurrentApp(null);
    }
  }, [pathname]);

  const getCurrentAppConfig = () => {
    if (!currentApp) return null;
    return APPS_CONFIG.find((app) => app.id === currentApp) || null;
  };

  return (
    <AppContext.Provider
      value={{ 
        currentApp, 
        setCurrentApp, 
        getCurrentAppConfig,
        currentCompany,
        setCurrentCompany: handleSetCompany,
        setCompanyByType
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
