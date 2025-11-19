'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createSupabaseClient } from '@/lib/supabase.client';

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createSupabaseClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
  }, [supabase]);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/admin/login';
  };

  if (loading) return <div className="p-20 text-center">Loading...</div>;
  if (!user) {
    window.location.href = '/admin/login';
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="bg-blue-900 text-white p-8 shadow-xl">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-4xl font-bold">Admin Panel</h1>
          <button onClick={logout} className="bg-red-600 hover:bg-red-700 px-8 py-4 rounded-xl text-xl font-bold">
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-12">
        <h2 className="text-4xl font-bold text-center mb-12 text-blue-900">
          Welcome, {user.email}
        </h2>

        <div className="grid place-items-center">
          <Link
            href="/admin/upload"
            className="block w-96 p-20 bg-white rounded-3xl shadow-2xl text-center transform hover:scale-105 hover:shadow-3xl transition-all duration-300 border-8 border-transparent hover:border-green-600"
          >
            <div className="text-9xl mb-8">Upload</div>
            <h3 className="text-4xl font-bold text-green-700">Subir Reservas</h3>
            <p className="text-xl text-gray-600 mt-6">Cargar archivo Excel</p>
          </Link>
        </div>
      </div>
    </div>
  );
}