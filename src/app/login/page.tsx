// src/app/login/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Login() {
  const [debug, setDebug] = useState<string[]>([]);

  const log = (msg: string) => {
    console.log(msg);
    setDebug(prev => [...prev, msg]);
  };

  useEffect(() => {
    log('Login page loaded');
    log('URL: ' + window.location.href);
    log('Hash: ' + window.location.hash);

    const processAuth = async () => {
      // Try to get session from hash
      const { data, error } = await supabase.auth.getSession();
      
      if (error) log('getSession error: ' + error.message);
      if (data.session) {
        log('Session found! Redirecting...');
        window.location.replace('/owner/dashboard');
        return;
      } else {
        log('No session yet');
      }

      // If hash exists, try to exchange it
      if (window.location.hash) {
        log('Hash detected, trying exchangeCodeForSession...');
        const result = await supabase.auth.exchangeCodeForSession(window.location.hash.substring(1));
        if (result.error) {
          log('exchangeCodeForSession FAILED: ' + result.error.message);
        } else if (result.data.session) {
          log('exchangeCodeForSession SUCCESS! Redirecting...');
          window.location.replace('/owner/dashboard');
        }
      }
    };

    processAuth();

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      log(`Auth event: ${event}`);
      if (session) {
        log('SIGNED IN — redirecting');
        window.location.replace('/owner/dashboard');
      }
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-12 shadow-2xl">
        <h1 className="mb-6 text-3xl font-bold text-indigo-900">Abriendo tu portal...</h1>
        <p className="mb-6 text-lg text-gray-600">Redirigiendo al panel...</p>
        
        <div className="mt-8">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        </div>

        <div className="mt-10 rounded-lg bg-gray-900 p-6 font-mono text-sm text-green-400">
          <p className="font-bold text-white">DEBUG LOG:</p>
          {debug.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      </div>
    </div>
  );
}