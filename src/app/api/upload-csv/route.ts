// src/app/api/upload-csv/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse/sync';

export const POST = async (req: NextRequest) => {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

    const text = await file.text();
    const records = parse(text, { columns: true, skip_empty_lines: true }) as Record<string, unknown>[];

    const parseDate = (value: unknown): string => {
      const str = String(value ?? '').trim();

      // 1. Excel serial date: 45809 → 2025-06-13
      if (/^\d{5,}$/.test(str)) {
        const serial = parseInt(str, 10);
        if (serial >= 40000 && serial <= 99999) {
          const date = new Date((serial - 25569) * 86400000);
          if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
          }
        }
      }

      // 2. Standard formats: 6/16/2025, 16/06/2025, 2025-06-16
      if (/^\d{1,2}[\/-]\d{1,2}[\/-]\d{4}$/.test(str)) {
        const parts = str.split(/[-\/]/).map(p => p.trim());
        const [a, b, c] = parts;

        // Detect format
        let year: string, month: string, day: string;
        if (a.length === 4) {
          // YMD
          [year, month, day] = [a, b, c];
        } else if (parseInt(a) > 12) {
          // DMY
          [day, month, year] = [a, b, c];
        } else if (parseInt(b) > 12) {
          // DMY
          [day, month, year] = [a, b, c];
        } else {
          // MDY
          [month, day, year] = [a, b, c];
        }

        const d = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
        if (!isNaN(d.getTime())) {
          return d.toISOString().split('T')[0];
        }
      }

      // 3. Fallback
      const d = new Date(str);
      return isNaN(d.getTime()) ? '1970-01-01' : d.toISOString().split('T')[0];
    };

    const rows = records.map((r: Record<string, unknown>, index: number) => {
      const check_in_raw = r['Check In'];
      const check_out_raw = r['Check Out'];

      const check_in = parseDate(check_in_raw);
      const check_out = parseDate(check_out_raw);

      // Generate month from check_in
      let month = '1970-01';
      if (check_in !== '1970-01-01') {
        const [y, m] = check_in.split('-');
        if (m && parseInt(m) >= 1 && parseInt(m) <= 12) {
          month = `${y}-${m}`;
        }
      }

      const net_sales_raw = String(r['Net sales'] ?? '0').replace(/,/g, '').replace(/"/g, '');
      const net_sales = parseFloat(net_sales_raw) || 0;

      return {
        flat_name: String(r['Flat Name'] ?? '').trim() || `Flat ${index + 1}`,
        guest_name: String(r['Guest Name'] ?? r['Name Guest'] ?? '').trim() || 'Guest',
        check_in,
        check_out,
        net_sales,
        month,
      };
    });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase.from('detail_sales').insert(rows);

    if (error) {
      console.error('INSERT ERROR:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      message: `${rows.length} rows inserted into detail_sales`,
      debug: { 
        total: rows.length,
        valid_check_out: rows.filter(r => r.check_out !== '1970-01-01').length
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: 'Processing failed: ' + e.message }, { status: 500 });
  }
};