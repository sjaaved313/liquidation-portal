import { useState, useEffect } from 'react';
import { createSupabaseClient } from '@/lib/supabase.client';
import { Session, AuthChangeEvent } from '@supabase/supabase-js';

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const supabase = createSupabaseClient();

  useEffect(() => {
    let mounted = true;
    console.log('Checking initial session...');
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      if (mounted) setSession(data.session);
    }).catch(console.error);

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        console.log('Auth state changed:', event, session);
        if (mounted) setSession(session);
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  return session;
}