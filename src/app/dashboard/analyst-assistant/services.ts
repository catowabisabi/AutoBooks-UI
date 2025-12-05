import { api } from '@/lib/api';

export interface AnalystQueryPayload {
  query: string;
}

export interface RechartsResponse {
  type: 'bar' | 'scatter' | 'line' | 'pie' | 'table' | 'text' | 'invalid';
  title?: string;
  data?: any[];
  xKey?: string;
  yKey?: string;
  labelKey?: string;
  valueKey?: string;
  message?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

export async function sendAnalystQuery(
  payload: AnalystQueryPayload
): Promise<RechartsResponse> {
  try {
    // 嘗試使用後端 API
    const response = await fetch(
      `${API_BASE_URL}/api/v1/analyst-assistant/query/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('access_token') || ''}`
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

export async function startAnalystAssistant(): Promise<{ status: string; message?: string; rows?: Record<string, number> }> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/analyst-assistant/start/`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('access_token') || ''}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to start analyst assistant');
    }

    return response.json();
  } catch (error) {
    console.error('Error starting analyst assistant:', error);
    throw error;
  }
}
