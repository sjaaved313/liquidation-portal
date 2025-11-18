'use client';

import Link from 'next/link';
import { createSupabaseClient } from '@/lib/supabase.client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const supabase = createSupabaseClient();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-900 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-medium transition"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8">
        <h2 className="text-4xl font-bold text-gray-800 mb-10 text-center">
          Bienvenido, Administrador
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* UPLOAD PAGE CARD */}
          <Link
            href="/admin/upload"
            className="block p-12 bg-white rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 border-4 border-transparent hover:border-green-600 transform hover:-translate-y-4"
          >
            <div className="text-center">
              <div className="text-6xl mb-6">Upload</div>
              <h3 className="text-2xl font-bold text-green-700">Subir Reservas</h3>
              <p className="text-gray-600 mt-4">Cargar archivo Excel de reservas</p>
            </div>
          </Link>

          {/* FUTURE CARDS */}
          <div className="block p-12 bg-gray-100 rounded-3xl shadow-xl opacity-60">
            <div className="text-center">
              <div className="text-6xl mb-6">Chart</div>
              <h3 className="text-2xl font-bold text-gray-500">Estadísticas</h3>
              <p className="text-gray-500 mt-4">Próximamente</p>
            </div>
          </div>

          <div className="block p-12 bg-gray-100 rounded-3xl shadow-xl opacity-60">
            <div className="text-center">
              <div className="text-6xl mb-6">Users</div>
              <h3 className="text-2xl font-bold text-gray-500">Propietarios</h3>
              <p className="text-gray-500 mt-4">Próximamente</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}