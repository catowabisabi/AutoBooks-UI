import { api } from '@/lib/api';

export interface AnalystQueryPayload {
  query: string;
}

export interface RechartsResponse {
  type: 'bar' | 'scatter' | 'line' | 'pie' | 'table' | 'text' | 'invalid' | 'area';
  title?: string;
  data?: any[];
  xKey?: string;
  yKey?: string;
  labelKey?: string;
  valueKey?: string;
  message?: string;
}

// ============================================================================
// DATA SIDEBAR INTERFACES
// ============================================================================

export interface Customer {
  id: string;
  name: string;
  email: string;
  company?: string;
  totalOrders: number;
  totalSpent: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  date: string;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
}

export interface Category {
  id: string;
  name: string;
  productCount: number;
  totalRevenue: number;
}

// ============================================================================
// DOCUMENT/RAG INTERFACES
// ============================================================================

export interface Document {
  id: string;
  original_filename: string;
  file: string;
  uploaded_at: string;
  processed: boolean;
  ocr_text?: string;
  extracted_data?: any;
  translated_text?: string;
  language: string;
}

export interface VisualizationSuggestion {
  type: string;
  title: string;
  xKey?: string;
  yKey?: string;
  labelKey?: string;
  valueKey?: string;
  confidence: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

// Demo data for offline/demo mode / 離線/演示模式的示範數據
const DEMO_SALES_DATA = [
  { month: 'Jan', month_name: 'January', revenue: 45000, quantity: 120, product: 'Product A', customer: 'Tech Corp', category: 'Electronics' },
  { month: 'Feb', month_name: 'February', revenue: 52000, quantity: 145, product: 'Product B', customer: 'Global Inc', category: 'Software' },
  { month: 'Mar', month_name: 'March', revenue: 48000, quantity: 132, product: 'Product C', customer: 'Smart Solutions', category: 'Electronics' },
  { month: 'Apr', month_name: 'April', revenue: 61000, quantity: 168, product: 'Product A', customer: 'Tech Corp', category: 'Electronics' },
  { month: 'May', month_name: 'May', revenue: 55000, quantity: 155, product: 'Product D', customer: 'Data Systems', category: 'Hardware' },
  { month: 'Jun', month_name: 'June', revenue: 67000, quantity: 189, product: 'Product B', customer: 'Global Inc', category: 'Software' },
  { month: 'Jul', month_name: 'July', revenue: 72000, quantity: 198, product: 'Product E', customer: 'Cloud Nine', category: 'Services' },
  { month: 'Aug', month_name: 'August', revenue: 69000, quantity: 185, product: 'Product A', customer: 'Tech Corp', category: 'Electronics' },
  { month: 'Sep', month_name: 'September', revenue: 78000, quantity: 212, product: 'Product C', customer: 'Smart Solutions', category: 'Electronics' },
  { month: 'Oct', month_name: 'October', revenue: 82000, quantity: 225, product: 'Product F', customer: 'Alpha Corp', category: 'Software' },
  { month: 'Nov', month_name: 'November', revenue: 91000, quantity: 248, product: 'Product B', customer: 'Global Inc', category: 'Software' },
  { month: 'Dec', month_name: 'December', revenue: 98000, quantity: 268, product: 'Product A', customer: 'Tech Corp', category: 'Electronics' },
];

const DEMO_PRODUCT_DATA = [
  { product: 'Product A', revenue: 285000, quantity: 771, category: 'Electronics' },
  { product: 'Product B', revenue: 200000, quantity: 582, category: 'Software' },
  { product: 'Product C', revenue: 126000, quantity: 344, category: 'Electronics' },
  { product: 'Product D', revenue: 55000, quantity: 155, category: 'Hardware' },
  { product: 'Product E', revenue: 72000, quantity: 198, category: 'Services' },
  { product: 'Product F', revenue: 82000, quantity: 225, category: 'Software' },
];

const DEMO_CUSTOMER_DATA = [
  { customer: 'Tech Corp', revenue: 399000, orders: 4 },
  { customer: 'Global Inc', revenue: 210000, orders: 3 },
  { customer: 'Smart Solutions', revenue: 126000, orders: 2 },
  { customer: 'Data Systems', revenue: 55000, orders: 1 },
  { customer: 'Cloud Nine', revenue: 72000, orders: 1 },
  { customer: 'Alpha Corp', revenue: 82000, orders: 1 },
];

const DEMO_CATEGORY_DATA = [
  { category: 'Electronics', revenue: 411000, percentage: 43.5 },
  { category: 'Software', revenue: 282000, percentage: 29.9 },
  { category: 'Services', revenue: 72000, percentage: 7.6 },
  { category: 'Hardware', revenue: 55000, percentage: 5.8 },
];

// Flag to track if we're in demo mode
let isDemoMode = false;

// Helper function to process demo queries locally / 本地處理演示查詢的輔助函數
function processDemoQuery(query: string): RechartsResponse {
  const q = query.toLowerCase();
  
  // Monthly sales trends / 每月銷售趨勢
  if (q.includes('monthly') || q.includes('month') || q.includes('trend') || q.includes('每月') || q.includes('趨勢')) {
    return {
      type: 'line',
      title: 'Monthly Sales Trend / 每月銷售趨勢',
      data: DEMO_SALES_DATA.map(d => ({ name: d.month_name, revenue: d.revenue, quantity: d.quantity })),
      xKey: 'name',
      yKey: 'revenue',
      message: 'Showing monthly sales trends for the year (Demo Data) / 顯示全年每月銷售趨勢（演示數據）'
    };
  }
  
  // Top products / 熱門產品
  if (q.includes('top') && (q.includes('product') || q.includes('產品'))) {
    return {
      type: 'bar',
      title: 'Top Products by Revenue / 營收最高產品',
      data: DEMO_PRODUCT_DATA.sort((a, b) => b.revenue - a.revenue),
      xKey: 'product',
      yKey: 'revenue',
      message: 'Showing top products by revenue (Demo Data) / 顯示營收最高的產品（演示數據）'
    };
  }
  
  // Customer analysis / 客戶分析
  if (q.includes('customer') || q.includes('客戶') || q.includes('client')) {
    return {
      type: 'bar',
      title: 'Revenue by Customer / 各客戶營收',
      data: DEMO_CUSTOMER_DATA.sort((a, b) => b.revenue - a.revenue),
      xKey: 'customer',
      yKey: 'revenue',
      message: 'Showing revenue by customer (Demo Data) / 顯示各客戶營收（演示數據）'
    };
  }
  
  // Category / pie chart / 類別 / 圓餅圖
  if (q.includes('category') || q.includes('pie') || q.includes('類別') || q.includes('圓餅') || q.includes('distribution') || q.includes('分佈')) {
    return {
      type: 'pie',
      title: 'Sales by Category / 各類別銷售',
      data: DEMO_CATEGORY_DATA,
      labelKey: 'category',
      valueKey: 'revenue',
      message: 'Showing sales distribution by category (Demo Data) / 顯示各類別銷售分佈（演示數據）'
    };
  }
  
  // Quarterly / 季度
  if (q.includes('quarter') || q.includes('季度')) {
    const quarterlyData = [
      { quarter: 'Q1', revenue: 145000 },
      { quarter: 'Q2', revenue: 183000 },
      { quarter: 'Q3', revenue: 219000 },
      { quarter: 'Q4', revenue: 271000 },
    ];
    return {
      type: 'bar',
      title: 'Quarterly Revenue / 季度營收',
      data: quarterlyData,
      xKey: 'quarter',
      yKey: 'revenue',
      message: 'Showing quarterly revenue comparison (Demo Data) / 顯示季度營收比較（演示數據）'
    };
  }
  
  // Total revenue / 總營收
  if (q.includes('total') || q.includes('revenue') || q.includes('總') || q.includes('營收')) {
    const total = DEMO_SALES_DATA.reduce((sum, d) => sum + d.revenue, 0);
    return {
      type: 'text',
      title: 'Total Revenue / 總營收',
      message: `Total Revenue: $${total.toLocaleString()} (Demo Data)\n總營收：$${total.toLocaleString()}（演示數據）`,
      data: [{ label: 'Total Revenue', value: total }]
    };
  }
  
  // Table / data view / 表格
  if (q.includes('table') || q.includes('data') || q.includes('表格') || q.includes('數據')) {
    return {
      type: 'table',
      title: 'Sales Data / 銷售數據',
      data: DEMO_SALES_DATA,
      message: 'Showing sales data table (Demo Data) / 顯示銷售數據表格（演示數據）'
    };
  }
  
  // Default - show monthly bar chart
  return {
    type: 'bar',
    title: 'Sales Overview / 銷售概覽',
    data: DEMO_SALES_DATA.map(d => ({ name: d.month, revenue: d.revenue })),
    xKey: 'name',
    yKey: 'revenue',
    message: `Here's a sales overview based on your query: "${query}" (Demo Data)\n以下是根據您的查詢的銷售概覽：「${query}」（演示數據）`
  };
}

export async function sendAnalystQuery(
  payload: AnalystQueryPayload
): Promise<RechartsResponse> {
  // If in demo mode, process locally / 如果處於演示模式，本地處理
  if (isDemoMode) {
    return processDemoQuery(payload.query);
  }
  
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
    console.error('Error sending analyst query, falling back to demo mode:', error);
    // Fall back to demo mode for this query / 回退到演示模式
    return processDemoQuery(payload.query);
  }
}

export async function startAnalystAssistant(): Promise<{ status: string; message?: string; rows?: Record<string, number>; isDemo?: boolean }> {
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

    isDemoMode = false;
    return response.json();
  } catch (error) {
    console.error('Error starting analyst assistant, using demo mode:', error);
    // Return demo data info / 返回演示數據信息
    isDemoMode = true;
    return {
      status: 'demo',
      message: 'Using demo data (backend unavailable) / 使用演示數據（後端不可用）',
      rows: {
        sales_data: DEMO_SALES_DATA.length,
        products: DEMO_PRODUCT_DATA.length,
        customers: DEMO_CUSTOMER_DATA.length
      },
      isDemo: true
    };
  }
}

// ============================================================================
// DATA STATUS API
// ============================================================================

export interface DataStatusResponse {
  dataSource: 'database' | 'csv_fallback' | 'no_data';
  hasDbData: boolean;
  dbStats: Record<string, number>;
  cacheStats: Record<string, { rows: number; columns: string[] }>;
  message: string;
  availableColumns: string[];
  recommendations: string[];
}

/**
 * Get the status of data loaded in the analyst assistant.
 * Shows whether using DB data, CSV fallback, or no data.
 */
export async function getDataStatus(): Promise<DataStatusResponse> {
  try {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token') || '';
    const response = await fetch(`${API_BASE_URL}/api/v1/analyst-assistant/status/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });

    if (!response.ok) {
      console.warn('[DataStatus] API returned non-OK status:', response.status);
      return {
        dataSource: 'no_data',
        hasDbData: false,
        dbStats: {},
        cacheStats: {},
        message: 'Unable to check data status',
        availableColumns: [],
        recommendations: ['Backend may be unavailable'],
      };
    }

    return response.json();
  } catch (error) {
    console.error('[DataStatus] Error fetching data status:', error);
    return {
      dataSource: 'no_data',
      hasDbData: false,
      dbStats: {},
      cacheStats: {},
      message: 'Error checking data status',
      availableColumns: [],
      recommendations: ['Check backend connection'],
    };
  }
}

// ============================================================================
// DATA SIDEBAR API FUNCTIONS
// ============================================================================

export async function fetchCustomers(): Promise<Customer[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/accounting/contacts/?contact_type=CUSTOMER`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('access_token') || ''}`
        }
      }
    );
    
    if (!response.ok) {
      console.warn('Customers API returned non-OK status:', response.status);
      return [];
    }
    
    const data = await response.json();
    const contacts = data.results || data || [];
    if (!Array.isArray(contacts)) return [];
    
    return contacts.map((contact: any) => ({
      id: contact.id,
      name: contact.contact_name || contact.company_name,
      email: contact.email || '',
      company: contact.company_name,
      totalOrders: contact.total_invoices || 0,
      totalSpent: parseFloat(contact.total_spent || '0')
    }));
  } catch (error) {
    console.warn('Error fetching customers (using demo data):', error);
    return [];
  }
}

export async function fetchProducts(): Promise<Product[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/coredata/items/?item_type=PRODUCT`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('access_token') || ''}`
        }
      }
    );
    
    if (!response.ok) {
      console.warn('Products API returned non-OK status:', response.status);
      return [];
    }
    
    const data = await response.json();
    const items = data.results || data || [];
    if (!Array.isArray(items)) return [];
    
    return items.map((item: any) => ({
      id: item.id,
      name: item.name,
      sku: item.sku || item.code || '',
      category: item.category?.name || item.category || 'Uncategorized',
      price: parseFloat(item.sale_price || item.price || '0'),
      stock: item.quantity_on_hand || 0
    }));
  } catch (error) {
    console.warn('Error fetching products (using demo data):', error);
    return [];
  }
}

export async function fetchOrders(): Promise<Order[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/accounting/invoices/?invoice_type=SALES&ordering=-issue_date`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('access_token') || ''}`
        }
      }
    );
    
    if (!response.ok) {
      console.warn('Orders API returned non-OK status:', response.status);
      return [];
    }
    
    const data = await response.json();
    const invoices = data.results || data || [];
    if (!Array.isArray(invoices)) return [];
    
    return invoices.map((invoice: any) => ({
      id: invoice.id,
      orderNumber: invoice.invoice_number,
      customerName: invoice.contact?.company_name || invoice.contact?.contact_name || 'Unknown',
      date: invoice.issue_date,
      total: parseFloat(invoice.total || '0'),
      status: mapInvoiceStatus(invoice.status)
    }));
  } catch (error) {
    console.warn('Error fetching orders (using demo data):', error);
    return [];
  }
}

function mapInvoiceStatus(status: string): Order['status'] {
  const statusMap: Record<string, Order['status']> = {
    'DRAFT': 'pending',
    'SENT': 'processing',
    'VIEWED': 'processing',
    'PAID': 'completed',
    'PARTIALLY_PAID': 'processing',
    'OVERDUE': 'pending',
    'VOID': 'cancelled',
    'CANCELLED': 'cancelled'
  };
  return statusMap[status] || 'pending';
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/coredata/categories/`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('access_token') || ''}`
        }
      }
    );
    
    if (!response.ok) {
      console.warn('Categories API returned non-OK status:', response.status);
      return [];
    }
    
    const data = await response.json();
    const categories = data.results || data || [];
    if (!Array.isArray(categories)) return [];
    
    return categories.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      productCount: cat.item_count || 0,
      totalRevenue: parseFloat(cat.total_revenue || '0')
    }));
  } catch (error) {
    console.warn('Error fetching categories (using demo data):', error);
    return [];
  }
}

// ============================================================================
// DOCUMENT/RAG API FUNCTIONS
// ============================================================================

export async function fetchDocuments(): Promise<Document[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/documents/`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('access_token') || ''}`
        }
      }
    );
    
    if (!response.ok) throw new Error('Failed to fetch documents');
    
    const data = await response.json();
    return (data.results || data);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
}

export async function uploadDocument(file: File): Promise<{ id: string; filename: string }> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(
    `${API_BASE_URL}/api/v1/documents/upload/`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('access_token') || ''}`
      },
      body: formData
    }
  );
  
  if (!response.ok) throw new Error('Failed to upload document');
  
  return response.json();
}

export async function getDocumentVisualization(documentId: string): Promise<{
  data: any[];
  suggestions: VisualizationSuggestion[];
}> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/ai-assistants/visualization/document/${documentId}/`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('access_token') || ''}`
        }
      }
    );
    
    if (!response.ok) throw new Error('Failed to get visualization');
    
    const data = await response.json();
    return {
      data: data.data || [],
      suggestions: data.suggested_charts || []
    };
  } catch (error) {
    console.error('Error getting visualization:', error);
    return { data: [], suggestions: [] };
  }
}

// ============================================================================
// VISUALIZATION API FUNCTIONS
// ============================================================================

export async function generateChart(
  data: any[],
  chartType: string,
  options?: {
    title?: string;
    xKey?: string;
    yKey?: string;
    labelKey?: string;
    valueKey?: string;
  }
): Promise<RechartsResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/ai-assistants/visualization/generate/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('access_token') || ''}`
        },
        body: JSON.stringify({
          data,
          type: chartType,
          ...options
        })
      }
    );
    
    if (!response.ok) throw new Error('Failed to generate chart');
    
    return response.json();
  } catch (error) {
    console.error('Error generating chart:', error);
    throw error;
  }
}

export async function generateChartWithAI(
  data: any[],
  prompt: string,
  language: string = 'en'
): Promise<RechartsResponse> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/ai-assistants/visualization/generate-ai/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('access_token') || ''}`
        },
        body: JSON.stringify({ data, prompt, language })
      }
    );
    
    if (!response.ok) throw new Error('Failed to generate chart with AI');
    
    return response.json();
  } catch (error) {
    console.error('Error generating chart with AI:', error);
    throw error;
  }
}

export async function uploadFileForVisualization(file: File): Promise<{
  data: any[];
  analysis: any;
  suggestions: VisualizationSuggestion[];
}> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(
    `${API_BASE_URL}/api/v1/ai-assistants/visualization/upload/`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('access_token') || ''}`
      },
      body: formData
    }
  );
  
  if (!response.ok) throw new Error('Failed to upload file for visualization');
  
  const result = await response.json();
  return {
    data: result.data || [],
    analysis: result.analysis || {},
    suggestions: result.suggested_charts || []
  };
}

export async function generateDashboardCharts(data: any[], maxCharts: number = 4): Promise<RechartsResponse[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/ai-assistants/visualization/dashboard/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('access_token') || ''}`
        },
        body: JSON.stringify({ data, max_charts: maxCharts })
      }
    );
    
    if (!response.ok) throw new Error('Failed to generate dashboard charts');
    
    const result = await response.json();
    return result.charts || [];
  } catch (error) {
    console.error('Error generating dashboard charts:', error);
    return [];
  }
}
