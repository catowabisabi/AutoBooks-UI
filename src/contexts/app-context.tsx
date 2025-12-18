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
import { useAuth } from '@/contexts/auth-context';

// Demo 帳戶 email 列表
const DEMO_ACCOUNTS = ['enomars@gmail.com', 'admin@wisematic.com'];

interface AppContextType {
  currentApp: string | null;
  setCurrentApp: (appId: string | null) => void;
  getCurrentAppConfig: () => (typeof APPS_CONFIG)[0] | null;
  currentCompany: DemoCompany;
  setCurrentCompany: (company: DemoCompany) => void;
  setCompanyByType: (type: CompanyType) => void;
  isDemoAccount: boolean;
  userTenant: { name: string; slug: string } | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentApp, setCurrentApp] = useState<string | null>(null);
  const [currentCompany, setCurrentCompany] = useState<DemoCompany>(accountingFirm);
  const [userTenant, setUserTenant] = useState<{ name: string; slug: string } | null>(null);
  const pathname = usePathname();
  
  // 獲取用戶資料以檢查是否為 demo 帳戶
  const { user } = useAuth();
  const isDemoAccount = user?.email ? DEMO_ACCOUNTS.includes(user.email.toLowerCase()) : false;

  // Load saved company preference and user tenant
  useEffect(() => {
    // 載入 demo 公司偏好（僅用於 demo 帳戶）
    const savedCompanyType = localStorage.getItem('demo_company_type') as CompanyType | null;
    if (savedCompanyType && isDemoAccount) {
      setCurrentCompany(getDemoCompany(savedCompanyType));
    }
    
    // 嘗試從 localStorage 載入用戶的 tenant 資料
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        const userData = parsed?.data ?? parsed;
        // 如果用戶有 tenant 資料
        if (userData?.tenants && userData.tenants.length > 0) {
          setUserTenant({
            name: userData.tenants[0].name || '',
            slug: userData.tenants[0].slug || ''
          });
        }
      } catch {
        // 忽略解析錯誤
      }
    }
  }, [isDemoAccount]);

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
  
  // 對於非 demo 帳戶，使用用戶的 tenant 資料來覆蓋公司名稱
  const effectiveCompany: DemoCompany = isDemoAccount 
    ? currentCompany 
    : {
        ...currentCompany,
        name: userTenant?.name || '',
        nameZh: userTenant?.name || '',
      };

  return (
    <AppContext.Provider
      value={{ 
        currentApp, 
        setCurrentApp, 
        getCurrentAppConfig,
        currentCompany: effectiveCompany,
        setCurrentCompany: handleSetCompany,
        setCompanyByType,
        isDemoAccount,
        userTenant
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
