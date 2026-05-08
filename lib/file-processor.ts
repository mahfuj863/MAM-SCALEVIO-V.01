import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface FileProcessResult {
  emails: string[];
  totalCount: number;
  duplicateCount: number;
}

export async function parseFile(buffer: Buffer, filename: string): Promise<FileProcessResult> {
  const extension = filename.split('.').pop()?.toLowerCase();
  let rawEmails: string[] = [];

  if (extension === 'csv') {
    const csvData = buffer.toString('utf8');
    const parsed = Papa.parse(csvData, { header: false });
    rawEmails = parsed.data.flat().map((e: any) => String(e).trim());
  } else if (extension === 'xlsx' || extension === 'xls') {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    rawEmails = (jsonData as any[]).flat().map((e: any) => String(e).trim());
  } else if (extension === 'txt') {
    rawEmails = buffer.toString('utf8').split(/\r?\n/).map(e => e.trim());
  }

  // Filter valid-looking emails before verification
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const filteredEmails = rawEmails.filter(e => emailRegex.test(e));
  
  const uniqueEmails = Array.from(new Set(filteredEmails));
  
  return {
    emails: uniqueEmails,
    totalCount: filteredEmails.length,
    duplicateCount: filteredEmails.length - uniqueEmails.length
  };
}

export function generateExportFile(data: any[], format: 'csv' | 'xlsx' | 'json'): Buffer {
  if (format === 'csv') {
    const csv = Papa.unparse(data);
    return Buffer.from(csv);
  } else if (format === 'xlsx') {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Verified Emails');
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  } else {
    return Buffer.from(JSON.stringify(data, null, 2));
  }
}
