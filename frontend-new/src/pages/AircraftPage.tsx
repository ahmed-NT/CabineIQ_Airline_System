import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aircraftAPI, seatsAPI } from '@/lib/api';
import type { Aircraft } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import { TbPlane, TbPlus, TbX, TbArmchair } from 'react-icons/tb';

const EMPTY_FORM = {
  aircraftCode: '',
  model: '',
  registration: '',
  totalRows: '20',
  seatsPerRow: '6',
  status: 'ACTIVE',
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#22c55e',
  MAINTENANCE: '#f59e0b',
  RETIRED: '#6b7280',
};

export default function AircraftPage() {
  const { isDark } = useTheme();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [genId, setGenId] = useState<number | null>(null);

  const { data: aircraft = [], isLoading } = useQuery({
    queryKey: ['aircraft'],
    queryFn: () => aircraftAPI.getAll().then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof EMPTY_FORM) =>
      aircraftAPI.create({
        ...data,
        totalRows: Number(data.totalRows),
        seatsPerRow: Number(data.seatsPerRow),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aircraft'] });
      setShowModal(false);
      setForm(EMPTY_FORM);
    },
  });

  const genSeatsMutation = useMutation({
    mutationFn: (ac: Aircraft) =>
      seatsAPI.generateSeats({
        aircraftId: ac.id,
        totalRows: ac.totalRows,
        seatsPerRow: ac.seatsPerRow,
      }),
    onSuccess: () => setGenId(null),
  });

  const bg = isDark ? '#07162c' : '#f8fafc';
  const card = isDark ? '#071628' : 'white';
  const border = isDark ? '#1a3050' : '#e5e7eb';
  const textPrimary = isDark ? 'white' : '#1a1a2e';
  const textMuted = isDark ? '#4a7aab' : '#6b7280';
  const inputBg = isDark ? '#0a1e38' : '#f9fafb';

  const canSubmit = form.aircraftCode && form.model && form.registration &&
    Number(form.totalRows) > 0 && Number(form.seatsPerRow) > 0;

  return (
    <div className="h-full overflow-y-auto p-6 space-y-4" style={{ background: bg }}>
      <div className="flex items-center gap-3 mb-6">
        <TbPlane className="w-6 h-6 text-[#C41E3A]" />
        <h1 className="text-2xl font-bold" style={{ color: textPrimary }}>Aircraft Fleet</h1>
        <span className="ml-auto text-sm mr-3" style={{ color: textMuted }}>
          {(aircraft as Aircraft[]).length} aircraft
        </span>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: '#C41E3A' }}
        >
          <TbPlus className="w-4 h-4" />
          Add Aircraft
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 rounded-xl animate-pulse"
              style={{ background: isDark ? '#0a1e38' : '#e5e7eb' }} />
          ))}
        </div>
      ) : (aircraft as Aircraft[]).length === 0 ? (
        <div className="flex flex-col items-center justify-center h-60 gap-3">
          <TbPlane className="w-12 h-12 opacity-20" style={{ color: textMuted }} />
          <p className="text-sm" style={{ color: textMuted }}>No aircraft registered yet</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: '#C41E3A' }}
          >
            Add first aircraft
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {(aircraft as Aircraft[]).map((ac) => (
            <div key={ac.id} className="rounded-xl border p-4 space-y-3"
              style={{ background: card, borderColor: border }}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-lg" style={{ color: textPrimary }}>{ac.aircraftCode}</span>
                  <p className="text-xs" style={{ color: textMuted }}>{ac.model}</p>
                </div>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: STATUS_COLORS[ac.status] + '22',
                    color: STATUS_COLORS[ac.status],
                  }}
                >
                  {ac.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: 'Reg', value: ac.registration },
                  { label: 'Rows', value: ac.totalRows },
                  { label: 'Seats', value: ac.totalSeats ?? ac.totalRows * ac.seatsPerRow },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg p-2"
                    style={{ background: isDark ? '#0a1e38' : '#f9fafb' }}>
                    <div className="text-[10px] uppercase tracking-wider" style={{ color: textMuted }}>{label}</div>
                    <div className="text-sm font-bold mt-0.5" style={{ color: textPrimary }}>{value}</div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  setGenId(ac.id);
                  genSeatsMutation.mutate(ac);
                }}
                disabled={genSeatsMutation.isPending && genId === ac.id}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold border transition-opacity disabled:opacity-50"
                style={{ borderColor: '#38bdf8', color: '#38bdf8' }}
              >
                <TbArmchair className="w-3.5 h-3.5" />
                {genSeatsMutation.isPending && genId === ac.id ? 'Generating…' : 'Generate / Reset Seats'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-md rounded-2xl border p-6 space-y-4"
            style={{ background: isDark ? '#071628' : 'white', borderColor: border }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold" style={{ color: textPrimary }}>Add Aircraft</h2>
              <button onClick={() => { setShowModal(false); setForm(EMPTY_FORM); }}>
                <TbX className="w-5 h-5" style={{ color: textMuted }} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {([
                ['Aircraft Code', 'aircraftCode'],
                ['Model', 'model'],
                ['Registration', 'registration'],
                ['Total Rows', 'totalRows', 'number'],
                ['Seats Per Row', 'seatsPerRow', 'number'],
              ] as [string, keyof typeof EMPTY_FORM, string?][]).map(([label, key, type]) => (
                <div key={key}>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: textMuted }}>
                    {label}
                  </label>
                  <input
                    type={type ?? 'text'}
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ background: inputBg, borderColor: border, color: textPrimary }}
                  />
                </div>
              ))}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: textMuted }}>
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                  style={{ background: inputBg, borderColor: border, color: textPrimary }}
                >
                  {['ACTIVE', 'MAINTENANCE', 'RETIRED'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            {createMutation.isError && (
              <p className="text-xs text-red-400">Failed to create aircraft.</p>
            )}
            <button
              onClick={() => createMutation.mutate(form)}
              disabled={!canSubmit || createMutation.isPending}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-40"
              style={{ background: '#C41E3A' }}
            >
              {createMutation.isPending ? 'Creating…' : 'Create Aircraft'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
