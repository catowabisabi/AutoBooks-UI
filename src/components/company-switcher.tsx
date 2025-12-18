'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Building2, Check, ChevronDown, Settings } from 'lucide-react';
import { useApp } from '@/contexts/app-context';
import { getAllDemoCompanies, type CompanyType } from '@/constants/demo-companies';
import { useTranslation } from '@/lib/i18n/provider';
import Link from 'next/link';

const companyIcons: Record<CompanyType, string> = {
  'accounting': '🏢',
  'financial-pr': '📢',
  'ipo-advisory': '📈',
};

export function CompanySwitcher() {
  const { currentCompany, setCurrentCompany, isDemoAccount, userTenant } = useApp();
  const { t } = useTranslation();
  const companies = getAllDemoCompanies();

  // 非 demo 帳戶顯示用戶的公司名稱
  if (!isDemoAccount) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2 min-w-[200px] justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="truncate max-w-[140px]">
                {userTenant?.name || t('company.notSet', 'Set up company')}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[280px]">
          <DropdownMenuLabel>{t('company.yourCompany', 'Your Company')}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {userTenant?.name ? (
            <DropdownMenuItem className="flex items-center gap-3 py-3">
              <Building2 className="h-4 w-4" />
              <div className="flex flex-col">
                <span className="font-medium">{userTenant.name}</span>
              </div>
              <Check className="h-4 w-4 ml-auto" />
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem asChild className="flex items-center gap-3 py-3 cursor-pointer">
              <Link href="/dashboard/settings/company">
                <Settings className="h-4 w-4" />
                <span>{t('company.setupCompany', 'Set up your company')}</span>
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Demo 帳戶可以切換不同的 demo 公司
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 min-w-[200px] justify-between">
          <div className="flex items-center gap-2">
            <span>{companyIcons[currentCompany.type]}</span>
            <span className="truncate max-w-[140px]">{currentCompany.name}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[280px]">
        <DropdownMenuLabel>Switch Demo Company</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {companies.map((company) => (
          <DropdownMenuItem
            key={company.id}
            onClick={() => setCurrentCompany(company)}
            className="flex items-center justify-between gap-2 cursor-pointer py-3"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{companyIcons[company.type]}</span>
              <div className="flex flex-col">
                <span className="font-medium">{company.name}</span>
                <span className="text-xs text-muted-foreground">{company.nameZh}</span>
              </div>
            </div>
            {currentCompany.id === company.id && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
