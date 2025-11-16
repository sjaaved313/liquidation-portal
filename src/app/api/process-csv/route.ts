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
    const records = parse(text, { columns: true, skip_empty_lines: true });

    // MAP CSV → TABLE
    const rows = records.map((r: any) => ({
      flat_name: (r['Flat Name'] || '').trim(),
      guest_name: (r['Guest Name'] || r['Name Guest'] || '').trim(),
      check_in: r['Check In'] ? new Date(r['Check In']).toISOString().split('T')[0] : null,
      check_out: r['Check Out'] ? new Date(r['Check Out']).toISOString().split('T')[0] : null,
      net_sales: parseFloat((r['Net sales'] || '0').replace(/,/g, '')),
      month: r['Check In'] ? new Date(r['Check In']).toISOString().slice(0, 7) : null,
    }));

    // DIRECT SQL INSERT — BYPASSES RLS 100%
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase.from('detail_sales').insert(rows);

    if (error) {
      console.error('INSERT ERROR:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: `${rows.length} rows inserted into detail_sales` });
  } catch (e: any) {
    console.error('FATAL ERROR:', e);
    return NextResponse.json({ error: 'Failed: ' + e.message }, { status: 500 });
  }
};