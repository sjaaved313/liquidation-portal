import Link from 'next/link';
import { createSupabaseClient } from '@/lib/supabase.client';
import LogoutButton from './LogoutButton';

export default async function AdminDashboard() {
  const supabase = createSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If no user → redirect immediately go to login
  if (!user) {
    return (
      <html>
        <body>
          <script dangerouslySetInnerHTML={{ __html: `location.href="/admin/login"` }} />
        </body>
      </html>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-900 p-8 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="text-4xl font-bold">Admin Panel</h1>
          <LogoutButton />
        </div>
      </div>

      <div className="mx-auto max-w-6xl p-12 text-center">
        <h2 className="mb-12 text-4xl font-bold">Welcome, {user.email}</h2>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          <Link
            href="/admin/upload"
            className="block rounded-3xl bg-white p-20 shadow-2xl transition-all hover:-translate-y-6 hover:border-4 hover:border-green-600"
          >
            <div className="mb-6 text-8xl">Upload</div>
            <h3 className="text-3xl font-bold text-green-700">Subir Reservas</h3>
          </Link>

          <div className="rounded-3xl bg-gray-100 p-20 opacity-50">
            <div className="mb-6 text-8xl">Chart</div>
            <h3 className="text-3xl font-bold text-gray-500">Estadísticas</h3>
          </div>

          <div className="rounded-3xl bg-gray-100 p-20 opacity-50">
            <div className="mb-6 text-8xl">Users</div>
            <h3 className="text-3xl font-bold text-gray-500">Propietarios</h3>
          </div>
        </div>
      </div>
    </div>
  );
}