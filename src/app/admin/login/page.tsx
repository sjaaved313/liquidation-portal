'use client';

import { useState } from 'react';
import { createSupabaseClient } from '@/lib/supabase.client';

export default function AdminLogin() {
  const [email, setEmail] = useState('sjaaved313@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const supabase = createSupabaseClient();

  const login = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      alert('Wrong password or email');
      setLoading(false);
    } else {
      // THIS IS THE ONLY LINE THAT WORKS EVERY TIME
      window.location.href = '/admin';
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-2xl">
        <h1 className="mb-10 text-center text-4xl font-bold text-blue-900">Admin Login</h1>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-5 w-full rounded-xl border-2 p-4 text-lg"
          placeholder="Email"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && login()}
          className="mb-8 w-full rounded-xl border-2 p-4 text-lg"
          placeholder="Password"
        />
        <button
          onClick={login}
          disabled={loading}
          className="w-full rounded-xl bg-blue-600 py-4 text-lg font-bold text-white hover:bg-blue-700 disabled:opacity-70"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </div>
    </div>
  );
}