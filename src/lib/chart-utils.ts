/**
 * Chart Export Utilities
 * Handles exporting charts to PNG/SVG and copying data
 */

/**
 * Export a chart element to PNG
 * Note: Requires html2canvas package to be installed (pnpm add html2canvas)
 */
export async function exportChartToPng(
  chartElement: HTMLElement,
  filename: string = 'chart'
): Promise<void> {
  try {
    // Dynamically import html2canvas for client-side rendering
    // If html2canvas is not installed, this will fail gracefully
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let html2canvasModule: any;
    try {
      // @ts-expect-error - html2canvas is an optional dependency
      html2canvasModule = await import('html2canvas');
    } catch {
      // eslint-disable-next-line no-console
      console.warn('html2canvas not installed. Install with: pnpm add html2canvas');
      // Fallback to browser print functionality
      window.print();
      return;
    }
    
    const html2canvas = html2canvasModule.default;
    const canvas = await html2canvas(chartElement, {
      backgroundColor: '#ffffff',
      scale: 2, // Higher resolution
      logging: false,
    });
    
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to export chart to PNG:', error);
    throw new Error('Failed to export chart');
  }
}

/**
 * Export a chart element to SVG
 */
export function exportChartToSvg(
  chartElement: HTMLElement,
  filename: string = 'chart'
): void {
  try {
    // Find the SVG element within the chart container
    const svgElement = chartElement.querySelector('svg');
    if (!svgElement) {
      throw new Error('No SVG element found in chart');
    }
    
    // Clone the SVG to avoid modifying the original
    const clonedSvg = svgElement.cloneNode(true) as SVGElement;
    
    // Set proper dimensions
    const rect = svgElement.getBoundingClientRect();
    clonedSvg.setAttribute('width', rect.width.toString());
    clonedSvg.setAttribute('height', rect.height.toString());
    
    // Add white background
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('width', '100%');
    bg.setAttribute('height', '100%');
    bg.setAttribute('fill', 'white');
    clonedSvg.insertBefore(bg, clonedSvg.firstChild);
    
    // Serialize and download
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(clonedSvg);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    
    const link = document.createElement('a');
    link.download = `${filename}.svg`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to export chart to SVG:', error);
    throw new Error('Failed to export chart');
  }
}

/**
 * Copy chart data to clipboard as JSON
 */
export async function copyChartData(data: any[]): Promise<void> {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    await navigator.clipboard.writeText(jsonString);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to copy chart data:', error);
    throw new Error('Failed to copy data');
  }
}

/**
 * Copy chart data to clipboard as CSV
 */
export async function copyChartDataAsCsv(data: any[]): Promise<void> {
  try {
    if (!data || data.length === 0) {
      throw new Error('No data to copy');
    }
    
    // Get headers from first object
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    // Add data rows
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvRows.push(values.join(','));
    }
    
    await navigator.clipboard.writeText(csvRows.join('\n'));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to copy chart data as CSV:', error);
    throw new Error('Failed to copy data');
  }
}

/**
 * Format a timestamp for display
 */
export function formatLastSyncTime(timestamp: Date | string | null): string {
  if (!timestamp) return 'Never';
  
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Generate a query summary for display
 */
export function generateQuerySummary(data: any[], type: string): string {
  if (!data || data.length === 0) return 'No data';
  
  const keys = Object.keys(data[0]);
  return `${type.toUpperCase()} chart with ${data.length} data points (${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '...' : ''})`;
}
