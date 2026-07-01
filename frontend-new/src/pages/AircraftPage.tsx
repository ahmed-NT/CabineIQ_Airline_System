import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aircraftAPI, seatsAPI } from '@/lib/api';
import type { Aircraft } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import { TbPlane, TbPlus, TbX, TbArmchair, TbCheck, TbTrash, TbEdit, TbSearch } from 'react-icons/tb';

const RAM_MODELS = [
  {
    id: 'B737_800',
    label: 'Boeing 737-800',
    totalRows: 26,
    seatsPerRow: 6,
    totalSeats: 148,
    layoutType: 'B737_800',
    classes: ['First (rows 1–2)', 'Business (rows 3–5)', 'Economy (rows 6–26)'],
    badge: 'Narrow Body',
  },
  {
    id: 'B737_MAX8',
    label: 'Boeing 737 MAX 8',
    totalRows: 26,
    seatsPerRow: 6,
    totalSeats: 148,
    layoutType: 'B737_MAX8',
    classes: ['First (rows 1–2)', 'Business (rows 3–5)', 'Economy (rows 6–26)'],
    badge: 'Narrow Body',
  },
  {
    id: 'B787_8',
    label: 'Boeing 787-8 Dreamliner',
    totalRows: 40,
    seatsPerRow: 9,
    totalSeats: 254,
    layoutType: 'B787_8',
    classes: ['First (rows 1–3)', 'Business (rows 4–8)', 'Economy (rows 9–40)'],
    badge: 'Wide Body',
  },
  {
    id: 'B787_9',
    label: 'Boeing 787-9 Dreamliner',
    totalRows: 48,
    seatsPerRow: 9,
    totalSeats: 296,
    layoutType: 'B787_9',
    classes: [
      'First (rows 1–4)',
      'Business (rows 5–10)',
      'Economy (rows 11–48)',
    ],
    badge: 'Wide Body',
  },
  {
    id: 'ATR72',
    label: 'ATR 72-600',
    totalRows: 18,
    seatsPerRow: 4,
    totalSeats: 70,
    layoutType: 'ATR72',
    classes: ['First (rows 1–2)', 'Business (rows 3–4)', 'Economy (rows 5–18)'],
    badge: 'Regional',
  },
] as const;

type ModelId = typeof RAM_MODELS[number]['id'];

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#22c55e',
  MAINTENANCE: '#f59e0b',
  RETIRED: '#6b7280',
};

export default function AircraftPage() {
  const { isDark } = useTheme();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelId | null>(null);
  const [aircraftCode, setAircraftCode] = useState('');
  const [registration, setRegistration] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [genId, setGenId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [confirmRegenAc, setConfirmRegenAc] = useState<Aircraft | null>(null);
  const [confirmDeleteSeatsAc, setConfirmDeleteSeatsAc] = useState<Aircraft | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Edit state
  const [editAircraft, setEditAircraft] = useState<Aircraft | null>(null);
  const [editCode, setEditCode] = useState('');
  const [editReg, setEditReg] = useState('');
  const [editStatus, setEditStatus] = useState('ACTIVE');

  const { data: aircraft = [], isLoading } = useQuery({
    queryKey: ['aircraft'],
    queryFn: () => aircraftAPI.getAll().then((r) => r.data),
  });

  const template = RAM_MODELS.find((m) => m.id === selectedModel) ?? null;

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!template) return;
      const res = await aircraftAPI.create({
        aircraftCode,
        model: template.label,
        registration,
        totalRows: template.totalRows,
        seatsPerRow: template.seatsPerRow,
        totalSeats: template.totalSeats,
        layoutType: template.layoutType,
        status,
      });
      const newAircraft = res.data;
      // Seat generation is best-effort: the seat-service builds the cabin from
      // the aircraft's own definition, and the Seat Map auto-generates on first
      // view. A failure here must NOT fail the (already successful) creation.
      try {
        await seatsAPI.generateSeats({
          aircraftId: newAircraft.id,
          totalRows: template.totalRows,
          seatsPerRow: template.seatsPerRow,
          layoutType: template.layoutType,
          aircraftCode,
        });
      } catch (e) {
        console.warn('Seat generation deferred to seat map view:', e);
      }
      return newAircraft;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aircraft'] });
      setShowModal(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (ac: Aircraft) =>
      aircraftAPI.update(ac.id, {
        aircraftCode: editCode,
        model: ac.model,
        registration: editReg,
        totalRows: ac.totalRows,
        seatsPerRow: ac.seatsPerRow,
        totalSeats: ac.totalSeats,
        layoutType: ac.layoutType,
        status: editStatus,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aircraft'] });
      setEditAircraft(null);
    },
  });

  const deleteSeatsMutation = useMutation({
    mutationFn: (id: number) => seatsAPI.deleteSeats(id),
    onSuccess: () => setConfirmDeleteSeatsAc(null),
  });

  const genSeatsMutation = useMutation({
    mutationFn: (ac: Aircraft) =>
      seatsAPI.generateSeats({
        aircraftId: ac.id,
        totalRows: ac.totalRows,
        layoutType: ac.layoutType,
        aircraftCode: ac.aircraftCode,
      }),
    onSuccess: () => setGenId(null),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => aircraftAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aircraft'] });
      setConfirmDeleteId(null);
    },
  });

  function resetForm() {
    setSelectedModel(null);
    setAircraftCode('');
    setRegistration('');
    setStatus('ACTIVE');
  }

  function openEdit(ac: Aircraft) {
    setEditAircraft(ac);
    setEditCode(ac.aircraftCode);
    setEditReg(ac.registration);
    setEditStatus(ac.status);
  }

  const canSubmit = selectedModel && aircraftCode.trim() && registration.trim();

  const filtered = (aircraft as Aircraft[]).filter((ac) => {
    const q = search.toLowerCase();
    const matchSearch = !q || ac.aircraftCode.toLowerCase().includes(q) ||
      ac.model.toLowerCase().includes(q) || ac.registration.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'ALL' || ac.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const bg = isDark ? '#07162c' : '#f8fafc';
  const card = isDark ? '#071628' : 'white';
  const border = isDark ? '#1a3050' : '#e5e7eb';
  const textPrimary = isDark ? 'white' : '#1a1a2e';
  const textMuted = isDark ? '#4a7aab' : '#6b7280';
  const inputBg = isDark ? '#0a1e38' : '#f9fafb';

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

      {/* Search + filter */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <TbSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: textMuted }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search code, model, registration…"
            className="w-full pl-9 pr-3 py-2 rounded-xl border text-sm outline-none"
            style={{ background: card, borderColor: border, color: textPrimary }}
          />
        </div>
        <div className="flex gap-1">
          {['ALL', 'ACTIVE', 'MAINTENANCE', 'RETIRED'].map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all"
              style={{
                background: filterStatus === s ? '#C41E3A' : 'transparent',
                color: filterStatus === s ? 'white' : textMuted,
                borderColor: filterStatus === s ? '#C41E3A' : border,
              }}>
              {s}
            </button>
          ))}
        </div>
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
          {filtered.map((ac) => (
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
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmRegenAc(ac)}
                  disabled={genSeatsMutation.isPending && genId === ac.id}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold border transition-opacity disabled:opacity-50"
                  style={{ borderColor: '#38bdf8', color: '#38bdf8' }}
                >
                  <TbArmchair className="w-3.5 h-3.5" />
                  {genSeatsMutation.isPending && genId === ac.id ? 'Generating…' : 'Regenerate Seats'}
                </button>
                <button
                  onClick={() => setConfirmDeleteSeatsAc(ac)}
                  className="flex items-center justify-center px-3 py-2 rounded-xl border text-xs font-semibold transition-opacity"
                  style={{ borderColor: '#f59e0b', color: '#f59e0b' }}
                  title="Delete all seats"
                >
                  <TbArmchair className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openEdit(ac)}
                  className="flex items-center justify-center px-3 py-2 rounded-xl border text-xs font-semibold transition-opacity"
                  style={{ borderColor: '#38bdf8', color: '#38bdf8' }}
                >
                  <TbEdit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setConfirmDeleteId(ac.id)}
                  className="flex items-center justify-center px-3 py-2 rounded-xl border text-xs font-semibold transition-opacity"
                  style={{ borderColor: '#ef4444', color: '#ef4444' }}
                >
                  <TbTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add Aircraft Modal ──────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-lg rounded-2xl border p-6 space-y-5 max-h-[90vh] overflow-y-auto"
            style={{ background: isDark ? '#071628' : 'white', borderColor: border }}>

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold" style={{ color: textPrimary }}>Add Aircraft</h2>
              <button onClick={() => { setShowModal(false); resetForm(); }}>
                <TbX className="w-5 h-5" style={{ color: textMuted }} />
              </button>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: textMuted }}>
                1. Select Aircraft Model
              </p>
              <div className="space-y-2">
                {RAM_MODELS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedModel(m.id)}
                    className="w-full text-left rounded-xl border px-4 py-3 transition-all"
                    style={{
                      borderColor: selectedModel === m.id ? '#C41E3A' : border,
                      background: selectedModel === m.id
                        ? (isDark ? '#C41E3A18' : '#C41E3A08')
                        : inputBg,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                          style={{
                            borderColor: selectedModel === m.id ? '#C41E3A' : border,
                            background: selectedModel === m.id ? '#C41E3A' : 'transparent',
                          }}>
                          {selectedModel === m.id && <TbCheck className="w-3 h-3 text-white" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: textPrimary }}>{m.label}</p>
                          <p className="text-[11px] mt-0.5" style={{ color: textMuted }}>
                            {m.totalRows} rows · {m.totalSeats} seats · {m.classes.join(' / ')}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          background: m.badge === 'Wide Body' ? '#38bdf820' : m.badge === 'Regional' ? '#a78bfa20' : '#22c55e20',
                          color: m.badge === 'Wide Body' ? '#38bdf8' : m.badge === 'Regional' ? '#a78bfa' : '#22c55e',
                        }}>
                        {m.badge}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: textMuted }}>
                2. Aircraft Details
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: textMuted }}>Aircraft Code</label>
                  <input type="text" value={aircraftCode} onChange={(e) => setAircraftCode(e.target.value)}
                    placeholder="AT-B737-01"
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ background: inputBg, borderColor: border, color: textPrimary }} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: textMuted }}>Registration</label>
                  <input type="text" value={registration} onChange={(e) => setRegistration(e.target.value)}
                    placeholder="CN-RNV"
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ background: inputBg, borderColor: border, color: textPrimary }} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: textMuted }}>Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ background: inputBg, borderColor: border, color: textPrimary }}>
                    {['ACTIVE', 'MAINTENANCE', 'RETIRED'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {template && (
              <div className="rounded-xl p-3 text-xs space-y-1"
                style={{ background: isDark ? '#0a1e38' : '#f9fafb' }}>
                <p className="font-semibold mb-2" style={{ color: textPrimary }}>Auto-generated layout:</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: 'Total Rows', value: template.totalRows },
                    { label: 'Total Seats', value: template.totalSeats },
                    { label: 'Layout', value: template.seatsPerRow === 9 ? '3+3+3' : template.seatsPerRow === 4 ? '2+2' : '3+3' },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-lg p-2" style={{ background: isDark ? '#071628' : 'white' }}>
                      <div style={{ color: textMuted }}>{label}</div>
                      <div className="font-bold mt-0.5" style={{ color: '#C41E3A' }}>{value}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 space-y-0.5">
                  {template.classes.map((c) => (
                    <p key={c} style={{ color: textMuted }}>• {c}</p>
                  ))}
                </div>
              </div>
            )}

            {createMutation.isError && (
              <p className="text-xs text-red-400">
                {(createMutation.error as any)?.response?.data?.message
                  || 'Failed to create aircraft. Check aircraft code & registration are unique.'}
              </p>
            )}

            <button
              onClick={() => createMutation.mutate()}
              disabled={!canSubmit || createMutation.isPending}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-40"
              style={{ background: '#C41E3A' }}
            >
              {createMutation.isPending ? 'Creating & generating seats…' : 'Create Aircraft + Generate Seats'}
            </button>
          </div>
        </div>
      )}

      {/* ── Edit Aircraft Modal ──────────────────────────────────────────────── */}
      {editAircraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-sm rounded-2xl border p-6 space-y-4"
            style={{ background: isDark ? '#071628' : 'white', borderColor: border }}>

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold" style={{ color: textPrimary }}>Edit Aircraft</h2>
              <button onClick={() => setEditAircraft(null)}>
                <TbX className="w-5 h-5" style={{ color: textMuted }} />
              </button>
            </div>

            <div className="text-xs px-3 py-2 rounded-lg"
              style={{ background: isDark ? '#0a1e38' : '#f9fafb', color: textMuted }}>
              Model: <span style={{ color: textPrimary, fontWeight: 600 }}>{editAircraft.model}</span>
              &nbsp;·&nbsp;Layout: <span style={{ color: textPrimary, fontWeight: 600 }}>{editAircraft.layoutType}</span>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Aircraft Code', value: editCode, set: setEditCode, placeholder: 'AT-B737-01' },
                { label: 'Registration', value: editReg, set: setEditReg, placeholder: 'CN-RNV' },
              ].map(({ label, value, set, placeholder }) => (
                <div key={label}>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: textMuted }}>{label}</label>
                  <input type="text" value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ background: inputBg, borderColor: border, color: textPrimary }} />
                </div>
              ))}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: textMuted }}>Status</label>
                <div className="flex gap-2">
                  {['ACTIVE', 'MAINTENANCE', 'RETIRED'].map((s) => (
                    <button key={s} onClick={() => setEditStatus(s)}
                      className="flex-1 py-2 rounded-xl text-xs font-bold border transition-all"
                      style={{
                        background: editStatus === s ? STATUS_COLORS[s] + '22' : 'transparent',
                        color: editStatus === s ? STATUS_COLORS[s] : textMuted,
                        borderColor: editStatus === s ? STATUS_COLORS[s] : border,
                      }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {updateMutation.isError && (
              <p className="text-xs text-red-400">Update failed. Aircraft code may already be taken.</p>
            )}

            <button
              onClick={() => updateMutation.mutate(editAircraft)}
              disabled={!editCode.trim() || !editReg.trim() || updateMutation.isPending}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-40"
              style={{ background: '#C41E3A' }}
            >
              {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* ── Delete All Seats Confirmation ─────────────────────────────────── */}
      {confirmDeleteSeatsAc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-sm rounded-2xl border p-6 space-y-4"
            style={{ background: isDark ? '#071628' : 'white', borderColor: '#ef444440' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: '#ef444420' }}>
                <TbArmchair className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: textPrimary }}>Delete All Seats?</p>
                <p className="text-xs mt-0.5" style={{ color: textMuted }}>
                  All seats for <span style={{ color: textPrimary, fontWeight: 600 }}>{confirmDeleteSeatsAc.aircraftCode}</span> will be permanently removed.
                </p>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setConfirmDeleteSeatsAc(null)}
                className="flex-1 py-2 rounded-xl text-sm font-semibold border"
                style={{ borderColor: border, color: textMuted }}>
                Cancel
              </button>
              <button
                onClick={() => deleteSeatsMutation.mutate(confirmDeleteSeatsAc.id)}
                disabled={deleteSeatsMutation.isPending}
                className="flex-1 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: '#ef4444' }}>
                {deleteSeatsMutation.isPending ? 'Deleting…' : 'Delete All Seats'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Regenerate Seats Confirmation ─────────────────────────────────── */}
      {confirmRegenAc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-sm rounded-2xl border p-6 space-y-4"
            style={{ background: isDark ? '#071628' : 'white', borderColor: '#f59e0b40' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: '#f59e0b20' }}>
                <TbArmchair className="w-5 h-5" style={{ color: '#f59e0b' }} />
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: textPrimary }}>Regenerate Seats?</p>
                <p className="text-xs mt-0.5" style={{ color: textMuted }}>
                  This will wipe all existing seat statuses and scores for <span style={{ color: textPrimary, fontWeight: 600 }}>{confirmRegenAc.aircraftCode}</span>.
                </p>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setConfirmRegenAc(null)}
                className="flex-1 py-2 rounded-xl text-sm font-semibold border"
                style={{ borderColor: border, color: textMuted }}>
                Cancel
              </button>
              <button
                onClick={() => {
                  setGenId(confirmRegenAc.id);
                  genSeatsMutation.mutate(confirmRegenAc);
                  setConfirmRegenAc(null);
                }}
                className="flex-1 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: '#f59e0b' }}>
                Regenerate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Dialog ─────────────────────────────────────── */}
      {confirmDeleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-sm rounded-2xl border p-6 space-y-4"
            style={{ background: isDark ? '#071628' : 'white', borderColor: '#ef444440' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: '#ef444420' }}>
                <TbTrash className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: textPrimary }}>Delete Aircraft</p>
                <p className="text-xs mt-0.5" style={{ color: textMuted }}>
                  This will permanently delete the aircraft and all its seats.
                </p>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-2 rounded-xl text-sm font-semibold border"
                style={{ borderColor: border, color: textMuted }}>
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(confirmDeleteId)}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: '#ef4444' }}>
                {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
