// src/app/auth/callback/page.tsx
// MAGIC LINK CALLBACK – FINAL REDIRECT

'use client';

import { useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function AuthCallback() {
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        window.location.replace('/owner/dashboard');
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        window.location.replace('/owner/dashboard');
      }
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100">
      <div className="text-center">
        <div className="mb-8 h-20 w-20 animate-spin rounded-full border-8 border-indigo-600 border-t-transparent mx-auto"></div>
        <h1 className="text-4xl font-bold text-indigo-900">Iniciando sesión...</h1>
        <p className="mt-4 text-xl text-gray-600">Un momento por favor</p>
      </div>
    </div>
  );
}