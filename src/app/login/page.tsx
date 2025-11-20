'use client';

import { useEffect } from 'react';
import { createSupabaseClient } from '@/lib/supabase.client';

export default function Login() {
  useEffect(() => {
    const supabase = createSupabaseClient();

    // This catches magic link verification instantly
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        window.location.replace('/owner/dashboard');
      }
    });

    // Also check if session already exists
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        window.location.replace('/owner/dashboard');
      }
    });

    return () => listener?.subscription.unsubscribe();
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