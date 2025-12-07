'use client';

/**
 * Chart Export Utilities
 * 提供圖表匯出為 PNG 圖片和 CSV 數據的功能
 */

// PNG Export using html2canvas
export async function exportChartAsPNG(
  chartElement: HTMLElement | null,
  filename: string = 'chart'
): Promise<boolean> {
  if (!chartElement) {
    console.error('[Export] No chart element provided');
    return false;
  }

  try {
    const html2canvas = (await import('html2canvas')).default;
    
    // Create canvas from the chart element
    const canvas = await html2canvas(chartElement, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher resolution
      logging: false,
      useCORS: true,
    });

    // Create download link
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    link.download = `${sanitizeFilename(filename)}-${timestamp}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    return true;
  } catch (error) {
    console.error('[Export] Failed to export PNG:', error);
    return false;
  }
}

// CSV Export
export function exportDataAsCSV(
  data: any[],
  filename: string = 'data',
  options?: {
    includeHeaders?: boolean;
    delimiter?: string;
  }
): boolean {
  if (!data || data.length === 0) {
    console.error('[Export] No data provided for CSV export');
    return false;
  }

  const { includeHeaders = true, delimiter = ',' } = options || {};

  try {
    // Get headers from first object
    const headers = Object.keys(data[0]);
    
    // Build CSV content
    const csvRows: string[] = [];
    
    // Add headers row
    if (includeHeaders) {
      csvRows.push(headers.map(h => escapeCSVValue(h)).join(delimiter));
    }
    
    // Add data rows
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        return escapeCSVValue(formatCSVValue(value));
      });
      csvRows.push(values.join(delimiter));
    }
    
    const csvContent = csvRows.join('\n');
    
    // Create blob and download
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel UTF-8 support
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `${sanitizeFilename(filename)}-${timestamp}.csv`;
    link.click();
    
    // Cleanup
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('[Export] Failed to export CSV:', error);
    return false;
  }
}

// Excel Export (XLSX format using basic CSV with Excel mime type)
export function exportDataAsExcel(
  data: any[],
  filename: string = 'data'
): boolean {
  if (!data || data.length === 0) {
    console.error('[Export] No data provided for Excel export');
    return false;
  }

  try {
    // Get headers from first object
    const headers = Object.keys(data[0]);
    
    // Build tab-separated content (better Excel compatibility)
    const rows: string[] = [];
    
    // Add headers row
    rows.push(headers.join('\t'));
    
    // Add data rows
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        return formatCSVValue(value);
      });
      rows.push(values.join('\t'));
    }
    
    const content = rows.join('\n');
    
    // Create blob with Excel mime type
    const blob = new Blob(['\ufeff' + content], { 
      type: 'application/vnd.ms-excel;charset=utf-8;' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `${sanitizeFilename(filename)}-${timestamp}.xls`;
    link.click();
    
    // Cleanup
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('[Export] Failed to export Excel:', error);
    return false;
  }
}

// JSON Export
export function exportDataAsJSON(
  data: any[],
  filename: string = 'data'
): boolean {
  if (!data || data.length === 0) {
    console.error('[Export] No data provided for JSON export');
    return false;
  }

  try {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `${sanitizeFilename(filename)}-${timestamp}.json`;
    link.click();
    
    // Cleanup
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('[Export] Failed to export JSON:', error);
    return false;
  }
}

// Helper: Escape CSV value
function escapeCSVValue(value: string): string {
  // If value contains comma, newline, or quote, wrap in quotes and escape internal quotes
  if (value.includes(',') || value.includes('\n') || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// Helper: Format value for CSV
function formatCSVValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

// Helper: Sanitize filename
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '-')
    .substring(0, 100);
}

// Copy data to clipboard as formatted table
export async function copyDataToClipboard(data: any[]): Promise<boolean> {
  if (!data || data.length === 0) {
    console.error('[Export] No data provided for clipboard');
    return false;
  }

  try {
    const headers = Object.keys(data[0]);
    const rows = [
      headers.join('\t'),
      ...data.map(row => headers.map(h => formatCSVValue(row[h])).join('\t'))
    ];
    
    await navigator.clipboard.writeText(rows.join('\n'));
    return true;
  } catch (error) {
    console.error('[Export] Failed to copy to clipboard:', error);
    return false;
  }
}
