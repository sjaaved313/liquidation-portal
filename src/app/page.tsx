// src/app/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase.client';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createSupabaseClient();
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace('/owner/dashboard');
      } else {
        router.replace('/login');
      }
    };
    check();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center p-8 bg-white rounded-xl shadow-lg">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Portal de Propietarios</h2>
        <p className="text-gray-600">Redirigiendo...</p>
      </div>
    </div>
  );
}