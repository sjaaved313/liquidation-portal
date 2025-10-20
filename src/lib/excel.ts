import * as ExcelJS from 'exceljs';

export async function generateExcel(data: any[]) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1');
  worksheet.addRow(['Flat', 'Net Sales', 'Commission']);
  data.forEach(row => worksheet.addRow([row.flat, row.netSales, row.commission]));
  return await workbook.xlsx.writeBuffer();
}