'use client';

import { useEffect } from 'react';
import { createSupabaseClient } from '@/lib/supabase.client';

export default function Login() {
  useEffect(() => {
    const supabase = createSupabaseClient();

    // This fires IMMEDIATELY when magic link is clicked
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session) {
          // Hard redirect — beats all caching/flickering
          window.location.replace('/owner/dashboard');
        }
      }
    });

    // Also check current session in case it's already there
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        window.location.replace('/owner/dashboard');
      }
    });

    // Cleanup
    return () => listener?.subscription.unsubscribe();
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-12 shadow-2xl text-center">
        <div className="mb-8 animate-pulse">
          <div className="mx-auto h-16 w-16 rounded-full bg-indigo-600"></div>
        </div>
        <h1 className="mb-4 text-3xl font-bold text-indigo-900">Opening your portal...</h1>
        <p className="text-lg text-gray-600">
          Taking you to your dashboard
        </p>
      </div>
    </div>
  );
}