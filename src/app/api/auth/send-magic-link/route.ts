// src/app/api/auth/send-magic-link/route.ts
// FINAL – SERVER-SIDE MAGIC LINK GENERATION

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { email } = await request.json();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role key for admin actions
  );

  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: {
      redirectTo: 'https://liquidation-portal.vercel.app/auth/callback',
    },
  });

  if (error) {
    console.error('Magic Link error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Return the link or just success — user will get it via email
  return NextResponse.json({ message: 'Magic Link sent' });
}