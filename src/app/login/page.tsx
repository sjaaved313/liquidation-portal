// src/app/login/page.tsx
'use client';

import { useState } from 'react';
import { createSupabaseClient } from '@/lib/supabase.client';

export default function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const supabase = createSupabaseClient();


  const handleLogin = async () => {
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/owner/dashboard`,
      },
    });

    setMessage(error ? error.message : '¡Enlace mágico enviado! Revisa tu correo.');
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-8">Iniciar Sesión</h1>
        <p className="text-center text-gray-600 mb-6">
          Ingresa tu correo para recibir un enlace de acceso
        </p>
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border rounded-lg mb-4"
        />
        <button
          onClick={handleLogin}
          disabled={loading || !email}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Enviando...' : 'Enviar Enlace Mágico'}
        </button>
        {message && (
          <p className={`mt-4 text-center ${message.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
  
}
