import { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aircraftAPI, seatsAPI } from '@/lib/api';
import type { Aircraft, Seat, SeatRow, SeatStatus } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import Aircraft3D from '@/components/flight/Aircraft3D';
import { TbPlane, TbChevronDown, TbArmchair } from 'react-icons/tb';

const STATUS_OPTIONS: { value: SeatStatus; label: string; color: string }[] = [
  { value: 'AVAILABLE', label: 'Available', color: '#4CAF82' },
  { value: 'OCCUPIED', label: 'Occupied', color: '#C41E3A' },
  { value: 'UNAVAILABLE', label: 'Unavailable', color: '#6b7280' },
];

const CLASS_LABELS: Record<string, string> = {
  FIRST: 'First Class',
  BUSINESS: 'Business',
  ECONOMY: 'Economy',
};

export default function SeatMapPage() {
  const { isDark } = useTheme();
  const queryClient = useQueryClient();
  const [selectedAircraftId, setSelectedAircraftId] = useState<number | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const generatedAircraftIds = useRef<Set<number>>(new Set());

  const { data: aircraftList = [], isLoading: aircraftLoading } = useQuery({
    queryKey: ['aircraft'],
    queryFn: () => aircraftAPI.getAll().then((r) => r.data),
  });

  // Auto-select first aircraft when list loads (only if user hasn't manually chosen one)
  useEffect(() => {
    if (aircraftList.length > 0 && selectedAircraftId === null) {
      setSelectedAircraftId(aircraftList[0].id);
    }
  }, [aircraftList]);

  // Effective ID: use state if set, otherwise first in list (handles first render before effect fires)
  const effectiveAircraftId = selectedAircraftId ?? (aircraftList[0]?.id ?? null);

  const selectedAircraft = aircraftList.find(
    (a: Aircraft) => a.id === effectiveAircraftId
  );

  const { data: seatMap, isLoading: seatMapLoading, isError: seatMapError } = useQuery({
    queryKey: ['seatMap', effectiveAircraftId],
    queryFn: () => seatsAPI.getSeatMap(effectiveAircraftId!).then((r) => r.data),
    enabled: !!effectiveAircraftId,
    retry: 1,
  });

  const generateSeatsMutation = useMutation({
    mutationFn: (aircraft: Aircraft) =>
      seatsAPI.generateSeats({
        aircraftId: aircraft.id,
        totalRows: aircraft.totalRows,
        seatsPerRow: aircraft.seatsPerRow,
        aircraftCode: aircraft.aircraftCode,
        layoutType: aircraft.layoutType ?? (
          aircraft.seatsPerRow === 9 ? 'B787_8' :
          aircraft.seatsPerRow === 4 ? 'ATR72' : 'B737_800'
        ),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seatMap'] });
    },
    onError: (_error, aircraft) => {
      generatedAircraftIds.current.delete(aircraft.id);
    },
  });

  useEffect(() => {
    if (
      !selectedAircraft ||
      seatMapLoading ||
      !seatMap ||
      seatMap.rows.length > 0 ||
      generateSeatsMutation.isPending ||
      generatedAircraftIds.current.has(selectedAircraft.id)
    ) {
      return;
    }

    generatedAircraftIds.current.add(selectedAircraft.id);
    generateSeatsMutation.mutate(selectedAircraft);
  }, [selectedAircraft, seatMap, seatMapLoading, generateSeatsMutation.isPending]);

  // Local override map for instant color feedback before the refetch arrives
  const [localStatusOverrides, setLocalStatusOverrides] = useState<Record<string, SeatStatus>>({});

  const seatStatuses = useMemo(() => {
    const map: Record<string, SeatStatus> = {};
    seatMap?.rows?.forEach((row: SeatRow) => {
      row.seats.forEach((seat: Seat) => {
        if (seat.seatId && seat.type !== 'AISLE') {
          map[seat.seatId] = seat.status;
        }
      });
    });
    return map;
  }, [seatMap]);

  // Merge server data with local optimistic overrides
  const mergedStatuses = useMemo<Record<string, SeatStatus>>(
    () => ({ ...seatStatuses, ...localStatusOverrides }),
    [seatStatuses, localStatusOverrides]
  );

  // Real class per row from the seat-map data (FIRST/BUSINESS/ECONOMY)
  const seatClassByRow = useMemo<Record<number, string>>(() => {
    const map: Record<number, string> = {};
    seatMap?.rows?.forEach((row: SeatRow) => {
      if (row.rowNumber && row.seatClass) {
        map[row.rowNumber] = row.seatClass;
      }
    });
    return map;
  }, [seatMap]);

  const getSeatClass = (seatId: string): string => {
    const row = parseInt(seatId, 10);
    return seatClassByRow[row] ?? 'ECONOMY';
  };

  const stats = useMemo(() => {
    const counts = { available: 0, occupied: 0, unavailable: 0 };
    Object.values(mergedStatuses).forEach((status) => {
      if (status === 'AVAILABLE') counts.available++;
      else if (status === 'OCCUPIED') counts.occupied++;
      else counts.unavailable++;
    });
    return counts;
  }, [mergedStatuses]);

  const updateMutation = useMutation({
    mutationFn: ({
      seatId,
      aircraftId,
      status,
    }: {
      seatId: string;
      aircraftId: number;
      status: SeatStatus;
    }) => seatsAPI.updateStatus(seatId, aircraftId, status),
    onMutate: ({ seatId, status }) => {
      // Instantly update color without waiting for refetch
      setLocalStatusOverrides((prev) => ({ ...prev, [seatId]: status }));
    },
    onSuccess: (_data, { seatId, status }) => {
      setLocalStatusOverrides((prev) => ({ ...prev, [seatId]: status }));
      queryClient.invalidateQueries({ queryKey: ['seatMap'] });
    },
    onError: (_err, { seatId }) => {
      // Revert on failure
      setLocalStatusOverrides((prev) => {
        const next = { ...prev };
        delete next[seatId];
        return next;
      });
    },
  });

  const handleAircraftChange = (id: number) => {
    setSelectedAircraftId(id);
    setSelectedSeat(null);
    setDropdownOpen(false);
  };

  const handleStatusChange = (status: SeatStatus) => {
    if (!selectedSeat || !effectiveAircraftId) return;
    updateMutation.mutate({ seatId: selectedSeat, aircraftId: effectiveAircraftId, status });
  };

  const currentSeatStatus = selectedSeat ? mergedStatuses[selectedSeat] : null;
  const rows = seatMap?.rows?.length || selectedAircraft?.totalRows || 30;

  const sidebarBg = isDark ? '#071628' : 'white';
  const sidebarBorder = isDark ? '#1a3050' : '#e5e7eb';
  const textPrimary = isDark ? 'white' : '#1a1a2e';
  const textSecondary = isDark ? '#4a7aab' : '#6b7280';
  const textMuted = isDark ? '#2a5080' : '#9ca3af';

  return (
    <div
      className="flex h-full overflow-hidden"
      style={{ background: isDark ? '#07162c' : '#f8fafc' }}
    >
      {/* Left panel */}
      <div
        className="w-72 flex-shrink-0 flex flex-col border-r"
        style={{ background: sidebarBg, borderColor: sidebarBorder }}
      >
        {/* Header */}
        <div
          className="h-11 flex items-center gap-2 px-4 border-b flex-shrink-0"
          style={{ borderColor: sidebarBorder }}
        >
          <TbArmchair className="w-4 h-4" style={{ color: '#38bdf8' }} />
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: textPrimary }}>
            Seat Management
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Aircraft selector */}
          <div>
            <label
              className="text-[10px] uppercase tracking-wider mb-1.5 block"
              style={{ color: textMuted }}
            >
              Aircraft
            </label>
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                disabled={aircraftLoading}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg border text-left transition-colors"
                style={{
                  background: isDark ? '#0a1e38' : '#f9fafb',
                  borderColor: sidebarBorder,
                  color: textPrimary,
                }}
              >
                {aircraftLoading ? (
                  <span className="text-xs" style={{ color: textMuted }}>Loading...</span>
                ) : selectedAircraft ? (
                  <div className="flex items-center gap-2 min-w-0">
                    <TbPlane className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#38bdf8' }} />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate">
                        {selectedAircraft.aircraftCode}
                      </div>
                      <div className="text-[10px] truncate" style={{ color: textMuted }}>
                        {selectedAircraft.model}
                      </div>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs" style={{ color: textMuted }}>No aircraft</span>
                )}
                <TbChevronDown
                  className={`w-4 h-4 flex-shrink-0 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                  style={{ color: textMuted }}
                />
              </button>

              {dropdownOpen && aircraftList.length > 0 && (
                <div
                  className="absolute top-full left-0 right-0 mt-1 rounded-lg border shadow-lg z-20 overflow-hidden"
                  style={{
                    background: isDark ? '#0a1e38' : 'white',
                    borderColor: sidebarBorder,
                  }}
                >
                  {aircraftList.map((aircraft: Aircraft) => (
                    <button
                      key={aircraft.id}
                      onClick={() => handleAircraftChange(aircraft.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors hover:opacity-80"
                      style={{
                        background: aircraft.id === selectedAircraftId
                          ? isDark ? '#0d2040' : '#eff6ff'
                          : 'transparent',
                      }}
                    >
                      <TbPlane className="w-3.5 h-3.5" style={{ color: '#38bdf8' }} />
                      <div>
                        <div className="text-xs font-semibold" style={{ color: textPrimary }}>
                          {aircraft.aircraftCode}
                        </div>
                        <div className="text-[10px]" style={{ color: textMuted }}>
                          {aircraft.registration} · {aircraft.model}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Aircraft info */}
          {selectedAircraft && (
            <div
              className="rounded-lg border p-3 space-y-2"
              style={{
                background: isDark ? '#0a1e38' : '#f9fafb',
                borderColor: sidebarBorder,
              }}
            >
              <div className="flex justify-between">
                <span className="text-[10px]" style={{ color: textMuted }}>Registration</span>
                <span className="text-[10px] font-semibold" style={{ color: textPrimary }}>
                  {selectedAircraft.registration}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px]" style={{ color: textMuted }}>Total Seats</span>
                <span className="text-[10px] font-semibold" style={{ color: textPrimary }}>
                  {selectedAircraft.totalSeats}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px]" style={{ color: textMuted }}>Status</span>
                <span
                  className={`text-[10px] font-semibold ${
                    selectedAircraft.status === 'ACTIVE'
                      ? 'text-[#4ade80]'
                      : selectedAircraft.status === 'MAINTENANCE'
                      ? 'text-[#fbbf24]'
                      : 'text-[#f87171]'
                  }`}
                >
                  {selectedAircraft.status}
                </span>
              </div>
            </div>
          )}

          {/* Stats */}
          <div>
            <label
              className="text-[10px] uppercase tracking-wider mb-2 block"
              style={{ color: textMuted }}
            >
              Seat Status
            </label>
            <div className="space-y-2">
              {[
                { key: 'available', label: 'Available', color: '#4CAF82', count: stats.available },
                { key: 'occupied', label: 'Occupied', color: '#C41E3A', count: stats.occupied },
                { key: 'unavailable', label: 'Unavailable', color: '#6b7280', count: stats.unavailable },
              ].map(({ label, color, count }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-sm"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs" style={{ color: textSecondary }}>{label}</span>
                  </span>
                  <span className="text-xs font-bold" style={{ color: textPrimary }}>
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Selected seat controls */}
          <div>
            <label
              className="text-[10px] uppercase tracking-wider mb-2 block"
              style={{ color: textMuted }}
            >
              Selected Seat
            </label>
            {selectedSeat ? (
              <div
                className="rounded-lg border p-3 space-y-3"
                style={{
                  background: isDark ? '#0d2040' : '#eff6ff',
                  borderColor: '#38bdf8',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold" style={{ color: textPrimary }}>
                    {selectedSeat}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded" style={{ color: textMuted }}>
                    {CLASS_LABELS[getSeatClass(selectedSeat)]}
                  </span>
                </div>
                <div className="text-[10px]" style={{ color: textMuted }}>
                  Current:{' '}
                  <span className="font-semibold" style={{ color: textPrimary }}>
                    {currentSeatStatus}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {STATUS_OPTIONS.map(({ value, label, color }) => (
                    <button
                      key={value}
                      onClick={() => handleStatusChange(value)}
                      disabled={updateMutation.isPending || currentSeatStatus === value}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-all disabled:opacity-50"
                      style={{
                        background: currentSeatStatus === value
                          ? isDark ? '#0a1e38' : 'white'
                          : 'transparent',
                        borderColor: currentSeatStatus === value ? color : sidebarBorder,
                        color: currentSeatStatus === value ? color : textSecondary,
                      }}
                    >
                      <span
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: color }}
                      />
                      {label}
                      {currentSeatStatus === value && (
                        <span className="ml-auto text-[9px]">✓</span>
                      )}
                    </button>
                  ))}
                </div>
                {updateMutation.isPending && (
                  <p className="text-[10px] text-center" style={{ color: textMuted }}>
                    Updating...
                  </p>
                )}
                {updateMutation.isError && (
                  <p className="text-[10px] text-center text-red-400">
                    Failed to update seat
                  </p>
                )}
              </div>
            ) : (
              <div
                className="rounded-lg border p-4 text-center"
                style={{ borderColor: sidebarBorder }}
              >
                <p className="text-xs" style={{ color: textMuted }}>
                  Click a seat on the map to change its status
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Seat map */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        {!effectiveAircraftId ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm" style={{ color: textMuted }}>
              Select an aircraft to view its seat map
            </p>
          </div>
        ) : seatMapLoading ? (
          <div className="flex-1 flex items-center justify-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#C41E3A', borderTopColor: 'transparent' }} />
            <p className="text-sm" style={{ color: textMuted }}>Loading seat map...</p>
          </div>
        ) : seatMapError ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <p className="text-sm font-semibold text-red-500">Failed to load seat map</p>
            <p className="text-xs" style={{ color: textMuted }}>Check that the seat-service backend is running</p>
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ['seatMap', effectiveAircraftId] })}
              className="mt-2 px-4 py-1.5 rounded-lg text-xs font-semibold text-white"
              style={{ background: '#C41E3A' }}
            >
              Retry
            </button>
          </div>
        ) : (
          <Aircraft3D
            seatStatuses={mergedStatuses}
            selectedSeat={selectedSeat}
            rows={rows}
            seatsPerRow={selectedAircraft?.seatsPerRow}
            seatMap={seatMap}
            layoutType={selectedAircraft?.layoutType}
            onSeatClick={setSelectedSeat}
          />
        )}
      </div>
    </div>
  );
}
