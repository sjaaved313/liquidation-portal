// src/app/api/test-rls/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'No token' }), { status: 401 });
  }

  const token = authHeader.split(' ')[1];

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
  }

  const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: owner, error: dbError } = await supabase
    .from('owners')
    .select('id, name, address, nif_id, flats')
    .eq('id', user.id)
    .single();

  if (dbError) {
    return new Response(JSON.stringify({ error: dbError.message }), { status: 400 });
  }

  // ADD EMAIL HERE
  return new Response(JSON.stringify({ 
    owner: {
      ...owner,
      email: user.email  // FROM SUPABASE AUTH
    }
  }), { status: 200 });
}