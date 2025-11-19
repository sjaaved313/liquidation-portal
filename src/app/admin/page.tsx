import { createSupabaseClient } from '@/lib/supabase.client';
import Link from 'next/link';

export default async function AdminDashboard() {
  const supabase = createSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return (
      <html>
        <body>
          <script dangerouslySetInnerHTML={{
            __html: `window.location.href = '/admin/login'`
          }} />
        </body>
      </html>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-900 text-white p-8">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-4xl font-bold">Admin Panel</h1>
          <form action="/api/auth/signout" method="post">
            <button className="bg-red-600 hover:bg-red-700 px-8 py-3 rounded-xl text-lg font-bold">
              Logout
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-12 text-center">
        <h2 className="text-4xl font-bold mb-12">Bienvenido, {session.user.email}</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <Link
            href="/admin/upload"
            className="block p-20 bg-white rounded-3xl shadow-2xl hover:shadow-3xl transition-all border-4 border-transparent hover:border-green-600 transform hover:-translate-y-6"
          >
            <div className="text-8xl mb-6">Upload</div>
            <h3 className="text-3xl font-bold text-green-700">Subir Reservas</h3>
            <p className="text-gray-600 mt-4 text-xl">Cargar archivo Excel</p>
          </Link>

          <div className="p-20 bg-gray-100 rounded-3xl shadow-xl opacity-50">
            <div className="text-8xl mb-6">Chart</div>
            <h3 className="text-3xl font-bold text-gray-500">Estadísticas</h3>
          </div>

          <div className="p-20 bg-gray-100 rounded-3xl shadow-xl opacity-50">
            <div className="text-8xl mb-6">Users</div>
            <h3 className="text-3xl font-bold text-gray-500">Propietarios</h3>
          </div>
        </div>
      </div>
    </div>
  );
}