// src/app/login/page.tsx
'use client';

import { useEffect } from 'react';
import { createSupabaseClient } from '@/lib/supabase.client';

export default function Login() {
  useEffect(() => {
    const supabase = createSupabaseClient();

    // Check if user is already signed in (magic link case)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // MAGIC LINK SUCCESS → redirect straight to owner dashboard
        window.location.replace('/owner/dashboard');
      }
    });

    // Listen for auth changes (covers both magic link and future logins)
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        window.location.replace('/owner/dashboard');
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-12 shadow-2xl text-center">
        <h1 className="mb-8 text-4xl font-bold text-indigo-900">Checking your magic link...</h1>
        <div className="text-6xl">Loading...</div>
        <p className="mt-8 text-lg text-gray-600">
          If nothing happens, <a href="/owner/dashboard" className="text-blue-600 underline">click here</a>
        </p>
      </div>
    </div>
  );
}