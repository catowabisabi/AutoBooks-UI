/**
 * Dashboard Data Hook
 * ====================
 * Fetches real dashboard data from the API with fallback to demo data
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { auditsApi, taxReturnsApi, billableHoursApi, revenueApi } from '@/features/business/services';
import { salesAnalyticsApi } from '@/features/analytics/services';
import { employeesApi } from '@/features/hrms/services';
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
        auditsApi.list({ ordering: '-created_at', page_size: 10 }).catch(() => null),
        taxReturnsApi.list({ ordering: '-deadline', page_size: 10 }).catch(() => null),
        revenueApi.summary().catch(() => null),
        billableHoursApi.summary().catch(() => null),
        salesAnalyticsApi.list({ ordering: '-year,-month', page_size: 12 }).catch(() => null),
        employeesApi.list({ is_active: true }).catch(() => null),
      ]);

      // Check if we got any data from API
      const hasApiData = auditsResponse || taxReturnsResponse || revenueResponse || salesResponse;

      if (hasApiData) {
        // Calculate stats from API data
        const audits = auditsResponse?.results || [];
        const taxReturns = taxReturnsResponse?.results || [];
        const revenue = (revenueResponse || {}) as Record<string, any>;
        // billableHours API returns: { total_hours, billable_hours, total_billable_value, by_role }
        const billableHoursSummary = (billableHoursResponse || {}) as Record<string, any>;
        const salesData = salesResponse?.results || [];
        const employees = employeesResponse?.results || [];

        // Case-insensitive status comparison
        const activeAudits = audits.filter((a: any) => 
          a.status?.toUpperCase() !== 'COMPLETED'
        ).length;
        const pendingTaxReturns = taxReturns.filter((t: any) => 
          t.status?.toUpperCase() === 'PENDING'
        ).length;
        // Get billable hours directly from summary response
        const totalBillableHours = parseFloat(billableHoursSummary['billable_hours'] || billableHoursSummary['total_hours'] || 0);

        // Calculate YTD revenue
        const currentYear = new Date().getFullYear();
        const ytdRevenue = salesData
          .filter((s: any) => s.year === currentYear)
          .reduce((sum: number, s: any) => sum + parseFloat(s.revenue || 0), 0);

        // Build stats object
        // Revenue API returns: { total_revenue, received_amount, pending_amount, by_status }
        const pendingAmount = parseFloat(revenue['pending_amount'] || 0);
        const receivedAmount = parseFloat(revenue['received_amount'] || 0);
        const totalRevenue = parseFloat(revenue['total_revenue'] || 0);
        const collectionRate = totalRevenue > 0 ? Math.round((receivedAmount / totalRevenue) * 100) : 0;
        
        const apiStats: DashboardStats = {
          outstandingInvoices: `HK$${(pendingAmount / 1000).toFixed(0)}K`,
          activeEngagements: activeAudits + pendingTaxReturns,
          complianceScore: `${collectionRate}%`,
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
            value: `HK$${(receivedAmount / 1000).toFixed(0)}K`,
            trend: `${(pendingAmount / 1000).toFixed(0)}K pending`
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
