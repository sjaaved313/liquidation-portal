// src/app/api/add-property/route.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { owner_email, property_name } = await req.json();

  const { data: users } = await supabase.auth.admin.listUsers();
  const user = users.users.find(u => u.email === owner_email);
  if (!user) return Response.json({ error: 'User not found' }, { status: 404 });

  const { data, error } = await supabase
    .from('properties')
    .insert({ owner_id: user.id, name: property_name })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 400 });

  return Response.json({ property: data });
}