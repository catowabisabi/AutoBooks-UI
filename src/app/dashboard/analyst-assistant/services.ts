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

export async function sendAnalystQuery(
  payload: AnalystQueryPayload
): Promise<RechartsResponse> {
  try {
    const response = await fetch(
      'http://127.0.0.1:8000/analyst-assistant/query',
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
