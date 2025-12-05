/**
 * Analytics API Services
 * ======================
 * API calls for Dashboards, Charts, Sales Analytics, and KPIs
 */

import { api } from '@/lib/api';

const BASE_URL = '/api/v1/analytics';

// Types
export interface Dashboard {
  id: string;
  title: string;
  description?: string;
  is_default: boolean;
  layout?: Record<string, any>;
  charts?: Chart[];
  charts_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Chart {
  id: string;
  dashboard: string;
  title: string;
  type: 'bar' | 'pie' | 'line' | 'scatter' | 'area' | 'donut' | 'radar' | 'table' | 'metric' | 'unsupported';
  config: Record<string, any>;
  data_source?: string;
  position: number;
  width: number;
  height: number;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsSales {
  id: string;
  year: number;
  month: number;
  month_name?: string;
  revenue: number;
  target_revenue: number;
  growth_percentage: number;
  yoy_growth: number;
  new_clients: number;
  total_clients: number;
  churned_clients: number;
  churn_rate: number;
  deals_closed: number;
  deals_pipeline: number;
  average_deal_value: number;
  conversion_rate: number;
  operating_costs: number;
  marketing_spend: number;
  profit_margin?: number;
  revenue_achievement?: number;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface KPIMetric {
  id: string;
  name: string;
  description?: string;
  category: string;
  current_value: number;
  target_value: number;
  previous_value: number;
  unit?: string;
  display_format: string;
  trend: 'UP' | 'DOWN' | 'NEUTRAL';
  is_positive_good: boolean;
  achievement_percentage?: number;
  change_percentage?: number;
  period?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReportSchedule {
  id: string;
  name: string;
  report_type: string;
  frequency: string;
  recipients: string[];
  is_active: boolean;
  last_run?: string;
  next_run?: string;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsOverview {
  current_month: AnalyticsSales | null;
  previous_month: AnalyticsSales | null;
  ytd: {
    total_revenue: string;
    total_new_clients: number;
    total_deals: number;
  };
  kpis: KPIMetric[];
  monthly_trend: AnalyticsSales[];
}

// API Response types
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Dashboards API
export const dashboardsApi = {
  list: (params?: Record<string, any>) => 
    api.get<PaginatedResponse<Dashboard>>(`${BASE_URL}/dashboards/`, { params }),
  
  get: (id: string) => 
    api.get<Dashboard>(`${BASE_URL}/dashboards/${id}/`),
  
  create: (data: Partial<Dashboard>) => 
    api.post<Dashboard>(`${BASE_URL}/dashboards/`, data),
  
  update: (id: string, data: Partial<Dashboard>) => 
    api.patch<Dashboard>(`${BASE_URL}/dashboards/${id}/`, data),
  
  delete: (id: string) => 
    api.delete(`${BASE_URL}/dashboards/${id}/`),
  
  default: () => 
    api.get<Dashboard>(`${BASE_URL}/dashboards/default/`),
};

// Charts API
export const chartsApi = {
  list: (params?: Record<string, any>) => 
    api.get<PaginatedResponse<Chart>>(`${BASE_URL}/charts/`, { params }),
  
  get: (id: string) => 
    api.get<Chart>(`${BASE_URL}/charts/${id}/`),
  
  create: (data: Partial<Chart>) => 
    api.post<Chart>(`${BASE_URL}/charts/`, data),
  
  update: (id: string, data: Partial<Chart>) => 
    api.patch<Chart>(`${BASE_URL}/charts/${id}/`, data),
  
  delete: (id: string) => 
    api.delete(`${BASE_URL}/charts/${id}/`),
};

// Sales Analytics API
export const salesAnalyticsApi = {
  list: (params?: Record<string, any>) => 
    api.get<PaginatedResponse<AnalyticsSales>>(`${BASE_URL}/sales/`, { params }),
  
  get: (id: string) => 
    api.get<AnalyticsSales>(`${BASE_URL}/sales/${id}/`),
  
  create: (data: Partial<AnalyticsSales>) => 
    api.post<AnalyticsSales>(`${BASE_URL}/sales/`, data),
  
  update: (id: string, data: Partial<AnalyticsSales>) => 
    api.patch<AnalyticsSales>(`${BASE_URL}/sales/${id}/`, data),
  
  yearlySummary: (year?: number) => 
    api.get(`${BASE_URL}/sales/yearly_summary/`, { params: { year } }),
  
  trends: () => 
    api.get(`${BASE_URL}/sales/trends/`),
};

// KPIs API
export const kpisApi = {
  list: (params?: Record<string, any>) => 
    api.get<PaginatedResponse<KPIMetric>>(`${BASE_URL}/kpis/`, { params }),
  
  get: (id: string) => 
    api.get<KPIMetric>(`${BASE_URL}/kpis/${id}/`),
  
  create: (data: Partial<KPIMetric>) => 
    api.post<KPIMetric>(`${BASE_URL}/kpis/`, data),
  
  update: (id: string, data: Partial<KPIMetric>) => 
    api.patch<KPIMetric>(`${BASE_URL}/kpis/${id}/`, data),
  
  delete: (id: string) => 
    api.delete(`${BASE_URL}/kpis/${id}/`),
  
  byCategory: () => 
    api.get(`${BASE_URL}/kpis/by_category/`),
  
  updateValue: (id: string, value: number) => 
    api.post<KPIMetric>(`${BASE_URL}/kpis/${id}/update_value/`, { value }),
};

// Report Schedules API
export const reportSchedulesApi = {
  list: (params?: Record<string, any>) => 
    api.get<PaginatedResponse<ReportSchedule>>(`${BASE_URL}/report-schedules/`, { params }),
  
  get: (id: string) => 
    api.get<ReportSchedule>(`${BASE_URL}/report-schedules/${id}/`),
  
  create: (data: Partial<ReportSchedule>) => 
    api.post<ReportSchedule>(`${BASE_URL}/report-schedules/`, data),
  
  update: (id: string, data: Partial<ReportSchedule>) => 
    api.patch<ReportSchedule>(`${BASE_URL}/report-schedules/${id}/`, data),
  
  delete: (id: string) => 
    api.delete(`${BASE_URL}/report-schedules/${id}/`),
};

// Analytics Overview API
export const analyticsOverviewApi = {
  get: () => 
    api.get<AnalyticsOverview>(`${BASE_URL}/overview/`),
};
