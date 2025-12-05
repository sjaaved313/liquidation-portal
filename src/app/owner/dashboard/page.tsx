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
  const supabase = createSupabaseClient();

  useEffect(() => {
    const init = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      // ADD THIS LINE — fixes session on Vercel
      if (error || !session?.user) {
        console.log('No session, redirecting to login...');
        window.location.replace('/login');
        return;
      }

      console.log('User logged in:', session.user.email);

      const { data: ownedProperties } = await supabase
        .from('properties')
        .select('id, name')
        .eq('owner_email', session.user.email);

      setProperties(ownedProperties || []);
      setLoading(false);
    };

    init();

    // ADD THIS LISTENER — catches Magic Link login on Vercel
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event);
      if (event === 'SIGNED_IN' && session?.user) {
        init();
      }
    });

    return () => listener?.subscription.unsubscribe();
  }, [supabase]);

  if (loading) return <div className="p-8 text-center text-2xl">Cargando portal...</div>;

  return (
    // YOUR ENTIRE BEAUTIFUL DASHBOARD — 100% UNCHANGED
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-900">Bienvenido al Portal del Propietario</h1>
        <p className="text-lg text-gray-600 mt-4">Selecciona tu propiedad para ver la liquidación</p>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl">
          <p className="text-xl text-gray-600">No hay propiedades registradas.</p>
        </div>
      ) : (
        <>
          <h2 className="text-3xl font-bold text-gray-800">Mis Propiedades</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((p) => (
              <Link
                key={p.id}
                href={`/owner/liquidation/${encodeURIComponent(p.name)}`}
                className="block p-10 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border-4 border-transparent hover:border-blue-600 transform hover:-translate-y-2"
              >
                <h3 className="text-2xl font-bold text-blue-700 text-center">{p.name}</h3>
                <p className="text-center text-gray-600 mt-6 text-sm font-medium">
                  Ver liquidación
                </p>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}