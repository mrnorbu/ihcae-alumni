/**
 * Reusable column definition for CSV export.
 */
export interface CSVColumn<T = any> {
  key: string;
  label: string;
  transform?: (value: any, item: T) => string;
}

/**
 * Escapes a cell value for CSV formatting, following RFC 4180 rules.
 * Handles nulls, double-quotes (escaped by doubling them), commas, and newlines.
 */
function escapeCSVCell(val: any): string {
  if (val === null || val === undefined) {
    return '""';
  }
  let str = String(val).trim();
  // If string has commas, quotes, or newlines, escape internal quotes by doubling them and wrap cell in double quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    str = str.replace(/"/g, '""');
    return `"${str}"`;
  }
  return str;
}

/**
 * Safely resolves nested property paths (e.g. "author.firstName" or "matchedUser.lastLoginAt")
 */
function getDeepPropertyValue(obj: any, path: string): any {
  if (!obj) return undefined;
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

/**
 * Highly reusable client-side utility to export datasets to a Microsoft Excel compatible CSV file.
 * Automatically adds the UTF-8 BOM (Byte Order Mark) to ensure Excel opens non-ASCII characters correctly.
 * 
 * @param data Array of records to export
 * @param columns Configured list of columns mapping keys, labels, and optional transforms
 * @param filename File name for the download (should end with .csv)
 */
export function exportToCSV<T = any>(
  data: T[],
  columns: CSVColumn<T>[],
  filename: string
): void {
  // 1. Generate CSV Headers Row
  const headers = columns.map(col => escapeCSVCell(col.label)).join(',');

  // 2. Generate CSV Data Rows
  const rows = data.map(item => {
    return columns.map(col => {
      const rawValue = getDeepPropertyValue(item, col.key);
      const formattedValue = col.transform ? col.transform(rawValue, item) : rawValue;
      return escapeCSVCell(formattedValue);
    }).join(',');
  });

  // 3. Assemble full document content
  const csvString = [headers, ...rows].join('\n');

  // 4. Prepend UTF-8 BOM (\uFEFF) so Microsoft Excel opens it as UTF-8 flawlessly
  const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
  
  // 5. Trigger client-side browser file download
  const link = document.createElement('a');
  const downloadUrl = URL.createObjectURL(blob);
  
  link.setAttribute('href', downloadUrl);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
}
