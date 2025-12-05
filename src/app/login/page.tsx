// src/app/login/page.tsx
// FINAL – SERVER-SIDE MAGIC LINK – NO PKCE

'use client';

import { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/send-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error sending link');
      setMessage('¡Magic Link enviado! Revisa tu correo y ábrelo en una nueva pestaña');
    } catch (error) {
      setMessage('Error: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-12 shadow-2xl">
        <h1 className="mb-8 text-center text-4xl font-bold text-indigo-900">
          Liquidation Portal
        </h1>

        <form onSubmit={handleLogin} className="space-y-8">
          <div>
            <label htmlFor="email" className="block text-xl font-medium text-gray-700 mb-3">
              Tu Email
            </label>
            <input
              id="email"
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