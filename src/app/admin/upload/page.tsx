'use client';

import { useState } from 'react';
import { createSupabaseClient } from '@/lib/supabase.client';

const TABLES = [
  { value: 'properties', label: 'Properties', file: 'properties.csv' },
  { value: 'detail_sales', label: 'Detail Sales', file: 'detail_sales.csv' },
  { value: 'pnl_by_flat', label: 'P&L by Flat', file: 'pnl_by_flat.csv' },
  { value: 'monthly_invoices', label: 'Monthly Invoices', file: 'monthly_invoices.csv' },
  { value: 'monthly_reports', label: 'Monthly Reports', file: 'monthly_invoices.csv' },
  { value: 'quarterly_liquidations', label: 'Quarterly Liquidations', file: 'quarterly_liquidations.csv' },
  { value: 'owners', label: 'Owners', file: 'owners.csv' },
  { value: 'admins', label: 'Admins', file: 'admins.csv' },
] as const;

type TableName = typeof TABLES[number]['value'];

export default function AdminUpload() {
  const [selectedTable, setSelectedTable] = useState<TableName>('properties');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');
  const [autoDetected, setAutoDetected] = useState(false);
  const supabase = createSupabaseClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);

    const fileName = uploadedFile.name.toLowerCase();
    const matched = TABLES.find(t => fileName.includes(t.file.replace('.csv', '')));
    if (matched) {
      setSelectedTable(matched.value);
      setAutoDetected(true);
      setStatus(`Detected: ${matched.label}`);
    } else {
      setAutoDetected(false);
      setStatus('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus('Uploading...');

    const text = await file.text();
    const rows = text.split('\n').map(r => r.trim()).filter(r => r);
    if (rows.length < 2) {
      setStatus('Error: CSV must have headers + data');
      return;
    }

    const headers = rows[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const dataRows = rows.slice(1);

    let data: any[] = [];

    if (selectedTable === 'detail_sales') {
      data = dataRows.map((row, index) => {
        const values = row.split(',').map(v => v.trim().replace(/"/g, ''));
        const rowObj: any = {};
        headers.forEach((h, i) => { rowObj[h] = values[i]; });

        // ULTIMATE DATE PARSER — DD/MM/YYYY FIRST + 1-DAY BUG FIXED
        const parseDate = (dateStr: string | undefined): string | null => {
          if (!dateStr || dateStr === 'NULL') return null;
          const s = dateStr.trim();

          // 1. DD/MM/YYYY → e.g., 24/06/2025
          const dmy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
          if (dmy) {
            const [, day, month, year] = dmy;
            const d = new Date(Date.UTC(
              parseInt(year),
              parseInt(month) - 1,
              parseInt(day)
            ));
            return d.toISOString().split('T')[0];
          }

          // 2. "30-Jun-25"
          const short = s.match(/^(\d{1,2})[-\/](\w{3})[-\/](\d{2,4})$/);
          if (short) {
            const [, day, mon, year] = short;
            const months: { [key: string]: number } = {
              Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
              Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
            };
            const monthNum = months[mon];
            if (monthNum !== undefined) {
              const fullYear = parseInt(year) < 100 ? 2000 + parseInt(year) : parseInt(year);
              const d = new Date(Date.UTC(fullYear, monthNum, parseInt(day)));
              return d.toISOString().split('T')[0];
            }
          }

          // 3. Excel serial
          const serial = parseFloat(s);
          if (!isNaN(serial) && serial > 40000 && serial < 99999) {
            const d = new Date((serial - 25569) * 86400 * 1000);
            return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
              .toISOString().split('T')[0];
          }

          // 4. Fallback
          const d = new Date(s);
          if (!isNaN(d.getTime())) {
            return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
              .toISOString().split('T')[0];
          }

          return null;
        };

        const check_in_raw = rowObj['Check In'];
        const check_out_raw = rowObj['Check Out'];

        const check_in = parseDate(check_in_raw);
        const check_out = parseDate(check_out_raw);

        if (!check_in) {
          console.warn(`Invalid Check In at row ${index + 2}:`, check_in_raw);
        }

        const month = check_in ? check_in.slice(0, 7) : null;

        const net_sales_raw = (rowObj['Net sales'] || '0').toString().replace(/,/g, '').replace(/"/g, '');
        const net_sales = parseFloat(net_sales_raw) || 0;

        return {
          flat_name: (rowObj['Flat Name'] || '').trim() || `Flat ${index}`,
          guest_name: (rowObj['Name Guest'] || rowObj['Guest Name'] || '').trim() || 'Guest',
          check_in,
          check_out,
          net_sales,
          month,
        };
      }).filter(d => d.flat_name && d.check_in && d.net_sales >= 0);

      if (data.length === 0) {
        setStatus('Error: No valid rows after parsing');
        return;
      }

      console.log(`Parsed ${data.length} valid rows from ${dataRows.length} total`);
    } else if (selectedTable === 'pnl_by_flat') {
      const fileName = file.name;
      const monthMatch = fileName.match(/(\d{4}-\d{2})/);
      const month = monthMatch ? monthMatch[0] : null;

      if (!month) {
        setStatus('Error: Add month to filename (e.g., pnl_by_flat_2025-06.csv)');
        return;
      }

      data = dataRows.map(row => {
        const values = row.split(',').map(v => v.trim().replace(/"/g, ''));
        const rowObj: any = {};
        headers.forEach((h, i) => { rowObj[h] = values[i]; });

        return {
          flat_name: rowObj['Flats'] || rowObj['flats'] || rowObj['Flat'],
          additional_expenses: parseFloat(rowObj['Additional Expenses'] || '0') || 0,
          month: month
        };
      }).filter(d => d.flat_name);
    } else {
      data = dataRows.map(row => {
        const values = row.split(',').map(v => v.trim().replace(/"/g, ''));
        return headers.reduce((obj, h, i) => ({ ...obj, [h]: values[i] }), {});
      });
    }

    const { error, count } = await supabase.from(selectedTable).upsert(data, { onConflict: 'id', count: 'exact' });
    setStatus(error ? `Error: ${error.message}` : `SUCCESS: ${count} rows uploaded to ${selectedTable}!`);
  };

  const selectedInfo = TABLES.find(t => t.value === selectedTable);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Admin Data Upload</h1>

      <div className="bg-white p-6 rounded-xl shadow space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Select Table</label>
          <select
            value={selectedTable}
            onChange={(e) => {
              setSelectedTable(e.target.value as TableName);
              setAutoDetected(false);
            }}
            className="w-full p-3 border rounded-lg"
          >
            {TABLES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Upload CSV</label>
          <input 
            type="file" 
            accept=".csv" 
            onChange={handleFileChange} 
            className="w-full p-3 border rounded-lg" 
          />
        </div>

        {autoDetected && <p className="text-green-600">{status}</p>}

        <button 
          onClick={handleUpload} 
          disabled={!file} 
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          Upload to {selectedInfo?.label}
        </button>

        {status && (
          <p className={`text-center text-sm mt-4 font-mono ${status.startsWith('Error') || status.includes('No valid') ? 'text-red-600' : 'text-green-600'}`}>
            {status}
          </p>
        )}
      </div>
    </div>
  );
}