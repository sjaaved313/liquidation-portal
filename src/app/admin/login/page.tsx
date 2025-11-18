'use client';

import { useState } from 'react';
import { createSupabaseClient } from '@/lib/supabase.client';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const supabase = createSupabaseClient();
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage('Invalid credentials: ' + error.message);
    } else {
      router.push('/admin');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md p-10 bg-white rounded-2xl shadow-2xl">
        <h1 className="text-4xl font-bold text-center mb-10 text-blue-900">
          Admin Login
        </h1>

        <input
          type="email"
          placeholder="admin@yourcompany.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-4 border-2 rounded-xl mb-5 text-lg focus:border-blue-500"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-4 border-2 rounded-xl mb-8 text-lg focus:border-blue-500"
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
        />

        <button
          onClick={handleLogin}
          disabled={loading || !email || !password}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-xl text-lg"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        {message && (
          <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-lg text-center">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}