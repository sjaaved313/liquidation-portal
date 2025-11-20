'use client';

import { useState, useEffect } from 'react';
import { createSupabaseClient } from '@/lib/supabase.client';
import UploadButton from '@/components/uploadButton';  // ← EXACT filename in your repo

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createSupabaseClient();
      const { data } = await supabase.auth.getUser();
      if (data.user?.email === 'admin@liquidationportal.com') {
        setUser(data.user);
      } else {
        window.location.replace('/admin/login');
      }
    };
    checkUser();
  }, []);

  if (!user) return <div className="flex min-h-screen items-center justify-center text-2xl">Checking admin access...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="mb-12 text-5xl font-bold text-purple-900">Admin Portal</h1>
        <UploadButton />
      </div>
    </div>
  );
}