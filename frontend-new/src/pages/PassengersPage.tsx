import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { passengersAPI, flightsAPI } from '@/lib/api';
import type { Passenger, Flight } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import ExpandableSearch from '@/components/dashboard/ExpandableSearch';
import PassengerProfilePanel from '@/components/passengers/PassengerProfilePanel';
import { TbUsers, TbChevronDown, TbPlane, TbPlus, TbTrash, TbX } from 'react-icons/tb';

const EMPTY_PASSENGER = {
  firstName: '',
  lastName: '',
  email: '',
  passportNumber: '',
  nationality: '',
  flightId: '',
  seatId: '',
  aircraftId: '',
};

const AVATAR_COLORS = [
  'bg-[#C41E3A]', 'bg-[#006233]', 'bg-[#C9A84C]',
  'bg-[#1A1A2E]', 'bg-[#38bdf8]', 'bg-[#a78bfa]',
];

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
}

export default function PassengersPage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [flightFilter, setFlightFilter] = useState<number | 'all'>('all');
  const [selectedPassenger, setSelectedPassenger] = useState<Passenger | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_PASSENGER);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: passengers = [], isLoading } = useQuery({
    queryKey: ['passengers'],
    queryFn: () => passengersAPI.getAll().then((r) => r.data),
  });

  const { data: flights = [] } = useQuery({
    queryKey: ['flights'],
    queryFn: () => flightsAPI.getAll().then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof EMPTY_PASSENGER) =>
      passengersAPI.create({
        ...data,
        flightId: Number(data.flightId) || undefined,
        aircraftId: Number(data.aircraftId) || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passengers'] });
      setShowModal(false);
      setForm(EMPTY_PASSENGER);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => passengersAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['passengers'] });
      setDeleteId(null);
      setSelectedPassenger(null);
    },
  });

  const flightMap = useMemo(() => {
    const map: Record<number, Flight> = {};
    flights.forEach((f: Flight) => { map[f.id] = f; });
    return map;
  }, [flights]);

  const filtered = useMemo(() => {
    let list = passengers as Passenger[];

    if (flightFilter !== 'all') {
      list = list.filter((p) => p.flightId === flightFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) =>
        p.firstName.toLowerCase().includes(q) ||
        p.lastName.toLowerCase().includes(q) ||
        p.fullName?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.passportNumber?.toLowerCase().includes(q) ||
        p.nationality?.toLowerCase().includes(q) ||
        p.seatId?.toLowerCase().includes(q)
      );
    }

    return [...list].sort((a, b) =>
      a.lastName.localeCompare(b.lastName) || a.firstName.localeCompare(b.firstName)
    );
  }, [passengers, flightFilter, search]);

  const selectedFlight = selectedPassenger
    ? flightMap[selectedPassenger.flightId]
    : undefined;

  const filterLabel = flightFilter === 'all'
    ? 'All Flights'
    : flightMap[flightFilter]?.flightNumber || `Flight #${flightFilter}`;

  const bg = isDark ? '#07162c' : '#f8fafc';
  const panelBg = isDark ? '#071628' : '#f8fafc';
  const border = isDark ? '#1a3050' : '#e5e7eb';
  const textPrimary = isDark ? 'white' : '#1a1a2e';
  const textSecondary = isDark ? '#4a7aab' : '#6b7280';
  const textMuted = isDark ? '#2a5080' : '#9ca3af';
  const rowHover = isDark ? '#0a1e38' : '#f9fafb';
  const rowSelected = isDark ? '#0d2040' : '#eff6ff';

  return (
    <div className="flex h-full overflow-hidden relative" style={{ background: bg }}>
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Toolbar */}
        <div
          className="h-11 flex items-center gap-3 px-4 border-b flex-shrink-0"
          style={{ background: panelBg, borderColor: border }}
        >
          <TbUsers className="w-4 h-4" style={{ color: '#38bdf8' }} />
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: textPrimary }}>
            Passenger Manifest
          </span>
          <span className="text-[10px]" style={{ color: textMuted }}>
            {filtered.length} of {passengers.length}
          </span>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-white ml-2"
            style={{ background: '#C41E3A' }}
          >
            <TbPlus className="w-3.5 h-3.5" />
            Add
          </button>

          <div className="ml-auto flex items-center gap-3 min-w-0">
            <ExpandableSearch
              value={search}
              onChange={setSearch}
              placeholder="Search name, passport, seat..."
            />

            {/* Flight filter */}
            <div className="relative">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-semibold transition-colors"
                style={{
                  background: isDark ? '#0a1e38' : '#f9fafb',
                  borderColor: border,
                  color: textSecondary,
                }}
              >
                <TbPlane className="w-3.5 h-3.5" />
                {filterLabel}
                <TbChevronDown className={`w-3 h-3 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
              </button>

              {filterOpen && (
                <div
                  className="absolute right-0 top-full mt-1 w-48 rounded-lg border shadow-lg z-20 overflow-hidden max-h-60 overflow-y-auto"
                  style={{ background: isDark ? '#0a1e38' : 'white', borderColor: border }}
                >
                  <button
                    onClick={() => { setFlightFilter('all'); setFilterOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs transition-colors"
                    style={{
                      background: flightFilter === 'all' ? (isDark ? '#0d2040' : '#eff6ff') : 'transparent',
                      color: textPrimary,
                    }}
                  >
                    All Flights
                  </button>
                  {flights.map((flight: Flight) => (
                    <button
                      key={flight.id}
                      onClick={() => { setFlightFilter(flight.id); setFilterOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs transition-colors"
                      style={{
                        background: flightFilter === flight.id ? (isDark ? '#0d2040' : '#eff6ff') : 'transparent',
                        color: textPrimary,
                      }}
                    >
                      {flight.flightNumber} · {flight.origin}→{flight.destination}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-sm" style={{ color: textMuted }}>Loading passengers...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-sm" style={{ color: textMuted }}>No passengers found</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead
                className="sticky top-0 z-10"
                style={{ background: isDark ? '#0a1e38' : '#f1f5f9' }}
              >
                <tr>
                  {['Passenger', 'Passport', 'Nationality', 'Flight', 'Seat', ''].map((col) => (
                    <th
                      key={col || 'action'}
                      className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: textMuted }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((passenger, idx) => {
                  const isSelected = selectedPassenger?.id === passenger.id;
                  const flight = flightMap[passenger.flightId];
                  const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];

                  return (
                    <tr
                      key={passenger.id}
                      onClick={() => setSelectedPassenger(isSelected ? null : passenger)}
                      className="border-b cursor-pointer transition-colors"
                      style={{
                        borderColor: isDark ? '#0d1e30' : '#f3f4f6',
                        background: isSelected ? rowSelected : 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.background = rowHover;
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold ${avatarColor}`}
                          >
                            {getInitials(passenger.firstName, passenger.lastName)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold truncate" style={{ color: textPrimary }}>
                              {passenger.firstName} {passenger.lastName}
                            </div>
                            <div className="text-[10px] truncate" style={{ color: textMuted }}>
                              {passenger.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono" style={{ color: textSecondary }}>
                          {passenger.passportNumber}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs" style={{ color: textSecondary }}>
                          {passenger.nationality}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {flight ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/flights/${flight.id}`);
                            }}
                            className="flex items-center gap-1 text-xs font-semibold transition-opacity hover:opacity-80"
                            style={{ color: '#38bdf8' }}
                          >
                            <TbPlane className="w-3 h-3" />
                            {flight.flightNumber}
                          </button>
                        ) : (
                          <span className="text-xs" style={{ color: textMuted }}>—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded"
                          style={{
                            background: isDark ? '#0a1e38' : '#f3f4f6',
                            color: '#38bdf8',
                          }}
                        >
                          {passenger.seatId || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPassenger(passenger);
                            }}
                            className="text-[10px] font-semibold px-2 py-1 rounded transition-opacity hover:opacity-80"
                            style={{ color: textSecondary }}
                          >
                            View →
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteId(passenger.id);
                            }}
                            className="p-1 rounded transition-opacity hover:opacity-80"
                            style={{ color: '#ef4444' }}
                          >
                            <TbTrash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Profile panel */}
      {selectedPassenger && (
        <PassengerProfilePanel
          passenger={selectedPassenger}
          flight={selectedFlight}
          onClose={() => setSelectedPassenger(null)}
        />
      )}

      {/* Add Passenger Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-md rounded-2xl border p-6 space-y-4"
            style={{ background: isDark ? '#071628' : 'white', borderColor: isDark ? '#1a3050' : '#e5e7eb' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold" style={{ color: isDark ? 'white' : '#1a1a2e' }}>Add Passenger</h2>
              <button onClick={() => { setShowModal(false); setForm(EMPTY_PASSENGER); }}>
                <TbX className="w-5 h-5" style={{ color: textMuted }} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {([
                ['First Name', 'firstName'],
                ['Last Name', 'lastName'],
                ['Email', 'email', 'email'],
                ['Passport No.', 'passportNumber'],
                ['Nationality', 'nationality'],
                ['Seat ID', 'seatId'],
              ] as [string, keyof typeof EMPTY_PASSENGER, string?][]).map(([label, key, type]) => (
                <div key={key}>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: textMuted }}>
                    {label}
                  </label>
                  <input
                    type={type ?? 'text'}
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                    style={{ background: isDark ? '#0a1e38' : '#f9fafb', borderColor: isDark ? '#1a3050' : '#e5e7eb', color: isDark ? 'white' : '#1a1a2e' }}
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: textMuted }}>
                Flight
              </label>
              <select
                value={form.flightId}
                onChange={(e) => setForm((f) => ({ ...f, flightId: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ background: isDark ? '#0a1e38' : '#f9fafb', borderColor: isDark ? '#1a3050' : '#e5e7eb', color: isDark ? 'white' : '#1a1a2e' }}
              >
                <option value="">No flight</option>
                {(flights as Flight[]).map((f) => (
                  <option key={f.id} value={f.id}>{f.flightNumber} — {f.origin}→{f.destination}</option>
                ))}
              </select>
            </div>
            {createMutation.isError && (
              <p className="text-xs text-red-400">Failed to add passenger.</p>
            )}
            <button
              onClick={() => createMutation.mutate(form)}
              disabled={!form.firstName || !form.lastName || !form.passportNumber || createMutation.isPending}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-40"
              style={{ background: '#C41E3A' }}
            >
              {createMutation.isPending ? 'Adding…' : 'Add Passenger'}
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-sm rounded-2xl border p-6 space-y-4"
            style={{ background: isDark ? '#071628' : 'white', borderColor: isDark ? '#1a3050' : '#e5e7eb' }}>
            <h2 className="text-lg font-bold" style={{ color: isDark ? 'white' : '#1a1a2e' }}>Delete Passenger?</h2>
            <p className="text-sm" style={{ color: textMuted }}>This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2 rounded-xl text-sm font-semibold border"
                style={{ borderColor: isDark ? '#1a3050' : '#e5e7eb', color: textMuted }}
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteId)}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2 rounded-xl text-sm font-semibold text-white bg-red-500 disabled:opacity-40"
              >
                {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
