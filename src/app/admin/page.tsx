'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createSupabaseClient } from '@/lib/supabase.client';

export default function AdminDashboard() {
  const [user, setUser] = useState<any, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createSupabaseClient();
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        window.location.replace('/admin/login');
      } else {
        setUser(data.user);
      }
    };
    checkUser();
  }, []);

  const logout = () => {
    createSupabaseClient().auth.signOut();
    window.location.href = '/admin/login';
  };

  if (!user) return <div className="p-20 text-center text-3xl">Checking login...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="bg-blue-900 text-white p-10 shadow-2xl">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-5xl font-bold">ADMIN PANEL</h1>
          <button onClick={logout} className="bg-red-600 hover:bg-red-700 px-10 py-4 rounded-xl text-2xl font-bold">
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto text-center p-20">
        <h2 className="text-5xl font-bold mb-20 text-blue-900">
          Welcome back, {user.email}!
        </h2>

        <Link href="/admin/upload">
          <div className="inline-block bg-white rounded-3xl p-32 shadow-4xl hover:shadow-5xl transition-all hover:scale-110 border-12 border-transparent hover:border-green-600 cursor-pointer">
            <div className="text-9xl mb-10">Upload</div>
            <h3 className="text-5xl font-bold text-green-700">Subir Reservas</h3>
            <p className="text-3xl text-gray-600 mt-8">Click to upload Excel</p>
          </div>
        </Link>
      </div>
    </div>
  );
}