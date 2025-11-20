'use client';

import { useEffect } from 'react';
import { createSupabaseClient } from '@/lib/supabase.client';

export default function Login() {
  useEffect(() => {
    const supabase = createSupabaseClient();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
        window.location.replace('/owner/dashboard');
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) window.location.replace('/owner/dashboard');
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100">
      <div className="text-3xl font-bold text-indigo-900">Opening your portal...</div>
    </div>
  );
}