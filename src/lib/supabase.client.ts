// src/lib/supabase.client.ts
import { createClient } from '@supabase/supabase-js';

export function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase env vars');
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      // redirectTo IS REMOVED — NOT SUPPORTED HERE
    },
    global: {
      // DYNAMIC REDIRECT — THIS IS THE CORRECT WAY
      headers: {
        'X-Client-Info': 'nextjs-app',
      },
    },
  });
}

// SET REDIRECT DYNAMICALLY AFTER CLIENT CREATION
if (typeof window !== 'undefined') {
  const supabase = createSupabaseClient();
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      // Optional: redirect after login
      const redirectPath = sessionStorage.getItem('supabase.redirect') || '/owner/dashboard';
      window.location.href = redirectPath;
    }
  });
}