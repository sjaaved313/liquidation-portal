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
      // THIS IS THE ONLY WAY THAT WORKS 100% EVERY TIME
      window.location.replace('/admin');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-12 shadow-2xl text-center">
        <h1 className="mb-10 text-4xl font-bold text-blue-900">Admin Login</h1>
        <p className="mb-6 text-lg text-gray-700">Email: sjaaved313@gmail.com</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && login()}
          placeholder="Enter password"
          className="w-full rounded-xl border-2 p-5 text-lg mb-8 focus:border-blue-600 outline-none"
          autoFocus
        />
        <button
          onClick={login}
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 py-5 text-xl font-bold text-white hover:bg-blue-700 disabled:opacity-70"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </div>
    </div>
  );
}