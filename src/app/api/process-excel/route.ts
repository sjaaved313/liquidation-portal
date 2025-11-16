// src/app/api/process-excel/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';

export const POST = async (req: NextRequest) => {
  try {
    const { fileName, tableName } = await req.json();
    if (!tableName || !fileName) return NextResponse.json({ error: 'Missing tableName or fileName' }, { status: 400 });

    // MUST USE service_role KEY → BYPASSES RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data } = await supabase.storage.from('uploads').download(fileName);
    const text = await data?.text();
    if (!text) return NextResponse.json({ error: 'File not found' }, { status: 404 });

    const records = parse(text, { columns: true, skip_empty_lines: true });

    const mapped = records.map((r: any) => ({
      flat_name: r['Flat Name'] || '',
      guest_name: r['Guest Name'] || r['Name Guest'] || '',
      check_in: r['Check In'] ? new Date(r['Check In']).toISOString().split('T')[0] : null,
      check_out: r['Check Out'] ? new Date(r['Check Out']).toISOString().split('T')[0] : null,
      net_sales: parseFloat((r['Net sales'] || '0').replace(/,/g, '')),
      month: r['Check In'] ? new Date(r['Check In']).toISOString().slice(0, 7) : null
    }));

    const { error } = await supabase.from(tableName).insert(mapped);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ message: `${mapped.length} rows inserted into ${tableName}` });
  } catch (e: any) {
    return NextResponse.json({ error: 'Processing failed: ' + e.message }, { status: 500 });
  }
};