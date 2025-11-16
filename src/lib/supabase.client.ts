// src/lib/supabase.client.ts
import { createClient, SupabaseClient, AuthChangeEvent, Session } from '@supabase/supabase-js';

// Extend window type
declare global {
  interface Window {
    supabaseAuthListener?: boolean;
  }
}

let client: SupabaseClient | null = null;

export function createSupabaseClient(): SupabaseClient {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase env vars');
  }

  client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  });

  // PREVENT INFINITE LOOP — RUN ONCE
  if (typeof window !== 'undefined' && !window.supabaseAuthListener) {
    window.supabaseAuthListener = true;

    client.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (event === 'SIGNED_IN' && session) {
        const redirectTo = sessionStorage.getItem('supabase.redirect') || '/owner/dashboard';
        sessionStorage.removeItem('supabase.redirect');
        if (window.location.pathname === '/login') {
          window.location.href = redirectTo;
        }
      }
    });
  }

  return client;
}