'use client';

import { useState } from 'react';
import { createSupabaseClient } from '@/lib/supabase.client';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createSupabaseClient();

  const login = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: 'sjaaved313@gmail.com',
      password,
    });
    if (error) {
      alert('Wrong password');
      setLoading(false);
    } else {
      window.location.href = '/admin';
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-12 shadow-2xl">
        <h1 className="mb-10 text-center text-4xl font-bold text-blue-900">Admin Login</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && login()}
          placeholder="Enter password"
          className="w-full rounded-xl border-2 p-5 text-lg mb-8 focus:border-blue-600 outline-none"
        />
        <button
          onClick={login}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-xl text-xl"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </div>
    </div>
  );
}