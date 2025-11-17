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
  const supabase = createSupabaseClient();

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const userEmail = session.user.email?.toLowerCase();

      // Step 1: Get all flats owned by this email
      const { data: ownedProperties } = await supabase
  .from('properties')
  .select('id, name')
  .eq('owner_email', userEmail);

      if (!ownedProperties || ownedProperties.length === 0) {
        setLoading(false);
        return;
      }

      const flatNames = ownedProperties.map(p => p.name);

      // Step 2: Find owner whose flats[] contains any of these flat names
      const { data: owners } = await supabase
        .from('owners')
        .select('name, nif_id, email, address, flats');

      let matchedOwner = null;

      for (const owner of owners || []) {
        if (!Array.isArray(owner.flats)) continue;

        //const hasMatch = owner.flats.some((flat: string) =>
        //  flatNames.includes(flat.trim())
        //);

        const hasMatch = owner.flats.some((dbFlat: string) => {
  const cleanDb = dbFlat.trim()
    .replace(/[–—]/g, '-')    // ← Replace en-dash & em-dash with normal hyphen
    .replace(/\s+/g, ' ');

  return flatNames.some(userFlat =>
    userFlat.trim().replace(/\s+/g, ' ') === cleanDb
  );
});

        if (hasMatch) {
          matchedOwner = {
            name: owner.name || 'Unknown',
            nif_id: owner.nif_id || 'N/A',
            email: owner.email || 'No email',
            address: owner.address || 'No address',
          };
          break;
        }
      }

      setOwnerInfo(matchedOwner);
      setProperties(ownedProperties);
      setLoading(false);
    };

    init();
  }, [supabase]);

  if (loading) return <div className="p-8 text-center">Cargando portal...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* OWNER INFO CARD */}
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
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <p className="text-yellow-800">
            Owner details not found. Please check if your flat is listed in the <code>owners.flats</code> array.
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