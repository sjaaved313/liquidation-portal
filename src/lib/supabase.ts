import { createClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createClient = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
  cookies,
});

export const createServerClient = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  cookies,
});