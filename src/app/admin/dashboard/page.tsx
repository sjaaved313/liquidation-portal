import Link from 'next/link';
import { createSupabaseClient } from '@/lib/supabase.client';

export default async function AdminDashboard() {
  const supabase = createSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>Access denied. <a href="/admin/login">Go back</a></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex items-center justify-between">
          <h1 className="text-4xl font-bold text-blue-900">Admin Panel</h1>
          <form action="/api/logout" method="post">
            <button className="rounded-lg bg-red-600 px-6 py-3 text-white font-bold hover:bg-red-700">
              Logout
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link
            href="/admin/upload"
            className="block rounded-3xl bg-white p-16 text-center shadow-2xl hover:shadow-3xl transition-all hover:-translate-y-4 border-4 border-transparent hover:border-green-600"
          >
            <div className="text-8xl mb-6">Upload</div>
            <h3 className="text-3xl font-bold text-green-700">Subir Reservas</h3>
          </Link>
        </div>
      </div>
    </div>
  );
}