'use client';

import { useState, useEffect } from 'react';
import { createSupabaseClient } from '@/lib/supabase.client';
import { useParams, useRouter } from 'next/navigation';

interface Owner {
  name: string;
  nif: string;
  email: string;
  phone: string;
  address: string;
}

export default function LiquidationPage() {
  const params = useParams();
  const router = useRouter();
  const flatName = decodeURIComponent(params.flat as string);

  const [view, setView] = useState<'Per month' | 'Quarterly'>('Per month');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [stats, setStats] = useState<{
    brutoTotal: number;
    commission: number;
    extras: number;
    igic: number;
    ownerNetto: number;
  } | null>(null);
  const [owner, setOwner] = useState<Owner | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createSupabaseClient();

  // AUTH GUARD
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') router.push('/login');
    });
    return () => subscription.unsubscribe();
  }, [supabase, router]);

  // FETCH OWNER
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

  // FETCH MONTHS
  useEffect(() => {
    const fetchMonths = async () => {
      const { data } = await supabase
        .from('detail_sales')
        .select('month')
        .eq('flat_name', flatName)
        .order('month', { ascending: true });

      if (data) {
        const months = [...new Set(data.map(d => d.month))].filter(Boolean).sort();
        setAvailableMonths(months);
        if (months.length > 0 && !selectedPeriod) {
          setSelectedPeriod(months[0]);
        }
      }
    };
    fetchMonths();
  }, [flatName, supabase]);

  // FETCH STATS + EXTRAS FROM pnl_by_flat
  useEffect(() => {
    const fetchStats = async () => {
      if (!selectedPeriod) return;

      setLoading(true);
      let brutoTotal = 0;
      let extras = 0;

      // 1. FETCH NET SALES
      let salesQuery = supabase
        .from('detail_sales')
        .select('net_sales')
        .eq('flat_name', flatName);

      if (view === 'Per month') {
        salesQuery = salesQuery.eq('month', selectedPeriod);
      } else {
        const qMatch = selectedPeriod.match(/Q(\d)/);
        if (qMatch) {
          const q = parseInt(qMatch[1]);
          const start = String((q - 1) * 3 + 1).padStart(2, '0');
          const end = String(q * 3).padStart(2, '0');
          salesQuery = salesQuery.gte('month', `2025-${start}`).lte('month', `2025-${end}`);
        }
      }

      const { data: salesData } = await salesQuery;
      if (salesData) {
        brutoTotal = salesData.reduce((sum, r) => sum + r.net_sales, 0);
      }

      // 2. FETCH EXTRAS FROM pnl_by_flat (ONCE PER MONTH)
      if (view === 'Per month') {
        const { data: pnlData } = await supabase
          .from('pnl_by_flat')
          .select('additional_expenses')
          .eq('flat_name', flatName)
          .eq('month', selectedPeriod)
          .single();

        extras = pnlData?.additional_expenses ?? 0;
      } else {
        // Quarterly: sum extras from 3 months
        const qMatch = selectedPeriod.match(/Q(\d)/);
        if (qMatch) {
          const q = parseInt(qMatch[1]);
          const start = String((q - 1) * 3 + 1).padStart(2, '0');
          const end = String(q * 3).padStart(2, '0');
          const { data: pnlData } = await supabase
            .from('pnl_by_flat')
            .select('additional_expenses')
            .eq('flat_name', flatName)
            .gte('month', `2025-${start}`)
            .lte('month', `2025-${end}`);

          extras = pnlData?.reduce((s, r) => s + (r.additional_expenses || 0), 0) ?? 0;
        }
      }

      const commission = brutoTotal * 0.15;
      const igic = (commission + extras) * 0.07;
      const ownerNetto = brutoTotal - commission - extras - igic;

      setStats({ brutoTotal, commission, extras, igic, ownerNetto });
      setLoading(false);
    };

    fetchStats();
  }, [selectedPeriod, view, flatName, supabase]);

  // QUARTERS
  const quarters = ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025'];
  const periods = view === 'Per month' ? availableMonths : quarters;

  // Reset period only if switching view
  useEffect(() => {
    if (view === 'Per month' && availableMonths.length > 0 && !availableMonths.includes(selectedPeriod)) {
      setSelectedPeriod(availableMonths[0]);
    } else if (view === 'Quarterly' && !quarters.includes(selectedPeriod)) {
      setSelectedPeriod(quarters[0]);
    }
  }, [view, availableMonths]);

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
              {periods.map((p) => (
                <option key={p} value={p}>
                  {p.replace('-', ' / ')}
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
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
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
              <InputRow label="IGIC (%)" value="7" />
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-xl font-semibold mb-4">Summary</h2>
              <SummaryRow label="Period" value={selectedPeriod.replace('-', ' / 2025')} />
              <SummaryRow label="Bruto total" value={`${stats.brutoTotal.toFixed(2)} €`} />
              <SummaryRow label="Commission" value={`${stats.commission.toFixed(2)} €`} />
              <SummaryRow label="Extras" value={`${stats.extras.toFixed(2)} €`} />
              <SummaryRow label="IGIC (7%)" value={`${stats.igic.toFixed(2)} €`} />
              <div className="mt-6 p-4 bg-green-100 rounded-lg">
                <SummaryRow label="Owner Netto" value={`${stats.ownerNetto.toFixed(2)} €`} bold highlight />
              </div>
            </div>
          </div>

          {/* Owner & Docs */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">Datos del propietario</h2>
            {owner ? (
              <p className="text-sm">
                {owner.name} ({owner.nif}) — {owner.email} - {owner.phone}<br />
                {owner.address}
              </p>
            ) : (
              <p className="text-sm text-gray-500">No owner data found.</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-4">Documents</h2>
            <div className="flex flex-wrap gap-4">
              <DownloadBtn
                label="Management Bill (PDF)"
                href={`/api/pdf/management?flat=${encodeURIComponent(flatName)}&period=${selectedPeriod}`}
              />
              <DownloadBtn
                label="Reservation Statement"
                href={`/api/excel/reservation?flat=${encodeURIComponent(flatName)}&period=${selectedPeriod}`}
              />
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

const SummaryRow = ({ label, value, bold, highlight }: any) => (
  <div className={`flex justify-between py-2 ${bold ? 'font-bold' : ''} ${highlight ? 'text-green-700' : ''}`}>
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

const DownloadBtn = ({ label, href }: { label: string; href: string }) => (
  <a href={href} className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 text-sm">
    {label}
  </a>
);