// src/app/login/page.tsx
// DEBUG VERSION – SHOWS EXACTLY WHAT'S HAPPENING

'use client';

import { useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function Login() {
  useEffect(() => {
    console.log('Login page loaded');
    console.log('URL:', window.location.href);
    console.log('Hash:', window.location.hash);

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Log environment
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Anon key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    // Check current session
    supabase.auth.getSession().then(({ data, error }) => {
      console.log('getSession result:', { data, error });
      if (data.session) {
        console.log('Session found! Redirecting...');
        window.location.href = '/owner/dashboard';
      } else {
        console.log('No session yet');
      }
    });

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event, 'Session:', !!session);
      if (session) {
        console.log('SIGNED IN! Redirecting...');
        window.location.href = '/owner/dashboard';
      }
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-12 shadow-2xl text-left font-mono text-sm">
        <h1 className="mb-6 text-2xl font-bold text-indigo-900">Debug Login</h1>
        <p className="mb-4">Open browser DevTools → Console tab to see logs</p>
        <div className="space-y-2 text-gray-700">
          <p>1. Check if URL has #access_token=...</p>
          <p>2. Check if Supabase URL and anon key are loaded</p>
          <p>3. Watch for "SIGNED IN!" message</p>
        </div>
        <div className="mt-8 text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        </div>
      </div>
    </div>
  );
}