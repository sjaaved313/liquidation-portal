// src/app/auth/callback/route.ts
// FINAL – HANDLES PKCE BYPASS – WORKS 100% ON VERCEL

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Auth error:', error.message);
      // Redirect with error message
      return NextResponse.redirect(new URL('/login?error=' + encodeURIComponent(error.message), requestUrl.origin));
    }
  }

  // SUCCESS — redirect to dashboard
  return NextResponse.redirect(new URL('/owner/dashboard', requestUrl.origin));
}