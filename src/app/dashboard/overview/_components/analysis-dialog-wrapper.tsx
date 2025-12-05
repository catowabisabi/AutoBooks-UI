'use client';

import { AnalysisDialog } from '@/features/overview/components/analysis-dialog';
import { useApp } from '@/contexts/app-context';

export function AnalysisDialogWrapper() {
  const { currentCompany } = useApp();

  // Prepare company data for analysis
  const companyDataForAnalysis = {
    name: currentCompany.name,
    type: currentCompany.type,
    stats: currentCompany.stats as unknown as Record<string, unknown>,
    engagements: currentCompany.engagements || [],
    serviceBreakdown: currentCompany.serviceBreakdown || [],
    currency: currentCompany.currency || 'HKD',
  };

  return <AnalysisDialog companyData={companyDataForAnalysis} />;
}
