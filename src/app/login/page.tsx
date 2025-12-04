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
    // This is the ONLY method that works 100% on Vercel with magic link
    const handleHash = async () => {
      const hash = window.location.hash.substring(1);
      if (hash) {
        const params = new URLSearchParams(hash);
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');

        if (access_token && refresh_token) {
          await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          window.location.replace('/owner/dashboard');
          return;
        }
      }

      // If no hash, just check session normally
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        window.location.replace('/owner/dashboard');
      }
    };

    handleHash();

    // Also listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        window.location.replace('/owner/dashboard');
      }
    });

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