/**
 * Business API Services
 * ====================
 * API calls for Audits, Tax Returns, Billable Hours, Revenue, and BMI IPO/PR
 */

import { api } from '@/lib/api';

const BASE_URL = '/api/v1/business';

// Types
export interface Company {
  id: string;
  name: string;
  registration_number?: string;
  tax_id?: string;
  address?: string;
  industry?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuditProject {
  id: string;
  company: string;
  company_name?: string;
  fiscal_year: string;
  audit_type: string;
  progress: number;
  status: 'NOT_STARTED' | 'PLANNING' | 'FIELDWORK' | 'REVIEW' | 'REPORTING' | 'COMPLETED' | 'ON_HOLD';
  start_date?: string;
  deadline?: string;
  completion_date?: string;
  assigned_to?: string;
  assigned_to_name?: string;
  budget_hours?: number;
  actual_hours?: number;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaxReturnCase {
  id: string;
  company: string;
  company_name?: string;
  tax_year: string;
  tax_type: string;
  progress: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED' | 'AMENDED';
  deadline?: string;
  submitted_date?: string;
  handler?: string;
  handler_name?: string;
  tax_amount?: number;
  documents_received: boolean;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BillableHour {
  id: string;
  employee: string;
  employee_name?: string;
  company?: string;
  company_name?: string;
  project_reference?: string;
  role: 'CLERK' | 'ACCOUNTANT' | 'MANAGER' | 'DIRECTOR' | 'PARTNER';
  base_hourly_rate: number;
  hourly_rate_multiplier: number;
  effective_rate?: number;
  date: string;
  actual_hours: number;
  total_cost?: number;
  description?: string;
  is_billable: boolean;
  is_invoiced: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Revenue {
  id: string;
  company: string;
  company_name?: string;
  invoice_number?: string;
  description?: string;
  total_amount: number;
  received_amount: number;
  pending_amount?: number;
  is_fully_paid?: boolean;
  status: 'PENDING' | 'PARTIAL' | 'RECEIVED' | 'OVERDUE' | 'WRITTEN_OFF';
  invoice_date?: string;
  due_date?: string;
  received_date?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BMIIPOPRRecord {
  id: string;
  project_name: string;
  company: string;
  company_name?: string;
  stage: string;
  status: 'ACTIVE' | 'ON_TRACK' | 'DELAYED' | 'AT_RISK' | 'COMPLETED' | 'CANCELLED';
  project_type: string;
  estimated_value?: number;
  total_cost?: number;
  start_date?: string;
  target_completion_date?: string;
  actual_completion_date?: string;
  progress: number;
  lead_manager?: string;
  lead_manager_name?: string;
  documents?: any[];
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DashboardOverview {
  total_audits: number;
  audits_in_progress: number;
  total_tax_returns: number;
  tax_returns_pending: number;
  total_revenue: string;
  pending_revenue: string;
  total_billable_hours: string;
  bmi_projects_active: number;
  recent_audits: AuditProject[];
  recent_tax_returns: TaxReturnCase[];
  recent_revenues: Revenue[];
}

// API Response types
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Helper function to normalize API response (handles both array and paginated response)
function normalizeResponse<T>(data: T[] | PaginatedResponse<T>): PaginatedResponse<T> {
  if (Array.isArray(data)) {
    return {
      count: data.length,
      next: null,
      previous: null,
      results: data,
    };
  }
  return data;
}

// Companies API
export const companiesApi = {
  list: async (params?: Record<string, any>) => {
    const data = await api.get<Company[] | PaginatedResponse<Company>>(`${BASE_URL}/companies/`, { params });
    return normalizeResponse(data);
  },
  
  get: (id: string) => 
    api.get<Company>(`${BASE_URL}/companies/${id}/`),
  
  create: (data: Partial<Company>) => 
    api.post<Company>(`${BASE_URL}/companies/`, data),
  
  update: (id: string, data: Partial<Company>) => 
    api.patch<Company>(`${BASE_URL}/companies/${id}/`, data),
  
  delete: (id: string) => 
    api.delete(`${BASE_URL}/companies/${id}/`),
  
  stats: () => 
    api.get(`${BASE_URL}/companies/stats/`),
};

// Audits API
export const auditsApi = {
  list: async (params?: Record<string, any>) => {
    const data = await api.get<AuditProject[] | PaginatedResponse<AuditProject>>(`${BASE_URL}/audits/`, { params });
    return normalizeResponse(data);
  },
  
  get: (id: string) => 
    api.get<AuditProject>(`${BASE_URL}/audits/${id}/`),
  
  create: (data: Partial<AuditProject>) => 
    api.post<AuditProject>(`${BASE_URL}/audits/`, data),
  
  update: (id: string, data: Partial<AuditProject>) => 
    api.patch<AuditProject>(`${BASE_URL}/audits/${id}/`, data),
  
  delete: (id: string) => 
    api.delete(`${BASE_URL}/audits/${id}/`),
  
  summary: () => 
    api.get(`${BASE_URL}/audits/summary/`),
};

// Tax Returns API
export const taxReturnsApi = {
  list: async (params?: Record<string, any>) => {
    const data = await api.get<TaxReturnCase[] | PaginatedResponse<TaxReturnCase>>(`${BASE_URL}/tax-returns/`, { params });
    return normalizeResponse(data);
  },
  
  get: (id: string) => 
    api.get<TaxReturnCase>(`${BASE_URL}/tax-returns/${id}/`),
  
  create: (data: Partial<TaxReturnCase>) => 
    api.post<TaxReturnCase>(`${BASE_URL}/tax-returns/`, data),
  
  update: (id: string, data: Partial<TaxReturnCase>) => 
    api.patch<TaxReturnCase>(`${BASE_URL}/tax-returns/${id}/`, data),
  
  delete: (id: string) => 
    api.delete(`${BASE_URL}/tax-returns/${id}/`),
  
  summary: () => 
    api.get(`${BASE_URL}/tax-returns/summary/`),
};

// Billable Hours API
export const billableHoursApi = {
  list: async (params?: Record<string, any>) => {
    const data = await api.get<BillableHour[] | PaginatedResponse<BillableHour>>(`${BASE_URL}/billable-hours/`, { params });
    return normalizeResponse(data);
  },
  
  get: (id: string) => 
    api.get<BillableHour>(`${BASE_URL}/billable-hours/${id}/`),
  
  create: (data: Partial<BillableHour>) => 
    api.post<BillableHour>(`${BASE_URL}/billable-hours/`, data),
  
  update: (id: string, data: Partial<BillableHour>) => 
    api.patch<BillableHour>(`${BASE_URL}/billable-hours/${id}/`, data),
  
  delete: (id: string) => 
    api.delete(`${BASE_URL}/billable-hours/${id}/`),
  
  summary: () => 
    api.get(`${BASE_URL}/billable-hours/summary/`),
  
  byEmployee: () => 
    api.get(`${BASE_URL}/billable-hours/by_employee/`),
};

// Revenue API
export const revenueApi = {
  list: async (params?: Record<string, any>) => {
    const data = await api.get<Revenue[] | PaginatedResponse<Revenue>>(`${BASE_URL}/revenues/`, { params });
    return normalizeResponse(data);
  },
  
  get: (id: string) => 
    api.get<Revenue>(`${BASE_URL}/revenues/${id}/`),
  
  create: (data: Partial<Revenue>) => 
    api.post<Revenue>(`${BASE_URL}/revenues/`, data),
  
  update: (id: string, data: Partial<Revenue>) => 
    api.patch<Revenue>(`${BASE_URL}/revenues/${id}/`, data),
  
  delete: (id: string) => 
    api.delete(`${BASE_URL}/revenues/${id}/`),
  
  summary: () => 
    api.get(`${BASE_URL}/revenues/summary/`),
  
  recordPayment: (id: string, amount: number) => 
    api.post(`${BASE_URL}/revenues/${id}/record_payment/`, { amount }),
};

// BMI IPO/PR API
export const bmiProjectsApi = {
  list: async (params?: Record<string, any>) => {
    const data = await api.get<BMIIPOPRRecord[] | PaginatedResponse<BMIIPOPRRecord>>(`${BASE_URL}/bmi-projects/`, { params });
    return normalizeResponse(data);
  },
  
  get: (id: string) => 
    api.get<BMIIPOPRRecord>(`${BASE_URL}/bmi-projects/${id}/`),
  
  create: (data: Partial<BMIIPOPRRecord>) => 
    api.post<BMIIPOPRRecord>(`${BASE_URL}/bmi-projects/`, data),
  
  update: (id: string, data: Partial<BMIIPOPRRecord>) => 
    api.patch<BMIIPOPRRecord>(`${BASE_URL}/bmi-projects/${id}/`, data),
  
  delete: (id: string) => 
    api.delete(`${BASE_URL}/bmi-projects/${id}/`),
  
  summary: () => 
    api.get(`${BASE_URL}/bmi-projects/summary/`),
};

// =================================================================
// Financial PR & IPO Advisory Types
// =================================================================

export interface ListedClient {
  id: string;
  company: string;
  company_name?: string;
  stock_code: string;
  exchange: string;
  sector?: string;
  market_cap?: number;
  status: 'ACTIVE' | 'INACTIVE' | 'PROSPECT' | 'CHURNED';
  contract_start_date?: string;
  contract_end_date?: string;
  annual_retainer?: number;
  primary_contact?: string;
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  listed_client: string;
  listed_client_name?: string;
  stock_code?: string;
  announcement_type: string;
  title: string;
  publish_date: string;
  deadline?: string;
  status: string;
  handler?: string;
  handler_name?: string;
  word_count?: number;
  languages?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MediaCoverage {
  id: string;
  listed_client?: string;
  listed_client_name?: string;
  company?: string;
  company_name?: string;
  title: string;
  media_outlet: string;
  publish_date: string;
  url?: string;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  reach?: number;
  engagement?: number;
  is_press_release: boolean;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface IPOMandate {
  id: string;
  project_name: string;
  company: string;
  company_name?: string;
  stage: string;
  target_exchange: string;
  target_board: string;
  deal_size?: number;
  deal_size_category: string;
  fee_percentage?: number;
  estimated_fee?: number;
  probability?: number;
  pitch_date?: string;
  mandate_date?: string;
  target_listing_date?: string;
  actual_listing_date?: string;
  lead_partner?: string;
  lead_partner_name?: string;
  sfc_application_date?: string;
  sfc_approval_date?: string;
  is_sfc_approved: boolean;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceRevenue {
  id: string;
  company?: string;
  company_name?: string;
  service_type: string;
  period_year: number;
  period_month: number;
  amount: number;
  billable_hours?: number;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ActiveEngagement {
  id: string;
  company: string;
  company_name?: string;
  title: string;
  engagement_type: 'RETAINER' | 'PROJECT' | 'AD_HOC';
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  start_date: string;
  end_date?: string;
  value?: number;
  progress?: number;
  lead?: string;
  lead_name?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientPerformance {
  id: string;
  company: string;
  company_name?: string;
  period_year: number;
  period_quarter: number;
  revenue_generated?: number;
  satisfaction_score?: number;
  projects_completed?: number;
  referrals_made?: number;
  response_time_hours?: number;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientIndustry {
  id: string;
  name: string;
  code: string;
  description?: string;
  color?: string;
  client_count?: number;
  total_revenue?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MediaSentimentRecord {
  id: string;
  period_date: string;
  positive_count: number;
  neutral_count: number;
  negative_count: number;
  total_reach?: number;
  total_engagement?: number;
  sentiment_score?: number;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RevenueTrend {
  id: string;
  period_year: number;
  period_month: number;
  total_revenue: number;
  recurring_revenue?: number;
  project_revenue?: number;
  new_clients?: number;
  churned_clients?: number;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// =================================================================
// Financial PR & IPO Advisory APIs
// =================================================================

// Listed Clients API
export const listedClientsApi = {
  list: async (params?: Record<string, any>) => {
    const data = await api.get<ListedClient[] | PaginatedResponse<ListedClient>>(`${BASE_URL}/listed-clients/`, { params });
    return normalizeResponse(data);
  },
  get: (id: string) => api.get<ListedClient>(`${BASE_URL}/listed-clients/${id}/`),
  create: (data: Partial<ListedClient>) => api.post<ListedClient>(`${BASE_URL}/listed-clients/`, data),
  update: (id: string, data: Partial<ListedClient>) => api.patch<ListedClient>(`${BASE_URL}/listed-clients/${id}/`, data),
  delete: (id: string) => api.delete(`${BASE_URL}/listed-clients/${id}/`),
  summary: () => api.get(`${BASE_URL}/listed-clients/summary/`),
};

// Announcements API
export const announcementsApi = {
  list: async (params?: Record<string, any>) => {
    const data = await api.get<Announcement[] | PaginatedResponse<Announcement>>(`${BASE_URL}/announcements/`, { params });
    return normalizeResponse(data);
  },
  get: (id: string) => api.get<Announcement>(`${BASE_URL}/announcements/${id}/`),
  create: (data: Partial<Announcement>) => api.post<Announcement>(`${BASE_URL}/announcements/`, data),
  update: (id: string, data: Partial<Announcement>) => api.patch<Announcement>(`${BASE_URL}/announcements/${id}/`, data),
  delete: (id: string) => api.delete(`${BASE_URL}/announcements/${id}/`),
  thisMonth: () => api.get(`${BASE_URL}/announcements/this_month/`),
};

// Media Coverage API
export const mediaCoverageApi = {
  list: async (params?: Record<string, any>) => {
    const data = await api.get<MediaCoverage[] | PaginatedResponse<MediaCoverage>>(`${BASE_URL}/media-coverage/`, { params });
    return normalizeResponse(data);
  },
  get: (id: string) => api.get<MediaCoverage>(`${BASE_URL}/media-coverage/${id}/`),
  create: (data: Partial<MediaCoverage>) => api.post<MediaCoverage>(`${BASE_URL}/media-coverage/`, data),
  update: (id: string, data: Partial<MediaCoverage>) => api.patch<MediaCoverage>(`${BASE_URL}/media-coverage/${id}/`, data),
  delete: (id: string) => api.delete(`${BASE_URL}/media-coverage/${id}/`),
  summary: () => api.get(`${BASE_URL}/media-coverage/summary/`),
};

// IPO Mandates API
export const ipoMandatesApi = {
  list: async (params?: Record<string, any>) => {
    const data = await api.get<IPOMandate[] | PaginatedResponse<IPOMandate>>(`${BASE_URL}/ipo-mandates/`, { params });
    return normalizeResponse(data);
  },
  get: (id: string) => api.get<IPOMandate>(`${BASE_URL}/ipo-mandates/${id}/`),
  create: (data: Partial<IPOMandate>) => api.post<IPOMandate>(`${BASE_URL}/ipo-mandates/`, data),
  update: (id: string, data: Partial<IPOMandate>) => api.patch<IPOMandate>(`${BASE_URL}/ipo-mandates/${id}/`, data),
  delete: (id: string) => api.delete(`${BASE_URL}/ipo-mandates/${id}/`),
  summary: () => api.get(`${BASE_URL}/ipo-mandates/summary/`),
  dealFunnel: () => api.get(`${BASE_URL}/ipo-mandates/deal_funnel/`),
};

// Service Revenues API
export const serviceRevenuesApi = {
  list: async (params?: Record<string, any>) => {
    const data = await api.get<ServiceRevenue[] | PaginatedResponse<ServiceRevenue>>(`${BASE_URL}/service-revenues/`, { params });
    return normalizeResponse(data);
  },
  get: (id: string) => api.get<ServiceRevenue>(`${BASE_URL}/service-revenues/${id}/`),
  create: (data: Partial<ServiceRevenue>) => api.post<ServiceRevenue>(`${BASE_URL}/service-revenues/`, data),
  update: (id: string, data: Partial<ServiceRevenue>) => api.patch<ServiceRevenue>(`${BASE_URL}/service-revenues/${id}/`, data),
  delete: (id: string) => api.delete(`${BASE_URL}/service-revenues/${id}/`),
  byService: (year?: number) => api.get(`${BASE_URL}/service-revenues/by_service/`, { params: { year } }),
};

// Active Engagements API
export const engagementsApi = {
  list: async (params?: Record<string, any>) => {
    const data = await api.get<ActiveEngagement[] | PaginatedResponse<ActiveEngagement>>(`${BASE_URL}/engagements/`, { params });
    return normalizeResponse(data);
  },
  get: (id: string) => api.get<ActiveEngagement>(`${BASE_URL}/engagements/${id}/`),
  create: (data: Partial<ActiveEngagement>) => api.post<ActiveEngagement>(`${BASE_URL}/engagements/`, data),
  update: (id: string, data: Partial<ActiveEngagement>) => api.patch<ActiveEngagement>(`${BASE_URL}/engagements/${id}/`, data),
  delete: (id: string) => api.delete(`${BASE_URL}/engagements/${id}/`),
  summary: () => api.get(`${BASE_URL}/engagements/summary/`),
};

// Client Performance API
export const clientPerformanceApi = {
  list: async (params?: Record<string, any>) => {
    const data = await api.get<ClientPerformance[] | PaginatedResponse<ClientPerformance>>(`${BASE_URL}/client-performance/`, { params });
    return normalizeResponse(data);
  },
  get: (id: string) => api.get<ClientPerformance>(`${BASE_URL}/client-performance/${id}/`),
  create: (data: Partial<ClientPerformance>) => api.post<ClientPerformance>(`${BASE_URL}/client-performance/`, data),
  update: (id: string, data: Partial<ClientPerformance>) => api.patch<ClientPerformance>(`${BASE_URL}/client-performance/${id}/`, data),
  delete: (id: string) => api.delete(`${BASE_URL}/client-performance/${id}/`),
};

// Client Industries API
export const clientIndustriesApi = {
  list: async (params?: Record<string, any>) => {
    const data = await api.get<ClientIndustry[] | PaginatedResponse<ClientIndustry>>(`${BASE_URL}/client-industries/`, { params });
    return normalizeResponse(data);
  },
  get: (id: string) => api.get<ClientIndustry>(`${BASE_URL}/client-industries/${id}/`),
  create: (data: Partial<ClientIndustry>) => api.post<ClientIndustry>(`${BASE_URL}/client-industries/`, data),
  update: (id: string, data: Partial<ClientIndustry>) => api.patch<ClientIndustry>(`${BASE_URL}/client-industries/${id}/`, data),
  delete: (id: string) => api.delete(`${BASE_URL}/client-industries/${id}/`),
};

// Media Sentiment API
export const mediaSentimentApi = {
  list: async (params?: Record<string, any>) => {
    const data = await api.get<MediaSentimentRecord[] | PaginatedResponse<MediaSentimentRecord>>(`${BASE_URL}/media-sentiment/`, { params });
    return normalizeResponse(data);
  },
  get: (id: string) => api.get<MediaSentimentRecord>(`${BASE_URL}/media-sentiment/${id}/`),
  create: (data: Partial<MediaSentimentRecord>) => api.post<MediaSentimentRecord>(`${BASE_URL}/media-sentiment/`, data),
  update: (id: string, data: Partial<MediaSentimentRecord>) => api.patch<MediaSentimentRecord>(`${BASE_URL}/media-sentiment/${id}/`, data),
  delete: (id: string) => api.delete(`${BASE_URL}/media-sentiment/${id}/`),
  trend: (days?: number) => api.get(`${BASE_URL}/media-sentiment/trend/`, { params: { days } }),
};

// Revenue Trends API
export const revenueTrendsApi = {
  list: async (params?: Record<string, any>) => {
    const data = await api.get<RevenueTrend[] | PaginatedResponse<RevenueTrend>>(`${BASE_URL}/revenue-trends/`, { params });
    return normalizeResponse(data);
  },
  get: (id: string) => api.get<RevenueTrend>(`${BASE_URL}/revenue-trends/${id}/`),
  create: (data: Partial<RevenueTrend>) => api.post<RevenueTrend>(`${BASE_URL}/revenue-trends/`, data),
  update: (id: string, data: Partial<RevenueTrend>) => api.patch<RevenueTrend>(`${BASE_URL}/revenue-trends/${id}/`, data),
  delete: (id: string) => api.delete(`${BASE_URL}/revenue-trends/${id}/`),
  yearly: () => api.get(`${BASE_URL}/revenue-trends/yearly/`),
};

// =================================================================
// IPO Timeline Progress Types & API
// =================================================================
export interface IPOTimelineProgress {
  id: string;
  company: string;
  company_name?: string;
  phase: 'due_diligence' | 'documentation' | 'regulatory' | 'marketing' | 'pricing';
  progress_percentage: number;
  target_date: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const ipoTimelineProgressApi = {
  list: async (params?: Record<string, any>) => {
    const data = await api.get<IPOTimelineProgress[] | PaginatedResponse<IPOTimelineProgress>>(`${BASE_URL}/ipo-timeline-progress/`, { params });
    return normalizeResponse(data);
  },
  get: (id: string) => api.get<IPOTimelineProgress>(`${BASE_URL}/ipo-timeline-progress/${id}/`),
  create: (data: Partial<IPOTimelineProgress>) => api.post<IPOTimelineProgress>(`${BASE_URL}/ipo-timeline-progress/`, data),
  update: (id: string, data: Partial<IPOTimelineProgress>) => api.patch<IPOTimelineProgress>(`${BASE_URL}/ipo-timeline-progress/${id}/`, data),
  delete: (id: string) => api.delete(`${BASE_URL}/ipo-timeline-progress/${id}/`),
  byCompany: (companyId?: string) => api.get(`${BASE_URL}/ipo-timeline-progress/by_company/`, { params: { company_id: companyId } }),
  summary: () => api.get(`${BASE_URL}/ipo-timeline-progress/summary/`),
};

// =================================================================
// IPO Deal Funnel Types & API
// =================================================================
export interface IPODealFunnel {
  id: string;
  company: string;
  company_name?: string;
  period_date: string;
  stage: 'leads' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won';
  deal_count: number;
  conversion_rate: number;
  total_value: number;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const ipoDealFunnelApi = {
  list: async (params?: Record<string, any>) => {
    const data = await api.get<IPODealFunnel[] | PaginatedResponse<IPODealFunnel>>(`${BASE_URL}/ipo-deal-funnel/`, { params });
    return normalizeResponse(data);
  },
  get: (id: string) => api.get<IPODealFunnel>(`${BASE_URL}/ipo-deal-funnel/${id}/`),
  create: (data: Partial<IPODealFunnel>) => api.post<IPODealFunnel>(`${BASE_URL}/ipo-deal-funnel/`, data),
  update: (id: string, data: Partial<IPODealFunnel>) => api.patch<IPODealFunnel>(`${BASE_URL}/ipo-deal-funnel/${id}/`, data),
  delete: (id: string) => api.delete(`${BASE_URL}/ipo-deal-funnel/${id}/`),
  currentFunnel: () => api.get(`${BASE_URL}/ipo-deal-funnel/current_funnel/`),
  conversionRates: () => api.get(`${BASE_URL}/ipo-deal-funnel/conversion_rates/`),
};

// =================================================================
// IPO Deal Size Types & API
// =================================================================
export interface IPODealSize {
  id: string;
  company: string;
  company_name?: string;
  period_date: string;
  size_category: 'mega' | 'large' | 'mid' | 'small';
  deal_count: number;
  total_amount: number;
  avg_deal_size: number;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const ipoDealSizeApi = {
  list: async (params?: Record<string, any>) => {
    const data = await api.get<IPODealSize[] | PaginatedResponse<IPODealSize>>(`${BASE_URL}/ipo-deal-size/`, { params });
    return normalizeResponse(data);
  },
  get: (id: string) => api.get<IPODealSize>(`${BASE_URL}/ipo-deal-size/${id}/`),
  create: (data: Partial<IPODealSize>) => api.post<IPODealSize>(`${BASE_URL}/ipo-deal-size/`, data),
  update: (id: string, data: Partial<IPODealSize>) => api.patch<IPODealSize>(`${BASE_URL}/ipo-deal-size/${id}/`, data),
  delete: (id: string) => api.delete(`${BASE_URL}/ipo-deal-size/${id}/`),
  distribution: () => api.get(`${BASE_URL}/ipo-deal-size/distribution/`),
  trend: (months?: number) => api.get(`${BASE_URL}/ipo-deal-size/trend/`, { params: { months } }),
};

// =================================================================
// Business Partner Types & API
// =================================================================
export interface BusinessPartner {
  id: string;
  company: string;
  company_name?: string;
  name: string;
  partner_type: 'kol' | 'provider' | 'vendor' | 'media' | 'consultant';
  status: 'active' | 'inactive' | 'pending' | 'terminated';
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  service_description?: string;
  contract_start_date?: string;
  contract_end_date?: string;
  contract_value?: number;
  rating?: number;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const businessPartnersApi = {
  list: async (params?: Record<string, any>) => {
    const data = await api.get<BusinessPartner[] | PaginatedResponse<BusinessPartner>>(`${BASE_URL}/partners/`, { params });
    return normalizeResponse(data);
  },
  get: (id: string) => api.get<BusinessPartner>(`${BASE_URL}/partners/${id}/`),
  create: (data: Partial<BusinessPartner>) => api.post<BusinessPartner>(`${BASE_URL}/partners/`, data),
  update: (id: string, data: Partial<BusinessPartner>) => api.patch<BusinessPartner>(`${BASE_URL}/partners/${id}/`, data),
  delete: (id: string) => api.delete(`${BASE_URL}/partners/${id}/`),
  byType: (type?: string) => api.get(`${BASE_URL}/partners/by_type/`, { params: { type } }),
  active: () => api.get(`${BASE_URL}/partners/active/`),
  summary: () => api.get(`${BASE_URL}/partners/summary/`),
};

// Dashboard API
export const businessDashboardApi = {
  overview: () => 
    api.get<DashboardOverview>(`${BASE_URL}/dashboard/`),
};
