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
import { Building2, Check, ChevronDown } from 'lucide-react';
import { useApp } from '@/contexts/app-context';
import { getAllDemoCompanies, type CompanyType } from '@/constants/demo-companies';

const companyIcons: Record<CompanyType, string> = {
  'accounting': '🏢',
  'financial-pr': '📢',
  'ipo-advisory': '📈',
};

export function CompanySwitcher() {
  const { currentCompany, setCurrentCompany } = useApp();
  const companies = getAllDemoCompanies();

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
