// types/dashboard.ts
export type WidgetType =
  | 'text'
  | 'bar'
  | 'area'
  | 'pie'
  | 'line'
  | 'scatter'
  | 'table';
export type MessageRole = 'user' | 'assistant';

export interface ChartData {
  type: Exclude<WidgetType, 'text'>; // Charts exclude text type
  title: string;
  description: string;
  data?: any[];
  xKey?: string;
  yKey?: string;
  labelKey?: string;
  valueKey?: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  chart?: ChartData;
}

export interface WidgetData {
  id: string;
  dashboardId: string;
  type: WidgetType;
  title: string;
  description: string;
  size: { width: number; height: number };
  content?: string; // For text widgets
  data?: any[]; // For chart widgets
  xKey?: string;
  yKey?: string;
  labelKey?: string;
  valueKey?: string;
}

export interface Dashboard {
  id: string;
  name: string;
}

export interface DashboardData extends Dashboard {
  createdBy: string;
  createdByName: string;
  createdByEmail: string;
  dataSources: number;
  createdOn: string;
  lastRefreshed: string;
  widgets?: WidgetData[];
}
