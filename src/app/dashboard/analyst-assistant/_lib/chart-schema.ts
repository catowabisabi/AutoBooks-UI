/**
 * Chart Configuration Schema
 * Defines JSON structure for all supported chart types in the Analyst Assistant
 */

// ============================================================================
// CHART TYPES
// ============================================================================

export type ChartType = 'bar' | 'line' | 'area' | 'pie' | 'scatter' | 'table';

// ============================================================================
// BASE INTERFACES
// ============================================================================

/**
 * Base configuration for all chart types
 */
export interface BaseChartConfig {
  type: ChartType;
  title: string;
  titleKey?: string; // i18n key for title
  description?: string;
  descriptionKey?: string; // i18n key for description
  data: Record<string, unknown>[];
  colors?: string[];
}

/**
 * Configuration for axis-based charts (bar, line, area, scatter)
 */
export interface AxisChartConfig extends BaseChartConfig {
  type: 'bar' | 'line' | 'area' | 'scatter';
  xKey: string;
  xLabel?: string;
  xLabelKey?: string; // i18n key
  yKey: string | string[]; // Support multiple series
  yLabel?: string;
  yLabelKey?: string; // i18n key
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
}

/**
 * Configuration for pie charts
 */
export interface PieChartConfig extends BaseChartConfig {
  type: 'pie';
  labelKey: string;
  valueKey: string;
  showLabel?: boolean;
  showLegend?: boolean;
  innerRadius?: number; // For donut charts
  outerRadius?: number;
}

/**
 * Configuration for table display
 */
export interface TableChartConfig extends BaseChartConfig {
  type: 'table';
  columns?: TableColumnConfig[];
  maxRows?: number;
  sortable?: boolean;
  filterable?: boolean;
}

export interface TableColumnConfig {
  key: string;
  label?: string;
  labelKey?: string; // i18n key
  width?: number;
  align?: 'left' | 'center' | 'right';
  format?: 'text' | 'number' | 'currency' | 'percent' | 'date';
  currencyCode?: string; // For currency format
}

// ============================================================================
// UNION TYPE
// ============================================================================

export type ChartConfig = AxisChartConfig | PieChartConfig | TableChartConfig;

// ============================================================================
// CHART SCHEMA DEFINITIONS
// ============================================================================

/**
 * JSON Schema for chart configurations
 * Used for validation and API documentation
 */
export const chartSchemaDefinitions = {
  barChart: {
    type: 'object',
    required: ['type', 'title', 'data', 'xKey', 'yKey'],
    properties: {
      type: { const: 'bar', description: 'Bar chart type' },
      title: { type: 'string', description: 'Chart title' },
      titleKey: { type: 'string', description: 'i18n key for title' },
      description: { type: 'string', description: 'Chart description' },
      descriptionKey: { type: 'string', description: 'i18n key for description' },
      data: {
        type: 'array',
        items: { type: 'object' },
        description: 'Array of data objects'
      },
      xKey: { type: 'string', description: 'Property name for X axis values' },
      xLabel: { type: 'string', description: 'X axis label' },
      xLabelKey: { type: 'string', description: 'i18n key for X axis label' },
      yKey: {
        oneOf: [
          { type: 'string' },
          { type: 'array', items: { type: 'string' } }
        ],
        description: 'Property name(s) for Y axis values'
      },
      yLabel: { type: 'string', description: 'Y axis label' },
      yLabelKey: { type: 'string', description: 'i18n key for Y axis label' },
      showGrid: { type: 'boolean', default: true },
      showLegend: { type: 'boolean', default: true },
      showTooltip: { type: 'boolean', default: true },
      colors: { type: 'array', items: { type: 'string' } }
    }
  },
  
  lineChart: {
    type: 'object',
    required: ['type', 'title', 'data', 'xKey', 'yKey'],
    properties: {
      type: { const: 'line', description: 'Line chart type' },
      title: { type: 'string', description: 'Chart title' },
      titleKey: { type: 'string', description: 'i18n key for title' },
      description: { type: 'string', description: 'Chart description' },
      descriptionKey: { type: 'string', description: 'i18n key for description' },
      data: {
        type: 'array',
        items: { type: 'object' },
        description: 'Array of data objects'
      },
      xKey: { type: 'string', description: 'Property name for X axis values' },
      xLabel: { type: 'string', description: 'X axis label' },
      yKey: {
        oneOf: [
          { type: 'string' },
          { type: 'array', items: { type: 'string' } }
        ],
        description: 'Property name(s) for Y axis values'
      },
      yLabel: { type: 'string', description: 'Y axis label' },
      showGrid: { type: 'boolean', default: true },
      showLegend: { type: 'boolean', default: true },
      showTooltip: { type: 'boolean', default: true },
      colors: { type: 'array', items: { type: 'string' } }
    }
  },
  
  areaChart: {
    type: 'object',
    required: ['type', 'title', 'data', 'xKey', 'yKey'],
    properties: {
      type: { const: 'area', description: 'Area chart type' },
      title: { type: 'string', description: 'Chart title' },
      titleKey: { type: 'string', description: 'i18n key for title' },
      description: { type: 'string', description: 'Chart description' },
      descriptionKey: { type: 'string', description: 'i18n key for description' },
      data: {
        type: 'array',
        items: { type: 'object' },
        description: 'Array of data objects'
      },
      xKey: { type: 'string', description: 'Property name for X axis values' },
      xLabel: { type: 'string', description: 'X axis label' },
      yKey: {
        oneOf: [
          { type: 'string' },
          { type: 'array', items: { type: 'string' } }
        ],
        description: 'Property name(s) for Y axis values'
      },
      yLabel: { type: 'string', description: 'Y axis label' },
      showGrid: { type: 'boolean', default: true },
      showLegend: { type: 'boolean', default: true },
      showTooltip: { type: 'boolean', default: true },
      colors: { type: 'array', items: { type: 'string' } }
    }
  },
  
  scatterChart: {
    type: 'object',
    required: ['type', 'title', 'data', 'xKey', 'yKey'],
    properties: {
      type: { const: 'scatter', description: 'Scatter plot type' },
      title: { type: 'string', description: 'Chart title' },
      titleKey: { type: 'string', description: 'i18n key for title' },
      description: { type: 'string', description: 'Chart description' },
      descriptionKey: { type: 'string', description: 'i18n key for description' },
      data: {
        type: 'array',
        items: { type: 'object' },
        description: 'Array of data objects'
      },
      xKey: { type: 'string', description: 'Property name for X axis values' },
      xLabel: { type: 'string', description: 'X axis label' },
      yKey: { type: 'string', description: 'Property name for Y axis values' },
      yLabel: { type: 'string', description: 'Y axis label' },
      showGrid: { type: 'boolean', default: true },
      showLegend: { type: 'boolean', default: true },
      showTooltip: { type: 'boolean', default: true },
      colors: { type: 'array', items: { type: 'string' } }
    }
  },
  
  pieChart: {
    type: 'object',
    required: ['type', 'title', 'data', 'labelKey', 'valueKey'],
    properties: {
      type: { const: 'pie', description: 'Pie chart type' },
      title: { type: 'string', description: 'Chart title' },
      titleKey: { type: 'string', description: 'i18n key for title' },
      description: { type: 'string', description: 'Chart description' },
      descriptionKey: { type: 'string', description: 'i18n key for description' },
      data: {
        type: 'array',
        items: { type: 'object' },
        description: 'Array of data objects with label and value'
      },
      labelKey: { type: 'string', description: 'Property name for labels' },
      valueKey: { type: 'string', description: 'Property name for values' },
      showLabel: { type: 'boolean', default: true },
      showLegend: { type: 'boolean', default: true },
      innerRadius: { type: 'number', default: 0, description: 'For donut charts' },
      outerRadius: { type: 'number', default: 70 },
      colors: { type: 'array', items: { type: 'string' } }
    }
  },
  
  tableChart: {
    type: 'object',
    required: ['type', 'title', 'data'],
    properties: {
      type: { const: 'table', description: 'Table display type' },
      title: { type: 'string', description: 'Table title' },
      titleKey: { type: 'string', description: 'i18n key for title' },
      description: { type: 'string', description: 'Table description' },
      descriptionKey: { type: 'string', description: 'i18n key for description' },
      data: {
        type: 'array',
        items: { type: 'object' },
        description: 'Array of row objects'
      },
      columns: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            key: { type: 'string' },
            label: { type: 'string' },
            labelKey: { type: 'string' },
            width: { type: 'number' },
            align: { enum: ['left', 'center', 'right'] },
            format: { enum: ['text', 'number', 'currency', 'percent', 'date'] },
            currencyCode: { type: 'string' }
          },
          required: ['key']
        }
      },
      maxRows: { type: 'number', default: 20 },
      sortable: { type: 'boolean', default: false },
      filterable: { type: 'boolean', default: false }
    }
  }
};

// ============================================================================
// EXAMPLE DATA
// ============================================================================

export const chartExamples: Record<ChartType, ChartConfig> = {
  bar: {
    type: 'bar',
    title: 'Monthly Sales',
    titleKey: 'charts.monthlySales.title',
    description: 'Sales data for the current year',
    descriptionKey: 'charts.monthlySales.description',
    data: [
      { month: 'Jan', sales: 4000 },
      { month: 'Feb', sales: 3000 },
      { month: 'Mar', sales: 5000 },
      { month: 'Apr', sales: 4500 },
      { month: 'May', sales: 6000 },
      { month: 'Jun', sales: 5500 }
    ],
    xKey: 'month',
    xLabel: 'Month',
    xLabelKey: 'charts.labels.month',
    yKey: 'sales',
    yLabel: 'Sales ($)',
    yLabelKey: 'charts.labels.sales',
    showGrid: true,
    showLegend: true,
    showTooltip: true
  },
  
  line: {
    type: 'line',
    title: 'Revenue Trend',
    titleKey: 'charts.revenueTrend.title',
    description: 'Revenue over time',
    descriptionKey: 'charts.revenueTrend.description',
    data: [
      { date: 'Week 1', revenue: 12000 },
      { date: 'Week 2', revenue: 15000 },
      { date: 'Week 3', revenue: 13500 },
      { date: 'Week 4', revenue: 18000 }
    ],
    xKey: 'date',
    xLabel: 'Date',
    yKey: 'revenue',
    yLabel: 'Revenue ($)',
    showGrid: true,
    showLegend: true,
    showTooltip: true
  },
  
  area: {
    type: 'area',
    title: 'Website Traffic',
    titleKey: 'charts.websiteTraffic.title',
    description: 'Daily visitors',
    data: [
      { day: 'Mon', visitors: 1200 },
      { day: 'Tue', visitors: 1500 },
      { day: 'Wed', visitors: 1800 },
      { day: 'Thu', visitors: 1400 },
      { day: 'Fri', visitors: 2000 }
    ],
    xKey: 'day',
    xLabel: 'Day',
    yKey: 'visitors',
    yLabel: 'Visitors',
    showGrid: true,
    showLegend: true,
    showTooltip: true
  },
  
  scatter: {
    type: 'scatter',
    title: 'Price vs Sales',
    titleKey: 'charts.priceVsSales.title',
    description: 'Correlation between price and sales volume',
    data: [
      { price: 10, sales: 100 },
      { price: 20, sales: 85 },
      { price: 30, sales: 70 },
      { price: 40, sales: 55 },
      { price: 50, sales: 45 }
    ],
    xKey: 'price',
    xLabel: 'Price ($)',
    yKey: 'sales',
    yLabel: 'Sales (units)',
    showGrid: true,
    showTooltip: true
  },
  
  pie: {
    type: 'pie',
    title: 'Sales by Category',
    titleKey: 'charts.salesByCategory.title',
    description: 'Distribution of sales across product categories',
    descriptionKey: 'charts.salesByCategory.description',
    data: [
      { category: 'Electronics', value: 4500 },
      { category: 'Clothing', value: 2800 },
      { category: 'Food', value: 1900 },
      { category: 'Books', value: 1200 },
      { category: 'Other', value: 800 }
    ],
    labelKey: 'category',
    valueKey: 'value',
    showLabel: true,
    showLegend: true
  },
  
  table: {
    type: 'table',
    title: 'Top Products',
    titleKey: 'charts.topProducts.title',
    description: 'Best selling products this month',
    data: [
      { rank: 1, product: 'Laptop Pro', sales: 150, revenue: 225000 },
      { rank: 2, product: 'Wireless Mouse', sales: 320, revenue: 12800 },
      { rank: 3, product: 'USB-C Cable', sales: 500, revenue: 7500 }
    ],
    columns: [
      { key: 'rank', label: 'Rank', labelKey: 'charts.columns.rank', align: 'center' },
      { key: 'product', label: 'Product', labelKey: 'charts.columns.product', align: 'left' },
      { key: 'sales', label: 'Units Sold', labelKey: 'charts.columns.unitsSold', align: 'right', format: 'number' },
      { key: 'revenue', label: 'Revenue', labelKey: 'charts.columns.revenue', align: 'right', format: 'currency', currencyCode: 'USD' }
    ],
    maxRows: 10,
    sortable: true
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Validate if a chart configuration is valid
 */
export function validateChartConfig(config: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!config || typeof config !== 'object') {
    return { valid: false, errors: ['Invalid configuration object'] };
  }
  
  const cfg = config as Record<string, unknown>;
  
  // Check required base fields
  if (!cfg.type || typeof cfg.type !== 'string') {
    errors.push('Missing or invalid "type" field');
  }
  
  if (!cfg.title || typeof cfg.title !== 'string') {
    errors.push('Missing or invalid "title" field');
  }
  
  if (!Array.isArray(cfg.data)) {
    errors.push('Missing or invalid "data" field - must be an array');
  }
  
  // Type-specific validation
  const chartType = cfg.type as ChartType;
  
  if (['bar', 'line', 'area', 'scatter'].includes(chartType)) {
    if (!cfg.xKey || typeof cfg.xKey !== 'string') {
      errors.push(`Missing "xKey" for ${chartType} chart`);
    }
    if (!cfg.yKey) {
      errors.push(`Missing "yKey" for ${chartType} chart`);
    }
  }
  
  if (chartType === 'pie') {
    if (!cfg.labelKey || typeof cfg.labelKey !== 'string') {
      errors.push('Missing "labelKey" for pie chart');
    }
    if (!cfg.valueKey || typeof cfg.valueKey !== 'string') {
      errors.push('Missing "valueKey" for pie chart');
    }
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Convert legacy chart format to new schema format
 */
export function convertLegacyChart(legacy: {
  type: ChartType;
  title: string;
  description?: string;
  data: any[];
  xKey?: string;
  yKey?: string;
  labelKey?: string;
  valueKey?: string;
}): ChartConfig {
  if (legacy.type === 'pie') {
    return {
      type: 'pie',
      title: legacy.title,
      description: legacy.description,
      data: legacy.data,
      labelKey: legacy.labelKey || 'label',
      valueKey: legacy.valueKey || 'value'
    };
  }
  
  if (legacy.type === 'table') {
    return {
      type: 'table',
      title: legacy.title,
      description: legacy.description,
      data: legacy.data
    };
  }
  
  return {
    type: legacy.type,
    title: legacy.title,
    description: legacy.description,
    data: legacy.data,
    xKey: legacy.xKey || 'x',
    yKey: legacy.yKey || 'y'
  } as AxisChartConfig;
}

/**
 * Get default configuration for a chart type
 */
export function getDefaultChartConfig(type: ChartType): Partial<ChartConfig> {
  const base = {
    title: '',
    description: '',
    data: [],
    colors: ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F', '#FFBB28', '#0088FE']
  };
  
  switch (type) {
    case 'bar':
    case 'line':
    case 'area':
      return {
        ...base,
        type,
        xKey: '',
        yKey: '',
        showGrid: true,
        showLegend: true,
        showTooltip: true
      };
    case 'scatter':
      return {
        ...base,
        type,
        xKey: '',
        yKey: '',
        showGrid: true,
        showLegend: true,
        showTooltip: true
      };
    case 'pie':
      return {
        ...base,
        type,
        labelKey: '',
        valueKey: '',
        showLabel: true,
        showLegend: true,
        innerRadius: 0,
        outerRadius: 70
      };
    case 'table':
      return {
        ...base,
        type,
        maxRows: 20,
        sortable: false,
        filterable: false
      };
  }
}
