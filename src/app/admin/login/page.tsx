'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // THIS IS THE CORRECT CLIENT FOR CLIENT-SIDE PASSWORD LOGIN
  const supabase = createClientComponentClient();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) return;

    setLoading(true);
    setMessage('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      console.error('Login error:', error); // ← Check browser console!
      setMessage('Invalid credentials: ' + error.message);
      setLoading(false);
    } else {
      console.log('Login success:', data);
      router.push('/admin');
      router.refresh(); // Important: forces re-render after login
    }
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
          className="w-full p-4 border-2 rounded-xl mb-5 text-lg focus:border-blue-500 outline-none"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-4 border-2 rounded-xl mb-8 text-lg focus:border-blue-500 outline-none"
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
        />

        <button
          onClick={handleLogin}
          disabled={loading || !email || !password}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-xl text-lg transition"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        {message && (
          <div className="mt-6 p-4 bg-red-100 text-red-700 rounded-lg text-center font-medium">
            {message}
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Test credentials:</p>
          <p className="font-mono bg-gray-100 px-3 py-1 rounded mt-2">
            {email || 'your-email'} / {password || 'your-password'}
          </p>
        </div>
      </div>
    </div>
  );
}