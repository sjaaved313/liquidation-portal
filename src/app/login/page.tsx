'use client';

import { useState } from 'react';
import { createSupabaseClient } from '@/lib/supabase.client';

export default function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const supabase = createSupabaseClient();

  const sendMagicLink = async () => {
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/owner/dashboard`,
      },
    });

    if (error) {
      setMessage('Error sending link: ' + error.message);
    } else {
      setMessage('Magic link sent to ' + email + '! Check your inbox.');
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100">
      <div className="w-full max-w-md p-12 bg-white rounded-2xl shadow-2xl text-center">
        <h1 className="mb-8 text-4xl font-bold text-indigo-900">Iniciar Sesión</h1>
        <p className="mb-8 text-lg text-gray-600">Ingresa tu correo para recibir un enlace de acceso</p>
        <input
          type="email"
          placeholder="Tu correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-4 border-2 rounded-xl mb-6 text-lg focus:border-indigo-500 outline-none"
        />
        <button
          onClick={sendMagicLink}
          disabled={loading || !email}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-xl text-lg transition"
        >
          {loading ? 'Enviando...' : 'Enviar Enlace Mágico'}
        </button>
        {message && (
          <p className={`mt-6 text-center text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}