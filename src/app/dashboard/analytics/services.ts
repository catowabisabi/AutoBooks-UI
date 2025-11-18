// services.ts
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
  type: 'text' | 'bar' | 'area' | 'pie';
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

export async function sendAnalystQuery(
  payload: AnalystQueryPayload
): Promise<RechartsResponse> {
  try {
    const response = await fetch(
      'http://127.0.0.1:8000/api/v1/analyst-assistant/query/',
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

// Dashboard management functions
export async function saveDashboard(dashboard: DashboardData): Promise<void> {
  try {
    const response = await fetch('/api/dashboards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dashboard)
    });

    if (!response.ok) {
      throw new Error('Failed to save dashboard');
    }
  } catch (error) {
    console.error('Error saving dashboard:', error);
    throw error;
  }
}

export async function getDashboard(id: string): Promise<DashboardData | null> {
  try {
    const response = await fetch(`/api/dashboards/${id}`);

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
    const response = await fetch('/api/dashboards');

    if (!response.ok) {
      throw new Error('Failed to fetch dashboards');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching dashboards:', error);
    throw error;
  }
}

export async function deleteDashboard(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/dashboards/${id}`, {
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
