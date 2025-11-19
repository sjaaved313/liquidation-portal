'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createSupabaseClient } from '@/lib/supabase.client';

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const supabase = createSupabaseClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        window.location.href = '/admin/login';
      } else {
        setUser(data.user);
      }
    });
  }, [supabase]);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/admin/login';
  };

  if (!user) return <div className="p-20 text-center text-2xl">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="bg-blue-900 text-white p-10 shadow-2xl">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-4xl font-bold">Admin Panel</h1>
          <button onClick={logout} className="bg-red-600 hover:bg-red-700 px-8 py-4 rounded-xl text-xl font-bold">
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-16 text-center">
        <h2 className="text-4xl font-bold mb-16 text-blue-900">
          Welcome, {user.email}!
        </h2>

        <Link href="/admin/upload">
          <div className="inline-block bg-white rounded-3xl p-28 shadow-3xl hover:shadow-4xl transition-all hover:scale-105 border-8 border-transparent hover:border-green-600 cursor-pointer">
            <div className="text-9xl mb-8">Upload</div>
            <h3 className="text-4xl font-bold text-green-700">Subir Reservas</h3>
            <p className="text-2xl text-gray-600 mt-6">Cargar archivo Excel</p>
          </div>
        </Link>
      </div>
    </div>
  );
}