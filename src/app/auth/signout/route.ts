import { createSupabaseClient } from '@/lib/supabase.client';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = createSupabaseClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/admin/login', 'http://localhost:3000'));
}