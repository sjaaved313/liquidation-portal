'use client';

import { createSupabaseClient } from '@/lib/supabase.client';

export default function LogoutButton() {
  const logout = async () => {
    const supabase = createSupabaseClient();
    await supabase.auth.signOut();
    window.location.href = '/admin/login';
  };

  return (
    <button
      onClick={logout}
      className="rounded-xl bg-red-600 px-8 py-3 text-lg font-bold hover:bg-red-700"
    >
      Logout
    </button>
  );
}