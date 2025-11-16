/*
// src/lib/supabase.client.ts
import { createClient } from '@supabase/supabase-js';

export function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase env vars');
  }

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  });

  if (typeof window !== 'undefined') {
    const url = new URL(window.location.href);
    const hash = url.hash;
    if (hash.includes('access_token')) {
      const accessToken = hash.split('access_token=')[1]?.split('&')[0];
      const refreshToken = hash.split('refresh_token=')[1]?.split('&')[0];
      if (accessToken && refreshToken) {
        client.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }).then(() => {
          window.history.replaceState({}, '', '/owner/dashboard');
        });
      }
    }
  }

  return client;
}
  */
 // src/lib/supabase.client.ts
import { createClient } from '@supabase/supabase-js';

export const createSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};