import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { flightsAPI, aircraftAPI } from '@/lib/api';
import type { Flight, Aircraft } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import { TbPlane, TbClock, TbMapPin, TbPlus, TbTrash, TbX, TbEdit, TbSearch } from 'react-icons/tb';

const statusColors: Record<string, string> = {
  SCHEDULED: 'bg-gray-500',
  BOARDING: 'bg-green-500',
  DEPARTED: 'bg-blue-500',
  ARRIVED: 'bg-purple-500',
  DELAYED: 'bg-amber-500',
  CANCELLED: 'bg-red-500',
};

const EMPTY_FORM = {
  flightNumber: '',
  origin: '',
  destination: '',
  departureTime: '',
  arrivalTime: '',
  aircraftId: '',
  gate: '',
  status: 'SCHEDULED',
};

function toLocalInput(isoString: string) {
  if (!isoString) return '';
  // datetime-local needs "YYYY-MM-DDTHH:mm"
  return isoString.slice(0, 16);
}

export default function FlightsPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Edit state
  const [editFlight, setEditFlight] = useState<Flight | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);

  const { data: flights = [], isLoading } = useQuery({
    queryKey: ['flights'],
    queryFn: () => flightsAPI.getAll().then((r) => r.data),
  });

  const { data: aircraft = [] } = useQuery({
    queryKey: ['aircraft'],
    queryFn: () => aircraftAPI.getAll().then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof EMPTY_FORM) =>
      flightsAPI.create({ ...data, aircraftId: Number(data.aircraftId) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flights'] });
      setShowModal(false);
      setForm(EMPTY_FORM);
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      flightsAPI.update(editFlight!.id, {
        ...editForm,
        aircraftId: Number(editForm.aircraftId),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flights'] });
      setEditFlight(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => flightsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flights'] });
      setDeleteId(null);
    },
  });

  function openEdit(flight: Flight) {
    setEditFlight(flight);
    setEditForm({
      flightNumber: flight.flightNumber,
      origin: flight.origin,
      destination: flight.destination,
      departureTime: toLocalInput(flight.departureTime),
      arrivalTime: toLocalInput(flight.arrivalTime),
      aircraftId: String(flight.aircraftId),
      gate: flight.gate ?? '',
      status: flight.status,
    });
  }

  const bg = isDark ? '#07162c' : '#f8fafc';
  const card = isDark ? '#071628' : 'white';
  const border = isDark ? '#1a3050' : '#e5e7eb';
  const textPrimary = isDark ? 'white' : '#1a1a2e';
  const textMuted = isDark ? '#4a7aab' : '#6b7280';
  const inputBg = isDark ? '#0a1e38' : '#f9fafb';
  const inputStyle = { background: inputBg, borderColor: border, color: textPrimary };

  function renderFields(
    f: typeof EMPTY_FORM,
    setF: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>,
  ) {
    const inp = (label: string, key: keyof typeof EMPTY_FORM, type = 'text') => (
      <div key={key}>
        <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: textMuted }}>{label}</label>
        <input type={type} value={f[key]}
          onChange={(e) => setF((prev) => ({ ...prev, [key]: e.target.value }))}
          className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
          style={inputStyle} />
      </div>
    );
    return (
      <>
        <div className="grid grid-cols-2 gap-3">
          {inp('Flight Number', 'flightNumber')}
          {inp('Gate', 'gate')}
          {inp('Origin', 'origin')}
          {inp('Destination', 'destination')}
          {inp('Departure', 'departureTime', 'datetime-local')}
          {inp('Arrival', 'arrivalTime', 'datetime-local')}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: textMuted }}>Aircraft</label>
            <select value={f.aircraftId} onChange={(e) => setF((prev) => ({ ...prev, aircraftId: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={inputStyle}>
              <option value="">Select aircraft</option>
              {(aircraft as Aircraft[]).map((a) => (
                <option key={a.id} value={a.id}>{a.aircraftCode} — {a.model}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: textMuted }}>Status</label>
            <select value={f.status} onChange={(e) => setF((prev) => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={inputStyle}>
              {['SCHEDULED', 'BOARDING', 'DEPARTED', 'ARRIVED', 'DELAYED', 'CANCELLED'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </>
    );
  }

  const canSubmit = (f: typeof EMPTY_FORM) =>
    f.flightNumber && f.origin && f.destination && f.departureTime && f.arrivalTime && f.aircraftId;

  const filtered = (flights as Flight[]).filter((f) => {
    const q = search.toLowerCase();
    const matchSearch = !q || f.flightNumber.toLowerCase().includes(q) ||
      f.origin.toLowerCase().includes(q) || f.destination.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'ALL' || f.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="h-full overflow-y-auto p-6 space-y-4" style={{ background: bg }}>
      <div className="flex items-center gap-3 mb-6">
        <TbPlane className="w-6 h-6 text-[#C41E3A]" />
        <h1 className="text-2xl font-bold" style={{ color: textPrimary }}>Flight Management</h1>
        <span className="ml-auto text-sm mr-3" style={{ color: textMuted }}>{flights.length} flights</span>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: '#C41E3A' }}
        >
          <TbPlus className="w-4 h-4" />
          New Flight
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
            placeholder="Search flight, route…"
            className="w-full pl-9 pr-3 py-2 rounded-xl border text-sm outline-none"
            style={{ background: card, borderColor: border, color: textPrimary }}
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {['ALL', 'SCHEDULED', 'BOARDING', 'DEPARTED', 'ARRIVED', 'DELAYED', 'CANCELLED'].map((s) => (
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
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 rounded-xl animate-pulse"
              style={{ background: isDark ? '#0a1e38' : '#e5e7eb' }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((flight) => (
            <div
              key={flight.id}
              className="rounded-xl border p-4 hover:shadow-md transition-shadow cursor-pointer relative group"
              style={{ background: card, borderColor: border }}
              onClick={() => navigate(`/flights/${flight.id}`)}
            >
              {/* Edit + Delete buttons on hover */}
              <div className="absolute top-14 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); openEdit(flight); }}
                  className="p-1 rounded-lg"
                  style={{ background: isDark ? '#1a3050' : '#f3f4f6', color: '#38bdf8' }}
                >
                  <TbEdit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteId(flight.id); }}
                  className="p-1 rounded-lg"
                  style={{ background: isDark ? '#1a3050' : '#f3f4f6', color: '#ef4444' }}
                >
                  <TbTrash className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TbPlane className="w-4 h-4 text-[#C41E3A]" />
                  <span className="font-bold text-lg" style={{ color: textPrimary }}>{flight.flightNumber}</span>
                </div>
                <span className={`text-xs text-white px-2 py-0.5 rounded-full font-medium ${statusColors[flight.status] ?? 'bg-gray-400'}`}>
                  {flight.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm mb-2" style={{ color: textMuted }}>
                <TbMapPin className="w-3.5 h-3.5" />
                <span>{flight.origin} → {flight.destination}</span>
              </div>
              <div className="flex items-center gap-2 text-sm" style={{ color: textMuted }}>
                <TbClock className="w-3.5 h-3.5" />
                <span>
                  {flight.departureTime
                    ? new Date(flight.departureTime).toUTCString().slice(17, 22)
                    : '--'}
                  {' → '}
                  {flight.arrivalTime
                    ? new Date(flight.arrivalTime).toUTCString().slice(17, 22)
                    : '--'}{' '}UTC
                </span>
                {flight.gate && <span className="ml-auto">Gate {flight.gate}</span>}
              </div>
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
              <h2 className="text-lg font-bold" style={{ color: textPrimary }}>New Flight</h2>
              <button onClick={() => { setShowModal(false); setForm(EMPTY_FORM); }}>
                <TbX className="w-5 h-5" style={{ color: textMuted }} />
              </button>
            </div>
            {renderFields(form, setForm)}
            {createMutation.isError && (
              <p className="text-xs text-red-400">Failed to create flight. Check all fields.</p>
            )}
            <button
              onClick={() => createMutation.mutate(form)}
              disabled={!canSubmit(form) || createMutation.isPending}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-40"
              style={{ background: '#C41E3A' }}
            >
              {createMutation.isPending ? 'Creating…' : 'Create Flight'}
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editFlight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-md rounded-2xl border p-6 space-y-4"
            style={{ background: isDark ? '#071628' : 'white', borderColor: border }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold" style={{ color: textPrimary }}>
                Edit Flight <span style={{ color: '#C41E3A' }}>{editFlight.flightNumber}</span>
              </h2>
              <button onClick={() => setEditFlight(null)}>
                <TbX className="w-5 h-5" style={{ color: textMuted }} />
              </button>
            </div>
            {renderFields(editForm, setEditForm)}
            {updateMutation.isError && (
              <p className="text-xs text-red-400">Update failed. Check all fields.</p>
            )}
            <button
              onClick={() => updateMutation.mutate()}
              disabled={!canSubmit(editForm) || updateMutation.isPending}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-40"
              style={{ background: '#C41E3A' }}
            >
              {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-sm rounded-2xl border p-6 space-y-4"
            style={{ background: isDark ? '#071628' : 'white', borderColor: border }}>
            <h2 className="text-lg font-bold" style={{ color: textPrimary }}>Delete Flight?</h2>
            <p className="text-sm" style={{ color: textMuted }}>This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-2 rounded-xl text-sm font-semibold border"
                style={{ borderColor: border, color: textMuted }}>
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteId)}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2 rounded-xl text-sm font-semibold text-white bg-red-500 disabled:opacity-40">
                {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
