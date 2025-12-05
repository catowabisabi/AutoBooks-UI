/**
 * Dashboard Data Hook
 * ====================
 * Fetches real dashboard data from the API with fallback to demo data
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { auditApi, taxReturnApi, billableHourApi, revenueApi } from '@/features/business/services';
import { salesAnalyticsApi, kpisApi } from '@/features/analytics/services';
import { employeeApi } from '@/features/hrms/services';
import { useApp } from '@/contexts/app-context';

export interface DashboardStats {
  // Universal stats
  outstandingInvoices: string;
  activeEngagements: number;
  complianceScore: string;
  revenueYTD: string;
  pendingTasks: number;
  clientCount: number;
  // Industry-specific stats
  primaryMetric: { label: string; value: string; trend: string };
  secondaryMetric: { label: string; value: string; trend: string };
  tertiaryMetric: { label: string; value: string; trend: string };
  quaternaryMetric: { label: string; value: string; trend: string };
}

export interface DashboardData {
  stats: DashboardStats;
  recentAudits: any[];
  recentTaxReturns: any[];
  revenueData: any[];
  salesTrend: any[];
  isLoading: boolean;
  error: string | null;
  isUsingMockData: boolean;
  refetch: () => void;
}

export function useDashboardData(): DashboardData {
  const { currentCompany } = useApp();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const [data, setData] = useState<Omit<DashboardData, 'isLoading' | 'error' | 'isUsingMockData' | 'refetch'>>({
    stats: currentCompany.stats,
    recentAudits: [],
    recentTaxReturns: [],
    revenueData: [],
    salesTrend: [],
  });

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch all data in parallel
      const [
        auditsResponse,
        taxReturnsResponse,
        revenueResponse,
        billableHoursResponse,
        salesResponse,
        employeesResponse,
      ] = await Promise.all([
        auditApi.list({ ordering: '-created_at', page_size: 10 }).catch(() => null),
        taxReturnApi.list({ ordering: '-deadline', page_size: 10 }).catch(() => null),
        revenueApi.summary().catch(() => null),
        billableHourApi.summaryByRole().catch(() => null),
        salesAnalyticsApi.list({ ordering: '-year,-month', page_size: 12 }).catch(() => null),
        employeeApi.list({ is_active: true }).catch(() => null),
      ]);

      // Check if we got any data from API
      const hasApiData = auditsResponse || taxReturnsResponse || revenueResponse || salesResponse;

      if (hasApiData) {
        // Calculate stats from API data
        const audits = auditsResponse?.results || [];
        const taxReturns = taxReturnsResponse?.results || [];
        const revenue = revenueResponse || {};
        const billableHours = billableHoursResponse || {};
        const salesData = salesResponse?.results || [];
        const employees = employeesResponse?.results || [];

        const activeAudits = audits.filter((a: any) => a.status !== 'completed').length;
        const pendingTaxReturns = taxReturns.filter((t: any) => t.status === 'pending').length;
        const totalBillableHours = Object.values(billableHours).reduce((sum: number, val: any) => 
          sum + (val?.total_hours || 0), 0);

        // Calculate YTD revenue
        const currentYear = new Date().getFullYear();
        const ytdRevenue = salesData
          .filter((s: any) => s.year === currentYear)
          .reduce((sum: number, s: any) => sum + parseFloat(s.revenue || 0), 0);

        // Build stats object
        const apiStats: DashboardStats = {
          outstandingInvoices: `HK$${((revenue.pending || 0) / 1000).toFixed(0)}K`,
          activeEngagements: activeAudits + pendingTaxReturns,
          complianceScore: `${revenue.collection_rate || 95}%`,
          revenueYTD: `HK$${(ytdRevenue / 1000000).toFixed(1)}M`,
          pendingTasks: pendingTaxReturns,
          clientCount: employees.length || currentCompany.stats.clientCount,
          primaryMetric: {
            label: 'Audits In Progress',
            value: activeAudits.toString(),
            trend: `${audits.length} total projects`
          },
          secondaryMetric: {
            label: 'Tax Returns Pending',
            value: pendingTaxReturns.toString(),
            trend: `${taxReturns.length} total cases`
          },
          tertiaryMetric: {
            label: 'Billable Hours (MTD)',
            value: `${totalBillableHours.toLocaleString()} hrs`,
            trend: 'From API data'
          },
          quaternaryMetric: {
            label: 'Total Revenue',
            value: `HK$${((revenue.total_received || 0) / 1000).toFixed(0)}K`,
            trend: `${((revenue.pending || 0) / 1000).toFixed(0)}K pending`
          }
        };

        setData({
          stats: apiStats,
          recentAudits: audits.slice(0, 6),
          recentTaxReturns: taxReturns.slice(0, 6),
          revenueData: salesData,
          salesTrend: salesData.map((s: any) => ({
            month: s.month_name || `${s.month}/${s.year}`,
            revenue: parseFloat(s.revenue || 0),
            target: parseFloat(s.target_revenue || 0)
          }))
        });
        setIsUsingMockData(false);
      } else {
        // Use mock data from demo company
        console.log('[Dashboard] Using mock data - API not available');
        setData({
          stats: currentCompany.stats,
          recentAudits: currentCompany.engagements || [],
          recentTaxReturns: [],
          revenueData: [],
          salesTrend: currentCompany.chartData || []
        });
        setIsUsingMockData(true);
      }
    } catch (err) {
      console.error('[Dashboard] Error fetching data:', err);
      // Fallback to demo data
      setData({
        stats: currentCompany.stats,
        recentAudits: currentCompany.engagements || [],
        recentTaxReturns: [],
        revenueData: [],
        salesTrend: currentCompany.chartData || []
      });
      setIsUsingMockData(true);
      setError('Failed to fetch live data, showing demo data');
    } finally {
      setIsLoading(false);
    }
  }, [currentCompany]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    ...data,
    isLoading,
    error,
    isUsingMockData,
    refetch: fetchDashboardData
  };
}
