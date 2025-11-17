'use client';

import { useEffect, useState } from 'react';
import { createSupabaseClient } from '@/lib/supabase.client';
import Link from 'next/link';

interface Property {
  id: string;
  name: string;
}

interface OwnerInfo {
  name: string;
  nif_id: string;
  email: string;
  address: string;
}

export default function OwnerDashboard() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [ownerInfo, setOwnerInfo] = useState<OwnerInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginEmail, setLoginEmail] = useState<string>('');
  const supabase = createSupabaseClient();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) {
        setLoading(false);
        return;
      }

      const email = session.user.email.toLowerCase().trim();
      setLoginEmail(session.user.email);

      // Get properties
      const { data: ownedProperties } = await supabase
        .from('properties')
        .select('id, name')
        .eq('owner_email', session.user.email);

      setProperties(ownedProperties || []);

      // Match owner by email (case-insensitive)
      const { data: ownerData } = await supabase
        .from('owners')
        .select('name, nif_id, email, address')
        .ilike('email', email)
        .single();

      if (ownerData) {
        setOwnerInfo({
          name: ownerData.name || 'Unknown',
          nif_id: ownerData.nif_id || 'N/A',
          email: ownerData.email || '',
          address: ownerData.address || 'No address',
        });
      }

      setLoading(false);
    };

    init();
  }, [supabase]);

  if (loading) return <div className="p-8 text-center">Cargando portal...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {ownerInfo ? (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-blue-900 mb-6">Datos del propietario</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg">
            <div><strong>Nombre:</strong> {ownerInfo.name}</div>
            <div><strong>NIF:</strong> {ownerInfo.nif_id}</div>
            <div><strong>Email:</strong> {ownerInfo.email}</div>
            <div><strong>Dirección:</strong> {ownerInfo.address}</div>
          </div>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-300 rounded-xl p-6">
          <p className="text-red-800 font-medium">Owner details not found.</p>
          <p className="text-sm text-red-700 mt-2">
            Your login email: <strong>{loginEmail}</strong>
            <br />
            Run these SQL commands in Supabase:
            <pre className="block bg-gray-800 text-white p-3 mt-3 rounded text-xs overflow-x-auto">
{`UPDATE owners 
SET email = '${loginEmail}'
WHERE flats @> '["Book Jet - Oasis Corralejo Maxi Pool"]';`}
            </pre>
          </p>
        </div>
      )}

      <h1 className="text-3xl font-bold">Mis Propiedades</h1>

      {properties.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-xl text-gray-600">No hay propiedades.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(p => (
            <Link
              key={p.id}
              href={`/owner/liquidation/${encodeURIComponent(p.name)}`}
              className="block p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all border-2 border-transparent hover:border-blue-600"
            >
              <h3 className="text-2xl font-bold text-blue-700">{p.name}</h3>
              <p className="text-sm text-gray-600 mt-3">Click to view liquidation summary</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}