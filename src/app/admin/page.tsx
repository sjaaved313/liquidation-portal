import { createSupabaseClient } from '@/lib/supabase.client';
import Link from 'next/link';

export default async function AdminDashboard() {
  const supabase = createSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  // IF NOT LOGGED IN → REDIRECT TO LOGIN (SERVER-SIDE)
  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-2xl mb-6">Redirecting to login...</p>
          <script dangerouslySetInnerHTML={{ __html: `window.location.href = '/admin/login'` }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-900 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <form action="/auth/signout" method="post">
            <button className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-medium">
              Logout
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-10">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
          Bienvenido, {session.user.email}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <Link
            href="/admin/upload"
            className="block p-16 bg-white rounded-3xl shadow-2xl hover:shadow-3xl transition-all text-center border-4 border-transparent hover:border-green-600 transform hover:-translate-y-4"
          >
            <div className="text-7xl mb-6">Upload</div>
            <h3 className="text-3xl font-bold text-green-700">Subir Reservas</h3>
            <p className="text-gray-600 mt-4 text-lg">Cargar Excel de reservas</p>
          </Link>

          <div className="p-16 bg-gray-100 rounded-3xl shadow-xl text-center opacity-60">
            <div className="text-7xl mb-6">Chart</div>
            <h3 className="text-3xl font-bold text-gray-500">Estadísticas</h3>
            <p className="text-gray-500 mt-4">Próximamente</p>
          </div>

          <div className="p-16 bg-gray-100 rounded-3xl shadow-xl text-center opacity-60">
            <div className="text-7xl mb-6">Users</div>
            <h3 className="text-3xl font-bold text-gray-500">Propietarios</h3>
            <p className="text-gray-500 mt-4">Próximamente</p>
          </div>
        </div>
      </div>
    </div>
  );
}