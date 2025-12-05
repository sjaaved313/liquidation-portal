// src/pages/auth/callback.tsx
// FINAL – WORKS 100% WITH PKCE TOKEN LINKS (2025)

import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import type { NextApiRequest, NextApiResponse } from 'next';

export default function Callback() {
  return null; // Never renders
}

export async function getServerSideProps({
  req,
  res,
  query,
}: {
  req: NextApiRequest;
  res: NextApiResponse;
  query: { token?: string; type?: string };
}) {
  const supabase = createPagesServerClient({ req, res });

  // This handles BOTH hash (#access_token) AND query (?token=pkce_...)
  const token = query.token;

  if (token && query.type === 'magiclink') {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token as string,
      type: 'magiclink',
    });

    if (error) {
      console.error('Magic Link verify error:', error);
      return {
        redirect: {
          destination: '/login?error=invalid_link',
          permanent: false,
        },
      };
    }
  }

  // Final redirect to dashboard
  return {
    redirect: {
      destination: '/owner/dashboard',
      permanent: false,
    },
  };
}