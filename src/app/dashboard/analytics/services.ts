// services.ts
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000'}/api/v1`;

export interface AnalystQueryPayload {
  query: string;
}

export interface RechartsResponse {
  type:
    | 'bar'
    | 'scatter'
    | 'line'
    | 'area'
    | 'pie'
    | 'table'
    | 'text'
    | 'invalid';
  title?: string;
  data?: any[];
  xKey?: string;
  yKey?: string;
  labelKey?: string;
  valueKey?: string;
  message?: string;
}

export interface DashboardData {
  id: string;
  title: string;
  description?: string;
  createdBy: string;
  createdByName: string;
  createdByEmail: string;
  dataSources: number;
  createdOn: string;
  lastRefreshed: string;
  widgets?: WidgetData[];
}

export interface WidgetData {
  id: string;
  dashboardId: string;
  type: 'text' | 'bar' | 'area' | 'pie' | 'line' | 'scatter';
  title: string;
  description: string;
  size: { width: number; height: number };
  content?: string;
  data?: any[];
  xKey?: string;
  yKey?: string;
  labelKey?: string;
  valueKey?: string;
}

// Sales Analytics interfaces
export interface SalesAnalytics {
  total_revenue: number;
  total_orders: number;
  average_order_value: number;
  revenue_by_period: { period: string; revenue: number }[];
  revenue_by_product: { product: string; revenue: number }[];
  revenue_by_region: { region: string; revenue: number }[];
  top_customers: { customer: string; revenue: number }[];
}

// Finance Analytics interfaces
export interface FinanceAnalytics {
  total_income: number;
  total_expenses: number;
  net_profit: number;
  profit_margin: number;
  cash_flow: number;
  accounts_receivable: number;
  accounts_payable: number;
  income_by_period: { period: string; income: number }[];
  expenses_by_category: { category: string; amount: number }[];
}

export async function sendAnalystQuery(
  payload: AnalystQueryPayload
): Promise<RechartsResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/analyst-assistant/query/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch data from analyst assistant');
    }

    const data = await response.json();
    return data as RechartsResponse;
  } catch (error) {
    console.error('Error sending analyst query:', error);
    throw error;
  }
}

// Analytics Module Services

export const analyticsApi = {
  getCharts: () => fetch(`${API_BASE_URL}/analytics/charts/`).then(res => res.json()),
  getKPIs: () => fetch(`${API_BASE_URL}/analytics/kpis/`).then(res => res.json()),
  getReportSchedules: () => fetch(`${API_BASE_URL}/analytics/report-schedules/`).then(res => res.json()),
  getOverview: () => fetch(`${API_BASE_URL}/analytics/overview/`).then(res => res.json()),
};

// Sales Analytics API
export async function getSalesAnalytics(params?: {
  start_date?: string;
  end_date?: string;
  period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
}): Promise<SalesAnalytics> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.start_date) searchParams.append('start_date', params.start_date);
    if (params?.end_date) searchParams.append('end_date', params.end_date);
    if (params?.period) searchParams.append('period', params.period);
    
    const response = await fetch(
      `${API_BASE_URL}/analytics/sales/?${searchParams}`,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    if (!response.ok) {
      // Return demo data on error
      return getDemoSalesAnalytics();
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching sales analytics:', error);
    return getDemoSalesAnalytics();
  }
}

// Finance Analytics API
export async function getFinanceAnalytics(params?: {
  start_date?: string;
  end_date?: string;
  period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
}): Promise<FinanceAnalytics> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.start_date) searchParams.append('start_date', params.start_date);
    if (params?.end_date) searchParams.append('end_date', params.end_date);
    if (params?.period) searchParams.append('period', params.period);
    
    const response = await fetch(
      `${API_BASE_URL}/analytics/finance/?${searchParams}`,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    if (!response.ok) {
      return getDemoFinanceAnalytics();
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching finance analytics:', error);
    return getDemoFinanceAnalytics();
  }
}

// Dashboard management functions
export async function saveDashboard(dashboard: Partial<DashboardData>): Promise<DashboardData> {
  try {
    const response = await fetch(`${API_BASE_URL}/analytics/dashboards/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dashboard)
    });

    if (!response.ok) {
      throw new Error('Failed to save dashboard');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error saving dashboard:', error);
    throw error;
  }
}

export async function getDashboard(id: string): Promise<DashboardData | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/analytics/dashboards/${id}/`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch dashboard');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    throw error;
  }
}

export async function getDashboards(): Promise<DashboardData[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/analytics/dashboards/`);

    if (!response.ok) {
      // Return demo data on error
      return getDemoDashboards();
    }

    const data = await response.json();
    return data.results || data;
  } catch (error) {
    console.error('Error fetching dashboards:', error);
    return getDemoDashboards();
  }
}

export async function updateDashboard(id: string, dashboard: Partial<DashboardData>): Promise<DashboardData> {
  try {
    const response = await fetch(`${API_BASE_URL}/analytics/dashboards/${id}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dashboard)
    });

    if (!response.ok) {
      throw new Error('Failed to update dashboard');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error updating dashboard:', error);
    throw error;
  }
}

export async function deleteDashboard(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/analytics/dashboards/${id}/`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete dashboard');
    }
  } catch (error) {
    console.error('Error deleting dashboard:', error);
    throw error;
  }
}

// Widget management
export async function addWidget(dashboardId: string, widget: Partial<WidgetData>): Promise<WidgetData> {
  try {
    const response = await fetch(`${API_BASE_URL}/analytics/widgets/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ...widget, dashboard: dashboardId })
    });

    if (!response.ok) {
      throw new Error('Failed to add widget');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error adding widget:', error);
    throw error;
  }
}

export async function updateWidget(widgetId: string, widget: Partial<WidgetData>): Promise<WidgetData> {
  try {
    const response = await fetch(`${API_BASE_URL}/analytics/widgets/${widgetId}/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(widget)
    });

    if (!response.ok) {
      throw new Error('Failed to update widget');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error updating widget:', error);
    throw error;
  }
}

export async function deleteWidget(widgetId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/analytics/widgets/${widgetId}/`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete widget');
    }
  } catch (error) {
    console.error('Error deleting widget:', error);
    throw error;
  }
}

// Demo data generators
function getDemoDashboards(): DashboardData[] {
  return [
    {
      id: 'sales-analytics',
      title: 'Sales Analytics / 銷售分析',
      description: 'Track sales performance and trends',
      createdBy: 'system',
      createdByName: 'System',
      createdByEmail: 'system@wisematic.com',
      dataSources: 3,
      createdOn: '2025-01-01',
      lastRefreshed: new Date().toISOString(),
    },
    {
      id: 'finance-overview',
      title: 'Finance Overview / 財務總覽',
      description: 'Monitor financial health and cash flow',
      createdBy: 'system',
      createdByName: 'System',
      createdByEmail: 'system@wisematic.com',
      dataSources: 5,
      createdOn: '2025-01-01',
      lastRefreshed: new Date().toISOString(),
    },
    {
      id: 'marketing-overview',
      title: 'Marketing Overview / 行銷總覽',
      description: 'Analyze marketing campaign performance',
      createdBy: 'system',
      createdByName: 'System',
      createdByEmail: 'system@wisematic.com',
      dataSources: 4,
      createdOn: '2025-01-01',
      lastRefreshed: new Date().toISOString(),
    },
    {
      id: 'product-analytics',
      title: 'Product Analytics / 產品分析',
      description: 'Product performance and inventory insights',
      createdBy: 'system',
      createdByName: 'System',
      createdByEmail: 'system@wisematic.com',
      dataSources: 3,
      createdOn: '2025-02-01',
      lastRefreshed: new Date().toISOString(),
    },
    {
      id: 'customer-insights',
      title: 'Customer Insights / 客戶洞察',
      description: 'Customer behavior and satisfaction analysis',
      createdBy: 'system',
      createdByName: 'System',
      createdByEmail: 'system@wisematic.com',
      dataSources: 4,
      createdOn: '2025-02-15',
      lastRefreshed: new Date().toISOString(),
    },
  ];
}

function getDemoSalesAnalytics(): SalesAnalytics {
  return {
    total_revenue: 12500000,
    total_orders: 4250,
    average_order_value: 2941,
    revenue_by_period: [
      { period: 'Jan', revenue: 950000 },
      { period: 'Feb', revenue: 1020000 },
      { period: 'Mar', revenue: 1150000 },
      { period: 'Apr', revenue: 980000 },
      { period: 'May', revenue: 1280000 },
      { period: 'Jun', revenue: 1350000 },
      { period: 'Jul', revenue: 1120000 },
      { period: 'Aug', revenue: 1080000 },
      { period: 'Sep', revenue: 1250000 },
      { period: 'Oct', revenue: 1020000 },
      { period: 'Nov', revenue: 1150000 },
      { period: 'Dec', revenue: 1150000 },
    ],
    revenue_by_product: [
      { product: 'Product A', revenue: 3200000 },
      { product: 'Product B', revenue: 2800000 },
      { product: 'Product C', revenue: 2400000 },
      { product: 'Product D', revenue: 2100000 },
      { product: 'Product E', revenue: 2000000 },
    ],
    revenue_by_region: [
      { region: 'Taipei', revenue: 4500000 },
      { region: 'Taichung', revenue: 2800000 },
      { region: 'Kaohsiung', revenue: 2200000 },
      { region: 'Taoyuan', revenue: 1800000 },
      { region: 'Others', revenue: 1200000 },
    ],
    top_customers: [
      { customer: 'ABC Corporation', revenue: 1250000 },
      { customer: 'XYZ Enterprises', revenue: 980000 },
      { customer: 'DEF Industries', revenue: 850000 },
      { customer: 'GHI Trading', revenue: 720000 },
      { customer: 'JKL Services', revenue: 650000 },
    ],
  };
}

function getDemoFinanceAnalytics(): FinanceAnalytics {
  return {
    total_income: 12500000,
    total_expenses: 9800000,
    net_profit: 2700000,
    profit_margin: 21.6,
    cash_flow: 1850000,
    accounts_receivable: 3200000,
    accounts_payable: 2100000,
    income_by_period: [
      { period: 'Jan', income: 950000 },
      { period: 'Feb', income: 1020000 },
      { period: 'Mar', income: 1150000 },
      { period: 'Apr', income: 980000 },
      { period: 'May', income: 1280000 },
      { period: 'Jun', income: 1350000 },
      { period: 'Jul', income: 1120000 },
      { period: 'Aug', income: 1080000 },
      { period: 'Sep', income: 1250000 },
      { period: 'Oct', income: 1020000 },
      { period: 'Nov', income: 1150000 },
      { period: 'Dec', income: 1150000 },
    ],
    expenses_by_category: [
      { category: 'Personnel / 人事', amount: 4200000 },
      { category: 'Operations / 營運', amount: 2800000 },
      { category: 'Marketing / 行銷', amount: 1200000 },
      { category: 'R&D / 研發', amount: 950000 },
      { category: 'Administrative / 行政', amount: 650000 },
    ],
  };
}

