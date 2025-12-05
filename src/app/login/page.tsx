// src/app/login/page.tsx
// EMAIL FORM – USER TYPES EMAIL HERE

'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'https://liquidation-portal.vercel.app/auth/callback',
      },
    });

    if (error) {
      setMessage('Error: ' + error.message);
    } else {
      setMessage('¡Magic Link enviado! Revisa tu correo');
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-12 shadow-2xl">
        <h1 className="mb-8 text-center text-4xl font-bold text-indigo-900">
          Liquidation Portal
        </h1>

        <form onSubmit={handleLogin} className="space-y-8">
          <div>
            <label className="block text-xl font-medium text-gray-700 mb-3">
              Tu Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border-2 border-gray-300 px-6 py-4 text-lg focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-200"
              placeholder="nombre@ejemplo.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-5 text-2xl font-bold text-white shadow-2xl hover:shadow-3xl disabled:opacity-70 transition-all"
          >
            {loading ? 'Enviando...' : 'Enviar Magic Link'}
          </button>
        </form>

        {message && (
          <p className={`mt-8 text-center text-xl font-semibold ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}