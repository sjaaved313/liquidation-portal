// src/app/login/page.tsx
'use client';

import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Login() {
  useEffect(() => {
    // Check session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        window.location.replace('/owner/dashboard');
      }
    });

    // Listen for ANY auth changes (this catches the hash on Vercel)
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session) {
          window.location.replace('/owner/dashboard');
        }
      }
    });

    // Also manually process the hash on page load (Vercel needs this)
    if (window.location.hash) {
      supabase.auth.exchangeCodeForSession(window.location.hash.substring(1));
    }

    return () => listener?.subscription.unsubscribe();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-12 shadow-2xl text-center">
        <h1 className="mb-4 text-3xl font-bold text-indigo-900">Abriendo tu portal...</h1>
        <p className="text-lg text-gray-600">Redirigiendo al panel...</p>
        <div className="mt-8">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        </div>
      </div>
    </div>
  );
}