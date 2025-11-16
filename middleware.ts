// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req: any) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  const url = req.nextUrl.pathname;

  // Block direct access to /admin
  if (url === '/admin' || url.startsWith('/admin/')) {
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    // Optional: Check if user is admin
    // const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id);
    // if (data?.[0]?.role !== 'admin') return NextResponse.redirect(new URL('/login', req.url));
  }

  return res;
}

export const config = {
  matcher: '/admin/:path*',
};