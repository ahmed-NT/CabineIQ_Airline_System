import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { flightsAPI } from '@/lib/api';
import type { Flight } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import { TbPlane, TbClock, TbMapPin } from 'react-icons/tb';

const statusColors: Record<string, string> = {
  SCHEDULED: 'bg-gray-500',
  BOARDING: 'bg-green-500',
  DEPARTED: 'bg-blue-500',
  ARRIVED: 'bg-purple-500',
  DELAYED: 'bg-amber-500',
  CANCELLED: 'bg-red-500',
};

export default function FlightsPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const { data: flights = [], isLoading } = useQuery({
    queryKey: ['flights'],
    queryFn: () => flightsAPI.getAll().then((r) => r.data),
  });

  const bg = isDark ? '#07162c' : '#f8fafc';
  const textPrimary = isDark ? 'white' : '#1a1a2e';
  const textMuted = isDark ? '#4a7aab' : '#6b7280';

  return (
    <div className="h-full overflow-y-auto p-6 space-y-4" style={{ background: bg }}>
      <div className="flex items-center gap-3 mb-6">
        <TbPlane className="w-6 h-6 text-[#C41E3A]" />
        <h1 className="text-2xl font-bold" style={{ color: textPrimary }}>
          Flight Management
        </h1>
        <span className="ml-auto text-sm" style={{ color: textMuted }}>
          {flights.length} flights
        </span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-xl animate-pulse"
              style={{ background: isDark ? '#0a1e38' : '#e5e7eb' }}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {flights.map((flight: Flight) => (
            <div
              key={flight.id}
              className="rounded-xl border p-4 hover:shadow-md transition-shadow cursor-pointer"
              style={{
                background: isDark ? '#071628' : 'white',
                borderColor: isDark ? '#1a3050' : '#e5e7eb',
              }}
              onClick={() => navigate(`/flights/${flight.id}`)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TbPlane className="w-4 h-4 text-[#C41E3A]" />
                  <span className="font-bold text-lg" style={{ color: textPrimary }}>
                    {flight.flightNumber}
                  </span>
                </div>
                <span
                  className={`text-xs text-white px-2 py-0.5 rounded-full font-medium ${
                    statusColors[flight.status] ?? 'bg-gray-400'
                  }`}
                >
                  {flight.status}
                </span>
              </div>
              <div
                className="flex items-center gap-2 text-sm mb-2"
                style={{ color: textMuted }}
              >
                <TbMapPin className="w-3.5 h-3.5" />
                <span>
                  {flight.origin} → {flight.destination}
                </span>
              </div>
              <div
                className="flex items-center gap-2 text-sm"
                style={{ color: textMuted }}
              >
                <TbClock className="w-3.5 h-3.5" />
                <span>
                  {flight.departureTime
                    ? new Date(flight.departureTime).toUTCString().slice(17, 22)
                    : '--'}{' '}
                  UTC
                </span>
                {flight.gate && (
                  <span className="ml-auto">Gate {flight.gate}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
