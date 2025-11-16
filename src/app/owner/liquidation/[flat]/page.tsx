'use client';

import { useState, useEffect, useCallback } from 'react';
import { createSupabaseClient } from '@/lib/supabase.client';
import { useParams } from 'next/navigation';

interface Sale {
  check_in: string;
  net_sales: number;
  month: string;
}

interface Owner {
  name: string;
  nif: string;
  email: string;
  phone: string;
  address: string;
}

export default function LiquidationPage() {
  const params = useParams();
  const flatName = decodeURIComponent(params.flat as string);

  const [view, setView] = useState<'Per month' | 'Quarterly'>('Per month');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [owner, setOwner] = useState<Owner | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createSupabaseClient();

  // === FETCH OWNER (ONCE) ===
  useEffect(() => {
    const fetchOwner = async () => {
      const { data } = await supabase
        .from('owners')
        .select('name, nif, email, phone, address')
        .ilike('flat_name', flatName)
        .single();

      if (data) {
        setOwner({
          name: data.name || 'Unknown',
          nif: data.nif || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
        });
      }
    };
    fetchOwner();
  }, [flatName, supabase]);

  // === FETCH MONTHS & SALES (ONCE PER FLAT) ===
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('detail_sales')
        .select('check_in, net_sales, month')
        .eq('flat_name', flatName)
        .not('check_in', 'is', null)
        .order('check_in', { ascending: true });

      if (data && data.length > 0) {
        setSales(data);
        const months = [...new Set(data.map(s => s.month))].filter(Boolean).sort();
        setAvailableMonths(months);
        setSelectedPeriod(months[0]); // Auto-select first
      }
      setLoading(false);
    };
    fetchData();
  }, [flatName, supabase]);

  // === FILTER LOGIC (PURE JS - NO RE-RENDER LOOP) ===
  const filteredSales = useCallback(() => {
    if (!selectedPeriod || sales.length === 0) return [];

    if (view === 'Per month') {
      return sales.filter(s => s.month === selectedPeriod);
    }

    // Quarterly
    const qMatch = selectedPeriod.match(/Q(\d)/);
    if (!qMatch) return [];
    const q = parseInt(qMatch[1]);
    const start = String((q - 1) * 3 + 1).padStart(2, '0');
    const end = String(q * 3).padStart(2, '0');
    return sales.filter(s => {
      const m = s.month.split('-')[1];
      return m >= start && m <= end;
    });
  }, [sales, selectedPeriod, view]);

  const stats = useCallback(() => {
    const filtered = filteredSales();
    if (filtered.length === 0) return null;

    const brutoTotal = filtered.reduce((sum, s) => sum + s.net_sales, 0);
    const commission = brutoTotal * 0.15;
    const extras = 50;
    const igic = (commission + extras) * 0.07;
    const ownerNetto = brutoTotal - commission - extras - igic;

    return { brutoTotal, commission, extras, igic, ownerNetto };
  }, [filteredSales])();

  const quarters = ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025'];
  const periods = view === 'Per month' ? availableMonths : quarters;

  // Reset period on view change
  useEffect(() => {
    setSelectedPeriod(periods[0] || '');
  }, [view]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">View</label>
            <select
              value={view}
              onChange={(e) => setView(e.target.value as any)}
              className="w-full p-3 border rounded-lg"
            >
              <option>Per month</option>
              <option>Quarterly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {view === 'Per month' ? 'Month' : 'Quarter'}
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full p-3 border rounded-lg"
              disabled={periods.length === 0}
            >
              <option value="">Select...</option>
              {periods.map(p => (
                <option key={p} value={p}>
                  {view === 'Per month' ? p.replace('-', ' / ') : p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Year</label>
            <select className="w-full p-3 border rounded-lg" disabled>
              <option>2025</option>
            </select>
          </div>
        </div>
        {view === 'Quarterly' && (
          <p className="text-xs text-gray-500 mt-2">
            Note: Commission bills are only available in quarterly view.
          </p>
        )}
      </div>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : !stats ? (
        <p className="text-center text-gray-500">No data for selected period.</p>
      ) : (
        <>
          {/* Inputs & Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-xl font-semibold mb-4">Inputs</h2>
              <InputRow label="Bruto total" value={stats.brutoTotal.toFixed(2)} />
              <InputRow label="Commission" value={stats.commission.toFixed(2)} />
              <InputRow label="Extras" value={stats.extras.toFixed(2)} />
              <div className="text-xs text-gray-500 mt-4">Positive value = cost deduction.</div>
              <InputRow label="IGIC (%)" value="7" />
              <div className="text-xs text-gray-500 mt-1">
                Applies to (Commission + Extras) as a tax multiplier.
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-xl font-semibold mb-4">Summary</h2>
              <SummaryRow label="Month" value={selectedPeriod.replace('-', ' / 2025')} />
              <SummaryRow label="Bruto total" value={`${stats.brutoTotal.toFixed(2)} €`} />
              <SummaryRow label="Commission" value={`${stats.commission.toFixed(2)} €`} />
              <SummaryRow label="Extras" value={`${stats.extras.toFixed(2)} €`} />
              <SummaryRow label="IGIC (7%)" value={`${stats.igic.toFixed(2)} €`} />
              <div className="mt-6 p-4 bg-green-100 rounded-lg">
                <SummaryRow label="Owner Netto" value={`${stats.ownerNetto.toFixed(2)} €`} bold highlight />
              </div>
              <p className="text-xs text-gray-600 mt-4">
                Formula: Owner Netto = Bruto total - Commission - Extras - IGIC
              </p>
            </div>
          </div>

          {/* Invoice & Owner */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">Invoice & Owner</h2>
            <div className="flex flex-col md:flex-row gap-4 items-start">
              <div className="flex-1">
                <label className="block text-sm font-medium">Invoice number</label>
                <input
                  type="text"
                  defaultValue={`2025-${selectedPeriod.split('-')[1] || 'XX'}-0001`}
                  className="w-full p-3 border rounded mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Set the first invoice number for this period. You can overwrite it anytime.
                </p>
              </div>
              <button className="px-4 py-2 bg-gray-200 rounded-lg flex items-center gap-2 mt-6">
                Edit owner details
              </button>
            </div>
          </div>

          {/* Datos del propietario */}
          <div className="bg-white p-6 rounded-xl shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Datos del propietario</h2>
              <button className="px-4 py-2 bg-gray-200 rounded-lg flex items-center gap-2">
                Editar
              </button>
            </div>
            {owner ? (
              <p className="text-sm">
                {owner.name} ({owner.nif}) — {owner.email} - {owner.phone}<br />
                {owner.address}
              </p>
            ) : (
              <p className="text-sm text-gray-500">No owner data found.</p>
            )}
          </div>

          {/* Documents */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">Documents</h2>
            <div className="flex flex-wrap gap-4">
              <DownloadBtn label="Download Management Bill (PDF)" href={`/api/pdf/management?flat=${encodeURIComponent(flatName)}&period=${selectedPeriod}`} />
              <DownloadBtn label="Download Reservation Statement (Owner)" href={`/api/excel/reservation?flat=${encodeURIComponent(flatName)}&period=${selectedPeriod}`} />
              <DownloadBtn label="Download Receiving Bill (Owner) (PDF)" href={`/api/pdf/receiving?flat=${encodeURIComponent(flatName)}&period=${selectedPeriod}`} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const InputRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between py-2 border-b last:border-0">
    <span>{label}</span>
    <span className="font-medium">{value} €</span>
  </div>
);

const SummaryRow = ({ label, value, bold, highlight }: { label: string; value: string; bold?: boolean; highlight?: boolean }) => (
  <div className={`flex justify-between py-2 ${bold ? 'font-bold' : ''} ${highlight ? 'text-green-700' : ''}`}>
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

const DownloadBtn = ({ label, href }: { label: string; href: string }) => (
  <a
    href={href}
    className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 flex items-center gap-2 text-sm"
  >
    {label}
  </a>
);