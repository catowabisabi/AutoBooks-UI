/**
 * Dashboard Data Hook
 * ====================
 * Fetches real dashboard data from the API with fallback to demo data
 * Uses React Query for caching and automatic refetching
 * 
 * 統一的 Dashboard 數據接口，所有公司類型共用
 * 每個公司根據類型返回不同的數據值
 * 
 * Demo 帳戶: 只有 enomars@gmail.com 會顯示 mock 數據
 * 其他用戶: 顯示真實數據或空白狀態
 */

'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  auditsApi, 
  taxReturnsApi, 
  billableHoursApi, 
  revenueApi,
  listedClientsApi,
  ipoMandatesApi,
  announcementsApi,
  mediaCoverageApi,
  engagementsApi,
  clientPerformanceApi
} from '@/features/business/services';
import { salesAnalyticsApi } from '@/features/analytics/services';
import { useApp } from '@/contexts/app-context';
import { useAuth } from '@/contexts/auth-context';

// Demo 帳戶 email 列表
const DEMO_ACCOUNTS = ['enomars@gmail.com', 'admin@wisematic.com'];

// 統一的 Dashboard 數據結構
// 所有公司類型共用這個結構，但值不同
export interface DashboardDataMap {
  // === 通用字段 ===
  clientCount: number;
  activeEngagements: number;
  pendingTasks: number;
  revenueYTD: number;
  revenuePending: number;
  revenueGrowth: string;
  
  // === 會計師事務所 (accounting) ===
  auditsInProgress: number;
  auditsTotal: number;
  taxReturnsPending: number;
  taxReturnsTotal: number;
  billableHoursMTD: string;
  utilizationRate: string;
  complianceScore: string;
  
  // === Financial PR (financial-pr) ===
  listedClients: number;
  activeContracts: number;
  announcementsThisMonth: number;
  announcementsTotal: number;
  pendingAnnouncements: number;
  mediaCoverage: number;
  positiveRate: number;
  totalReach: string;
  engagementValue: string;
  completedEngagements: number;
  
  // === IPO Advisory (ipo-advisory) ===
  ipoMandates: number;
  pipelineValue: string;
  sfcApproved: number;
  clientPerformance: number;
  satisfactionScore: number;
  projectsCompleted: number;
  
  // 其他索引簽名
  [key: string]: string | number | undefined;
}

export interface DashboardData {
  dashboardData: DashboardDataMap;
  recentAudits: any[];
  recentTaxReturns: any[];
  revenueData: any[];
  salesTrend: any[];
  isLoading: boolean;
  error: string | null;
  isUsingMockData: boolean;
  refetch: () => void;
}

// 默認空數據
const emptyDashboardData: DashboardDataMap = {
  clientCount: 0,
  activeEngagements: 0,
  pendingTasks: 0,
  revenueYTD: 0,
  revenuePending: 0,
  revenueGrowth: '+0%',
  auditsInProgress: 0,
  auditsTotal: 0,
  taxReturnsPending: 0,
  taxReturnsTotal: 0,
  billableHoursMTD: '0 hrs',
  utilizationRate: '0%',
  complianceScore: '0%',
  listedClients: 0,
  activeContracts: 0,
  announcementsThisMonth: 0,
  announcementsTotal: 0,
  pendingAnnouncements: 0,
  mediaCoverage: 0,
  positiveRate: 0,
  totalReach: '0',
  engagementValue: 'HK$0',
  completedEngagements: 0,
  ipoMandates: 0,
  pipelineValue: 'HK$0',
  sfcApproved: 0,
  clientPerformance: 0,
  satisfactionScore: 0,
  projectsCompleted: 0,
};

// Mock 數據 - 根據公司類型
const getMockDataByCompanyType = (companyType: string): DashboardDataMap => {
  switch (companyType) {
    case 'financial-pr':
      return {
        ...emptyDashboardData,
        // PR 公司數據
        clientCount: 52,
        listedClients: 52,
        activeContracts: 38,
        announcementsThisMonth: 28,
        announcementsTotal: 156,
        pendingAnnouncements: 5,
        mediaCoverage: 94,
        positiveRate: 85,
        totalReach: '156K 讀者',
        activeEngagements: 38,
        engagementValue: 'HK$4.2M',
        completedEngagements: 24,
        pendingTasks: 12,
        revenueYTD: 18500000,
        revenuePending: 2800000,
        revenueGrowth: '+18.5%',
      };
    
    case 'ipo-advisory':
      return {
        ...emptyDashboardData,
        // IPO 公司數據
        clientCount: 12,
        ipoMandates: 8,
        pipelineValue: 'HK$12.8B',
        sfcApproved: 15,
        activeEngagements: 12,
        engagementValue: 'HK$8.6M',
        pendingTasks: 8,
        clientPerformance: 85,
        satisfactionScore: 92,
        projectsCompleted: 23,
        revenueYTD: 45800000,
        revenuePending: 12500000,
        revenueGrowth: '+32.1%',
      };
    
    case 'accounting':
    default:
      return {
        ...emptyDashboardData,
        // 會計師事務所數據
        clientCount: 128,
        auditsInProgress: 32,
        auditsTotal: 156,
        taxReturnsPending: 156,
        taxReturnsTotal: 423,
        billableHoursMTD: '2,847 hrs',
        utilizationRate: '78%',
        complianceScore: '96%',
        activeEngagements: 45,
        pendingTasks: 89,
        revenueYTD: 12800000,
        revenuePending: 3200000,
        revenueGrowth: '+15.3%',
      };
  }
};

// Query keys for React Query caching
export const dashboardQueryKeys = {
  all: ['dashboard'] as const,
  data: (companyType: string) => [...dashboardQueryKeys.all, 'data', companyType] as const,
};

// Data fetching function extracted for React Query
async function fetchDashboardDataByType(companyType: string) {
  let dashboardData: DashboardDataMap = { ...emptyDashboardData };
  let recentAudits: any[] = [];
  let recentTaxReturns: any[] = [];
  let salesTrend: any[] = [];
  let isUsingMockData = false;
  
  if (companyType === 'accounting') {
    // 會計師事務所 - 獲取審計、稅務、工時數據
    const [
      auditsResponse,
      taxReturnsResponse,
      billableHoursResponse,
      revenueResponse,
      salesResponse,
    ] = await Promise.all([
      auditsApi.list({ ordering: '-created_at', page_size: 100 }).catch(() => null),
      taxReturnsApi.list({ ordering: '-deadline', page_size: 100 }).catch(() => null),
      billableHoursApi.summary().catch(() => null),
      revenueApi.summary().catch(() => null),
      salesAnalyticsApi.list({ ordering: '-year,-month', page_size: 12 }).catch(() => null),
    ]);
    
    const audits = auditsResponse?.results || [];
    const taxReturns = taxReturnsResponse?.results || [];
    const billableHours = (billableHoursResponse || {}) as Record<string, any>;
    const revenue = (revenueResponse || {}) as Record<string, any>;
    const salesData = salesResponse?.results || [];
    
    if (audits.length > 0 || taxReturns.length > 0) {
      const activeAudits = audits.filter((a: any) => 
        a.status?.toUpperCase() !== 'COMPLETED'
      ).length;
      const pendingTaxReturns = taxReturns.filter((t: any) => 
        t.status?.toUpperCase() === 'PENDING'
      ).length;
      const totalBillableHours = parseFloat(billableHours['billable_hours'] || billableHours['total_hours'] || 0);
      const receivedAmount = parseFloat(revenue['received_amount'] || 0);
      const pendingAmount = parseFloat(revenue['pending_amount'] || 0);
      const totalRevenue = parseFloat(revenue['total_revenue'] || 0);
      const collectionRate = totalRevenue > 0 ? Math.round((receivedAmount / totalRevenue) * 100) : 0;
      
      // 計算 YTD 收入
      const currentYear = new Date().getFullYear();
      const ytdRevenue = salesData
        .filter((s: any) => s.year === currentYear)
        .reduce((sum: number, s: any) => sum + parseFloat(s.revenue || 0), 0);
      
      dashboardData = {
        ...dashboardData,
        clientCount: audits.length + taxReturns.length,
        auditsInProgress: activeAudits,
        auditsTotal: audits.length,
        taxReturnsPending: pendingTaxReturns,
        taxReturnsTotal: taxReturns.length,
        billableHoursMTD: `${totalBillableHours.toLocaleString()} hrs`,
        utilizationRate: `${collectionRate}%`,
        complianceScore: `${collectionRate}%`,
        activeEngagements: activeAudits + pendingTaxReturns,
        pendingTasks: pendingTaxReturns,
        revenueYTD: ytdRevenue || receivedAmount,
        revenuePending: pendingAmount,
        revenueGrowth: '+15.3%',
      };
      
      recentAudits = audits.slice(0, 6);
      recentTaxReturns = taxReturns.slice(0, 6);
      salesTrend = salesData.map((s: any) => ({
        month: s.month_name || `${s.month}/${s.year}`,
        revenue: parseFloat(s.revenue || 0),
        target: parseFloat(s.target_revenue || 0)
      }));
    } else {
      dashboardData = getMockDataByCompanyType('accounting');
      isUsingMockData = true;
    }
    
  } else if (companyType === 'financial-pr') {
    // Financial PR 公司 - 獲取上市客戶、公告、媒體報導數據
    const [
      listedClientsRes,
      announcementsRes,
      mediaCoverageRes,
      engagementsRes,
    ] = await Promise.all([
      listedClientsApi.list({ page_size: 1000 }).catch(() => null),
      announcementsApi.thisMonth().catch(() => null),
      mediaCoverageApi.list({ page_size: 1000 }).catch(() => null),
      engagementsApi.list({ page_size: 1000 }).catch(() => null),
    ]);
    
    const listedClients = listedClientsRes?.results || [];
    const announcementsThisMonthCount = (announcementsRes as any)?.count || 0;
    const announcements = (announcementsRes as any)?.announcements || [];
    const mediaCoverage = mediaCoverageRes?.results || [];
    const engagements = engagementsRes?.results || [];
    
    if (listedClients.length > 0 || mediaCoverage.length > 0) {
      const activeContracts = listedClients.filter((c: any) => c.status === 'ACTIVE').length;
      const pendingAnnouncements = Array.isArray(announcements) 
        ? announcements.filter((a: any) => a.status === 'DRAFT' || a.status === 'IN_REVIEW').length 
        : 0;
      
      const positiveCoverage = mediaCoverage.filter((m: any) => m.sentiment === 'POSITIVE').length;
      const positiveRate = mediaCoverage.length > 0 ? Math.round((positiveCoverage / mediaCoverage.length) * 100) : 0;
      const totalReach = mediaCoverage.reduce((sum: number, m: any) => sum + (m.reach || 0), 0);
      
      const activeEngagements = engagements.filter((e: any) => e.status === 'ACTIVE').length;
      const completedEngagements = engagements.filter((e: any) => e.status === 'COMPLETED').length;
      const engagementValue = engagements.reduce((sum: number, e: any) => sum + parseFloat(e.value || 0), 0);
      
      dashboardData = {
        ...dashboardData,
        clientCount: listedClients.length,
        listedClients: listedClients.length,
        activeContracts,
        announcementsThisMonth: announcementsThisMonthCount,
        announcementsTotal: announcementsThisMonthCount * 6,
        pendingAnnouncements,
        mediaCoverage: mediaCoverage.length,
        positiveRate,
        totalReach: totalReach > 1000 ? `${(totalReach / 1000).toFixed(0)}K 讀者` : `${totalReach} 讀者`,
        activeEngagements,
        engagementValue: engagementValue > 1000000 
          ? `HK$${(engagementValue / 1000000).toFixed(1)}M` 
          : `HK$${(engagementValue / 1000).toFixed(0)}K`,
        completedEngagements,
        pendingTasks: pendingAnnouncements,
        revenueYTD: engagementValue,
        revenuePending: engagementValue * 0.2,
        revenueGrowth: '+18.5%',
      };
    } else {
      dashboardData = getMockDataByCompanyType('financial-pr');
      isUsingMockData = true;
    }
    
  } else if (companyType === 'ipo-advisory') {
    // IPO Advisory 公司 - 獲取 IPO 項目、客戶表現數據
    const [
      ipoMandatesRes,
      engagementsRes,
      clientPerformanceRes,
    ] = await Promise.all([
      ipoMandatesApi.list({ page_size: 1000 }).catch(() => null),
      engagementsApi.list({ page_size: 1000 }).catch(() => null),
      clientPerformanceApi.list({ page_size: 1000 }).catch(() => null),
    ]);
    
    const ipoMandates = ipoMandatesRes?.results || [];
    const engagements = engagementsRes?.results || [];
    const clientPerformance = clientPerformanceRes?.results || [];
    
    if (ipoMandates.length > 0 || engagements.length > 0) {
      const sfcApproved = ipoMandates.filter((m: any) => m.is_sfc_approved).length;
      const totalDealSize = ipoMandates.reduce((sum: number, m: any) => sum + (parseFloat(m.deal_size) || 0), 0);
      
      const activeEngagements = engagements.filter((e: any) => e.status === 'ACTIVE').length;
      const engagementValue = engagements.reduce((sum: number, e: any) => sum + parseFloat(e.value || 0), 0);
      
      const avgSatisfaction = clientPerformance.length > 0
        ? Math.round(clientPerformance.reduce((sum: number, c: any) => sum + (c.satisfaction_score || 0), 0) / clientPerformance.length)
        : 0;
      const projectsCompleted = clientPerformance.reduce((sum: number, c: any) => sum + (c.projects_completed || 0), 0);
      
      dashboardData = {
        ...dashboardData,
        clientCount: ipoMandates.length,
        ipoMandates: ipoMandates.length,
        pipelineValue: totalDealSize > 1000000000 
          ? `HK$${(totalDealSize / 1000000000).toFixed(1)}B` 
          : `HK$${(totalDealSize / 1000000).toFixed(0)}M`,
        sfcApproved,
        activeEngagements,
        engagementValue: engagementValue > 1000000 
          ? `HK$${(engagementValue / 1000000).toFixed(1)}M` 
          : `HK$${(engagementValue / 1000).toFixed(0)}K`,
        pendingTasks: ipoMandates.filter((m: any) => m.stage !== 'LISTING').length,
        clientPerformance: clientPerformance.length,
        satisfactionScore: avgSatisfaction,
        projectsCompleted,
        revenueYTD: engagementValue,
        revenuePending: engagementValue * 0.3,
        revenueGrowth: '+32.1%',
      };
    } else {
      dashboardData = getMockDataByCompanyType('ipo-advisory');
      isUsingMockData = true;
    }
  } else {
    dashboardData = getMockDataByCompanyType(companyType);
    isUsingMockData = true;
  }

  return {
    dashboardData,
    recentAudits,
    recentTaxReturns,
    revenueData: [],
    salesTrend,
    isUsingMockData,
  };
}

export function useDashboardData(): DashboardData {
  const { currentCompany } = useApp();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const companyType = currentCompany?.type || 'accounting';
  
  // 檢查是否為 demo 帳戶
  const isDemoAccount = user?.email ? DEMO_ACCOUNTS.includes(user.email.toLowerCase()) : false;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: dashboardQueryKeys.data(companyType),
    queryFn: () => fetchDashboardDataByType(companyType),
    // Data stays fresh for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Keep in cache for 15 minutes
    gcTime: 15 * 60 * 1000,
    // Only use mock data as placeholder for demo accounts
    placeholderData: (previousData) => previousData ?? {
      dashboardData: isDemoAccount ? getMockDataByCompanyType(companyType) : emptyDashboardData,
      recentAudits: [],
      recentTaxReturns: [],
      revenueData: [],
      salesTrend: [],
      isUsingMockData: isDemoAccount,
    },
  });

  // 對於非 demo 帳戶，如果 API 返回 mock 數據，則返回空數據
  const shouldShowEmptyState = !isDemoAccount && data?.isUsingMockData;

  return {
    dashboardData: shouldShowEmptyState ? emptyDashboardData : (data?.dashboardData ?? (isDemoAccount ? getMockDataByCompanyType(companyType) : emptyDashboardData)),
    recentAudits: shouldShowEmptyState ? [] : (data?.recentAudits ?? []),
    recentTaxReturns: shouldShowEmptyState ? [] : (data?.recentTaxReturns ?? []),
    revenueData: shouldShowEmptyState ? [] : (data?.revenueData ?? []),
    salesTrend: shouldShowEmptyState ? [] : (data?.salesTrend ?? []),
    isLoading,
    error: error?.message ?? null,
    isUsingMockData: data?.isUsingMockData ?? true,
    refetch,
  };
}

// === 向後兼容的導出 ===
// 保持舊的 interface 以兼容其他組件
export interface DashboardStats {
  outstandingInvoices: string;
  activeEngagements: number;
  complianceScore: string;
  revenueYTD: string;
  pendingTasks: number;
  clientCount: number;
  primaryMetric: { label: string; value: string; trend: string };
  secondaryMetric: { label: string; value: string; trend: string };
  tertiaryMetric: { label: string; value: string; trend: string };
  quaternaryMetric: { label: string; value: string; trend: string };
}

export interface PRDashboardStats {
  listedClients: number;
  activeContracts: number;
  ipoMandates: number;
  totalDealSize: number;
  sfcApproved: number;
  announcementsThisMonth: number;
  pendingAnnouncements: number;
  mediaCoverage: number;
  positiveRate: number;
  avgSentiment: string;
  totalReach: number;
}
