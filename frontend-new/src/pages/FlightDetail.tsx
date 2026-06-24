import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { flightsAPI, seatsAPI, passengersAPI, feedbackAPI } from '@/lib/api';
import type { Passenger, FlightStatus, Feedback } from '@/types';
import type { SeatScoreInfo } from '@/components/flight/Aircraft3D';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { useSeatScoring } from '@/hooks/useSeatScoring';
import {
  TbArrowLeft, TbPlane,
  TbCalendar, TbClock,
  TbDoor, TbId, TbMessageDots, TbStar
} from 'react-icons/tb';
import StatusChanger from '@/components/flight/StatusChanger';
import QrGenerator from '@/components/flight/QrGenerator';
import Aircraft3D from '@/components/flight/Aircraft3D';
import PassengerList from '@/components/flight/PassengerList';
import SeatScoreModal from '@/components/flight/SeatScoreModal';

const STATUS_COLORS: Record<string, string> = {
  DEPARTED:  'bg-[#0d2a3a] text-[#38bdf8]',
  ARRIVED:   'bg-[#0f2a1a] text-[#4ade80]',
  BOARDING:  'bg-[#1e1040] text-[#a78bfa]',
  SCHEDULED: 'bg-[#1a2a00] text-[#4ade80]',
  DELAYED:   'bg-[#2a1e00] text-[#fbbf24]',
  CANCELLED: 'bg-[#2a1010] text-[#f87171]',
};

export default function FlightDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { isCrew } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPassenger, setSelectedPassenger] =
    useState<Passenger | null>(null);
  const [scoringSeatId, setScoringSeatId] = useState<string | null>(null);

  const flightId = Number(id);

  // Fetch flight
  const { data: flight, isLoading: flightLoading } = useQuery({
    queryKey: ['flight', flightId],
    queryFn: () => flightsAPI.getById(flightId).then(r => r.data),
    enabled: !!flightId,
  });

  // Fetch seat map
  const { data: seatMap } = useQuery({
    queryKey: ['seatMap', flight?.aircraftId],
    queryFn: () => seatsAPI.getSeatMap(flight!.aircraftId).then(r => r.data),
    enabled: !!flight?.aircraftId,
  });

  // Fetch passengers
  const { data: passengers = [] } = useQuery({
    queryKey: ['passengers', flightId],
    queryFn: () => passengersAPI.getByFlight(flightId).then(r => r.data),
    enabled: !!flightId,
  });

  // Fetch feedbacks for this flight
  const { data: feedbacks = [] } = useQuery({
    queryKey: ['feedbacks', flightId],
    queryFn: () => feedbackAPI.getByFlight(flightId).then(r => r.data),
    enabled: !!flightId,
  });

  // Seat scoring
  const canScore = flight?.status === 'DEPARTED' || flight?.status === 'ARRIVED';
  const scoringMode = canScore;
  const { scoredSeatMap, submitScore, isSubmitting } = useSeatScoring(
    flight?.aircraftId ?? null,
    seatMap?.aircraftCode ?? '',
    flight?.id ?? null,
    scoringMode && canScore,
  );

  const scoreDataMap = useMemo(() => {
    if (!scoringMode || !scoredSeatMap) return undefined;
    const map: Record<string, SeatScoreInfo> = {};
    scoredSeatMap.rows?.forEach((row: any) => {
      row.seats.forEach((seat: any) => {
        if (seat.seatId && seat.score != null) {
          map[seat.seatId] = { score: seat.score, lostItem: !!seat.lostItem };
        }
      });
    });
    return map;
  }, [scoringMode, scoredSeatMap]);

  // Occupied seats
  const occupiedSeats = useMemo(() =>
    passengers.map((p: Passenger) => p.seatId).filter(Boolean),
    [passengers]
  );

  // Occupancy stats
  const totalSeats = seatMap?.rows?.reduce(
    (acc: number, row: any) =>
      acc + row.seats.filter((s: any) => s.type !== 'AISLE').length,
    0
  ) || 0;

  const occupancyPct = totalSeats > 0
    ? Math.round((occupiedSeats.length / totalSeats) * 100)
    : 0;

  // Class occupancy
  const classStats = useMemo(() => {
    if (!seatMap) return [];
    const stats: Record<string, { total: number; occupied: number }> = {};
    seatMap.rows?.forEach((row: any) => {
      const cls = row.seatClass;
      if (!stats[cls]) stats[cls] = { total: 0, occupied: 0 };
      row.seats.forEach((s: any) => {
        if (s.type === 'AISLE') return;
        stats[cls].total++;
        if (s.status === 'OCCUPIED') stats[cls].occupied++;
      });
    });
    return Object.entries(stats).map(([cls, data]) => ({
      cls,
      pct: data.total > 0 ? Math.round((data.occupied / data.total) * 100) : 0,
    }));
  }, [seatMap]);

  const handleStatusChange = (status: FlightStatus) => {
    queryClient.setQueryData(['flight', flightId], (old: any) => ({
      ...old, status
    }));
  };

  const handleSeatClick = (seatId: string) => {
    const p = passengers.find((p: Passenger) => p.seatId === seatId);
    setSelectedPassenger(p || null);
  };

  if (flightLoading) {
    return (
      <div className={`h-full flex items-center justify-center ${
        isDark ? 'bg-[#07162c]' : 'bg-gray-50'
      }`}>
        <p className="text-sm text-gray-400">Loading flight...</p>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className={`h-full flex items-center justify-center ${
        isDark ? 'bg-[#07162c]' : 'bg-gray-50'
      }`}>
        <p className="text-sm text-red-400">Flight not found</p>
      </div>
    );
  }

  const depTime = new Date(flight.departureTime)
    .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const arrTime = new Date(flight.arrivalTime)
    .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const depDate = new Date(flight.departureTime)
    .toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className={`flex flex-col h-full transition-colors ${
      isDark ? 'bg-[#07162c]' : 'bg-gray-50'
    }`}>
      {/* Top bar */}
      <div className={`h-11 flex items-center justify-between
        px-4 flex-shrink-0 border-b ${
        isDark
          ? 'bg-[#0a1e38] border-[#1a3050]'
          : 'bg-white border-gray-200 shadow-sm'
      }`}>
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className={`flex items-center gap-1.5 text-xs
              transition-colors ${
              isDark
                ? 'text-[#4a7aab] hover:text-white'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <TbArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className={`h-4 w-px ${
            isDark ? 'bg-[#1a3050]' : 'bg-gray-200'
          }`} />
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>
              {flight.flightNumber}
            </span>
            <span className={`text-xs ${
              isDark ? 'text-[#4a7aab]' : 'text-gray-500'
            }`}>
              {flight.origin} → {flight.destination}
            </span>
            <span className={`text-[10px] font-semibold
              px-2 py-0.5 rounded ${
              STATUS_COLORS[flight.status] || STATUS_COLORS.SCHEDULED
            }`}>
              {flight.status}
            </span>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {!isCrew && (
            <StatusChanger
              flightId={flight.id}
              currentStatus={flight.status}
              onStatusChange={handleStatusChange}
            />
          )}
          <QrGenerator
            flightId={flight.id}
            flightNumber={flight.flightNumber}
          />
        </div>
      </div>

      {/* Body — 2 columns */}
      <div className="flex-1 flex overflow-hidden">

        {/* LEFT COLUMN — 260px */}
        <div className={`w-64 flex-shrink-0 flex flex-col
          border-r overflow-hidden ${
          isDark
            ? 'border-[#1a3050]'
            : 'border-gray-200'
        }`}>

          {/* Flight Info */}
          <div className={`p-4 border-b flex-shrink-0 ${
            isDark ? 'border-[#1a3050]' : 'border-gray-100'
          }`}>
            {/* Route */}
            <div className="flex items-center justify-between mb-3">
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>
                  {flight.origin}
                </div>
                <div className={`text-[10px] ${
                  isDark ? 'text-[#2a5080]' : 'text-gray-400'
                }`}>
                  {depTime}
                </div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <TbPlane className={`w-4 h-4 ${
                  isDark ? 'text-[#1a3050]' : 'text-gray-300'
                }`} />
                <div className={`text-[9px] ${
                  isDark ? 'text-[#2a5080]' : 'text-gray-400'
                }`}>
                  {flight.status === 'ARRIVED' ? '100%' :
                   flight.status === 'DEPARTED' ? '62%' : '0%'}
                </div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>
                  {flight.destination}
                </div>
                <div className={`text-[10px] ${
                  isDark ? 'text-[#2a5080]' : 'text-gray-400'
                }`}>
                  {arrTime}
                </div>
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: TbCalendar, label: 'Date', value: depDate },
                { icon: TbDoor, label: 'Gate', value: flight.gate || '—' },
                { icon: TbClock, label: 'Arrival', value: arrTime },
                { icon: TbId, label: 'Flight #', value: flight.flightNumber },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className={`rounded-lg p-2 ${
                  isDark ? 'bg-[#071628]' : 'bg-gray-50'
                }`}>
                  <div className={`text-[9px] uppercase tracking-wider flex items-center gap-1 mb-0.5 ${
                    isDark ? 'text-[#2a5080]' : 'text-gray-400'
                  }`}>
                    <Icon className="w-3 h-3" />
                    {label}
                  </div>
                  <div className={`text-xs font-semibold ${
                    isDark ? 'text-white' : 'text-gray-700'
                  }`}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Occupancy */}
          <div className={`p-4 border-b flex-shrink-0 ${
            isDark ? 'border-[#1a3050]' : 'border-gray-100'
          }`}>
            <div className="flex justify-between items-center mb-1.5">
              <span className={`text-[10px] uppercase tracking-wider ${
                isDark ? 'text-[#2a5080]' : 'text-gray-400'
              }`}>
                Occupancy
              </span>
              <span className={`text-sm font-bold ${
                isDark ? 'text-[#38bdf8]' : 'text-blue-500'
              }`}>
                {occupancyPct}% · {occupiedSeats.length}/{totalSeats}
              </span>
            </div>
            <div className={`h-1.5 rounded-full overflow-hidden ${
              isDark ? 'bg-[#071628]' : 'bg-gray-200'
            }`}>
              <div
                className="h-full bg-[#38bdf8] rounded-full"
                style={{ width: `${occupancyPct}%` }}
              />
            </div>

            {/* Class bars */}
            <div className="mt-2 space-y-1.5">
              {classStats.map(({ cls, pct }) => (
                <div key={cls} className="flex items-center gap-2">
                  <span className={`text-[9px] w-12 ${
                    isDark ? 'text-[#2a5080]' : 'text-gray-400'
                  }`}>
                    {cls[0] + cls.slice(1).toLowerCase()}
                  </span>
                  <div className={`flex-1 h-1 rounded-full ${
                    isDark ? 'bg-[#071628]' : 'bg-gray-200'
                  }`}>
                    <div
                      className={`h-full rounded-full ${
                        cls === 'FIRST' ? 'bg-[#C9A84C]' :
                        cls === 'BUSINESS' ? 'bg-[#a78bfa]' :
                        'bg-[#38bdf8]'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className={`text-[9px] w-7 text-right ${
                    isDark ? 'text-[#2a5080]' : 'text-gray-400'
                  }`}>
                    {pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Passenger list */}
          <div className="flex-1 overflow-hidden">
            <PassengerList
              passengers={passengers}
              selectedPassenger={selectedPassenger}
              onSelect={setSelectedPassenger}
            />
          </div>
        </div>

        {/* CENTER COLUMN */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          <Aircraft3D
            occupiedSeats={occupiedSeats}
            selectedSeat={selectedPassenger?.seatId || scoringSeatId || null}
            scoreData={scoringMode ? scoreDataMap : undefined}
            totalSeats={totalSeats || 180}
            rows={seatMap?.rows?.length || 30}
            onSeatClick={scoringMode ? (seatId) => setScoringSeatId(seatId) : handleSeatClick}
          />
        </div>

        {/* RIGHT COLUMN — feedbacks */}
        <div className={`w-56 flex-shrink-0 flex flex-col border-l overflow-hidden ${
          isDark ? 'border-[#1a3050]' : 'border-gray-200'
        }`}>
          <div className={`h-9 flex items-center gap-2 px-3 flex-shrink-0 border-b ${
            isDark ? 'border-[#1a3050] bg-[#0a1e38]' : 'border-gray-100 bg-gray-50'
          }`}>
            <TbMessageDots className="w-3.5 h-3.5 text-[#C41E3A]" />
            <span className={`text-[10px] font-bold uppercase tracking-wider ${
              isDark ? 'text-[#4a7aab]' : 'text-gray-500'
            }`}>
              Feedbacks
            </span>
            <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded ${
              isDark ? 'bg-[#071628] text-[#4a7aab]' : 'bg-gray-200 text-gray-500'
            }`}>
              {(feedbacks as Feedback[]).length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {(feedbacks as Feedback[]).length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 gap-2">
                <TbMessageDots className={`w-6 h-6 ${isDark ? 'text-[#1a3050]' : 'text-gray-300'}`} />
                <p className={`text-[10px] ${isDark ? 'text-[#2a5080]' : 'text-gray-400'}`}>
                  No feedback yet
                </p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: isDark ? '#0d1e30' : '#f3f4f6' }}>
                {(feedbacks as Feedback[]).map((fb) => {
                  const score = fb.purchaseIntentScore ?? 0;
                  const color = score >= 70 ? '#4ade80' : score >= 40 ? '#fbbf24' : '#f87171';
                  return (
                    <div key={fb.id} className={`p-3 space-y-1.5 ${
                      isDark ? 'hover:bg-[#0a1e38]' : 'hover:bg-gray-50'
                    } transition-colors`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-mono ${
                          isDark ? 'text-[#4a7aab]' : 'text-gray-500'
                        }`}>
                          {fb.seatId || '—'}
                          {fb.seatClass && (
                            <span className="ml-1 opacity-60">·{fb.seatClass[0]}</span>
                          )}
                        </span>
                        <div className="flex items-center gap-1">
                          <TbStar className="w-3 h-3" style={{ color }} />
                          <span className="text-[10px] font-bold" style={{ color }}>
                            {score}
                          </span>
                        </div>
                      </div>
                      {fb.tripPurpose && (
                        <p className={`text-[10px] capitalize ${
                          isDark ? 'text-[#2a5080]' : 'text-gray-400'
                        }`}>
                          {fb.tripPurpose.toLowerCase().replace('_', ' ')}
                        </p>
                      )}
                      {fb.route && (
                        <p className={`text-[9px] font-mono ${
                          isDark ? 'text-[#1a3050]' : 'text-gray-300'
                        }`}>
                          {fb.route}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Avg score footer */}
          {(feedbacks as Feedback[]).length > 0 && (() => {
            const avg = Math.round(
              (feedbacks as Feedback[]).reduce((s, f) => s + (f.purchaseIntentScore ?? 0), 0) /
              (feedbacks as Feedback[]).length
            );
            const color = avg >= 70 ? '#4ade80' : avg >= 40 ? '#fbbf24' : '#f87171';
            return (
              <div className={`p-3 border-t flex items-center justify-between flex-shrink-0 ${
                isDark ? 'border-[#1a3050] bg-[#071628]' : 'border-gray-100 bg-gray-50'
              }`}>
                <span className={`text-[10px] ${isDark ? 'text-[#2a5080]' : 'text-gray-400'}`}>
                  Avg intent score
                </span>
                <span className="text-sm font-bold" style={{ color }}>{avg}</span>
              </div>
            );
          })()}
        </div>
      </div>
      {/* Seat Score Modal */}
      {scoringMode && scoringSeatId && flight && (
        <SeatScoreModal
          seatId={scoringSeatId}
          existingScore={scoredSeatMap?.rows
            ?.flatMap((r: any) => r.seats)
            ?.find((s: any) => s.seatId === scoringSeatId)?.score}
          existingLostItem={scoredSeatMap?.rows
            ?.flatMap((r: any) => r.seats)
            ?.find((s: any) => s.seatId === scoringSeatId)?.lostItem}
          existingDescription={scoredSeatMap?.rows
            ?.flatMap((r: any) => r.seats)
            ?.find((s: any) => s.seatId === scoringSeatId)?.lostItemDescription ?? ''}
          onClose={() => setScoringSeatId(null)}
          onSubmit={(score, lostItem, description) => {
            submitScore({
              seatId: scoringSeatId,
              aircraftId: flight.aircraftId,
              flightId: flight.id,
              score,
              lostItem,
              lostItemDescription: description,
            });
            setScoringSeatId(null);
          }}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
