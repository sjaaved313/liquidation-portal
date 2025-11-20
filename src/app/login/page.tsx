'use client';

import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Login() {
  useEffect(() => {
    // This runs immediately when magic link lands with #access_token=...
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        window.location.replace('/owner/dashboard');
      }
    });

    // This catches the hash and processes it instantly
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
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
      </div>
    </div>
  );
}