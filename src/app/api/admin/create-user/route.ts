// src/app/api/admin/create-user/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const POST = async (req: NextRequest) => {
  try {
    const { email, name, nif_id, password, role } = await req.json();
    if (!email || !password || !['owner', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: { user }, error: authError } = await supabase.auth.admin.createUser({
      email, password, email_confirm: true, user_metadata: { role, name, nif_id }
    });

    if (authError || !user) return NextResponse.json({ error: authError?.message || 'User creation failed' }, { status: 400 });

    const table = role === 'admin' ? 'admins' : 'owners';
    const payload: any = { id: user.id, email };
    if (name) payload.name = name;
    if (nif_id) payload.nif_id = nif_id;

    const { error: insertError } = await supabase.from(table).insert(payload);

    if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

    return NextResponse.json({ message: `${role} created: ${email}` });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
};