// src/app/owner/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { createSupabaseClient } from '@/lib/supabase.client';
import Link from 'next/link';

interface Property {
  id: string;
  name: string;
}

export default function OwnerDashboard() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const supabase = createSupabaseClient();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setLoading(false);
        return;
      }

      const userEmail = session.user.email;
      setUser(session.user);

      const { data } = await supabase
        .from('properties')
        .select('id, name')
        .eq('owner_email', userEmail)
        .order('name');

      setProperties(data || []);
      setLoading(false);
    };

    init();
  }, [supabase]);

  if (loading) return <div className="p-8 text-center">Cargando portal...</div>;
  if (!user) return <div className="p-8 text-center">Acceso denegado. Inicia sesión.</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Mis Propiedades</h1>

      {properties.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-xl text-gray-600">No hay propiedades.</p>
          <p className="text-sm text-gray-500 mt-2">
            Tu email: <code>{user.email}</code>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(p => (
            <Link
              key={p.id}
              href={`/owner/liquidation/${encodeURIComponent(p.name)}`}
              className="block p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-600"
            >
              <h3 className="text-xl font-semibold text-blue-700">{p.name}</h3>
              <p className="text-sm text-gray-600 mt-2">Click to view liquidation summary</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}