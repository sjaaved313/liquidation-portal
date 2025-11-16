// src/app/api/get-reports/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return new Response('Unauthorized', { status: 401 });

  const token = authHeader.split(' ')[1];
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: reports, error } = await supabase
    .from('monthly_reports')
    .select(`
      id, month, net, pdf_url, csv_url,
      property:property_id (name)
    `)
    .order('month', { ascending: false });

  if (error) return new Response(error.message, { status: 400 });

  return new Response(JSON.stringify(reports), { status: 200 });
}