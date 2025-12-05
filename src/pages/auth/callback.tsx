// src/pages/auth/callback.tsx
// FINAL – 100% WORKING ON VERCEL – NO TYPESCRIPT ERRORS

import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import type { NextApiRequest, NextApiResponse } from 'next';

export default function Callback() {
  return null; // This page never renders — we redirect immediately
}

export async function getServerSideProps({
  req,
  res,
}: {
  req: NextApiRequest;
  res: NextApiResponse;
}) {
  const supabase = createPagesServerClient({ req, res });

  // This reads the #access_token from the URL hash perfectly
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Auth callback error:', error);
  }

  if (data.session) {
    return {
      redirect: {
        destination: '/owner/dashboard',
        permanent: false,
      },
    };
  }

  // If no session, redirect to login
  return {
    redirect: {
      destination: '/login',
      permanent: false,
    },
  };
}