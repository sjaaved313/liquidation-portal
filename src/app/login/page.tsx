'use client';

import { useEffect } from 'react';
import { createSupabaseClient } from '@/lib/supabase.client';

export default function Login() {
  useEffect(() => {
    const supabase = createSupabaseClient();

    // This runs ONCE when magic link lands here with #access_token=…
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Instant redirect — no waiting, no flicker
        window.location.replace('/owner/dashboard');
      } else {
        // No token → show normal login form (you already have it working)
        window.location.replace('/'); // or keep the form if you prefer
      }
    });
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-12 shadow-2xl text-center">
        <h1 className="mb-4 text-3xl font-bold text-indigo-900">Opening your portal...</h1>
        <p className="text-lg text-gray-600">Taking you to your dashboard...</p>
      </div>
    </div>
  );
}