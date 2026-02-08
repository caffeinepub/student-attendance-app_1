/**
 * CSV utility functions for generating Excel-compatible CSV files
 */

/**
 * Escapes a CSV field value by wrapping it in quotes if it contains special characters
 */
export function escapeCsvField(value: string | number): string {
  const stringValue = String(value);
  
  // If the value contains comma, quote, or newline, wrap it in quotes and escape internal quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

/**
 * Converts an array of rows into a CSV string
 */
export function arrayToCsv(rows: (string | number)[][]): string {
  return rows
    .map(row => row.map(escapeCsvField).join(','))
    .join('\n');
}

/**
 * Triggers a browser download of CSV data
 */
export function downloadCsv(csvContent: string, filename: string): void {
  // Add BOM for Excel UTF-8 compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
