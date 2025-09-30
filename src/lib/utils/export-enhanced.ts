/**
 * Enhanced export utilities with support for multiple formats
 */

export type ExportFormat = 'csv' | 'excel' | 'pdf';

interface ExportOptions {
  filename: string;
  format: ExportFormat;
  headers?: string[];
  title?: string;
}

/**
 * Convert data to CSV format
 */
export function convertToCSV(data: any[], headers?: string[]): string {
  if (data.length === 0) return '';

  const keys = headers || Object.keys(data[0]);
  const csvHeaders = keys.join(',');
  
  const csvRows = data.map(row => {
    return keys.map(key => {
      const value = row[key];
      // Handle special characters and quotes
      if (typeof value === 'string') {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? '';
    }).join(',');
  });

  return [csvHeaders, ...csvRows].join('\n');
}

/**
 * Download CSV file
 */
export function downloadCSV(data: any[], filename: string, headers?: string[]) {
  const csv = convertToCSV(data, headers);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export data in various formats
 */
export async function exportData(data: any[], options: ExportOptions) {
  const { filename, format, headers } = options;

  switch (format) {
    case 'csv':
      downloadCSV(data, filename, headers);
      break;
    case 'excel':
      // For now, export as CSV (can be enhanced with xlsx library later)
      downloadCSV(data, filename, headers);
      break;
    case 'pdf':
      // Placeholder for PDF export (requires jsPDF or similar)
      console.warn('PDF export not yet implemented');
      downloadCSV(data, filename, headers);
      break;
    default:
      downloadCSV(data, filename, headers);
  }
}

/**
 * Format data for export (flatten nested objects)
 */
export function prepareDataForExport(data: any[]): any[] {
  return data.map(item => {
    const flattened: any = {};
    
    Object.entries(item).forEach(([key, value]) => {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        // Flatten nested objects
        Object.entries(value).forEach(([nestedKey, nestedValue]) => {
          flattened[`${key}_${nestedKey}`] = nestedValue;
        });
      } else if (Array.isArray(value)) {
        // Convert arrays to comma-separated strings
        flattened[key] = value.join(', ');
      } else {
        flattened[key] = value;
      }
    });
    
    return flattened;
  });
}

/**
 * Export with filters applied
 */
export function exportFiltered<T>(
  data: T[],
  filterFn: (item: T) => boolean,
  filename: string,
  format: ExportFormat = 'csv'
) {
  const filtered = data.filter(filterFn);
  const prepared = prepareDataForExport(filtered);
  
  exportData(prepared, {
    filename,
    format,
  });
}
