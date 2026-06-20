import type { Flight } from '@/types';
import { AIRPORTS } from '@/data/airports';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  flight: Flight;
  isActive: boolean;
  isPinned: boolean;
  onHover: (flight: Flight | null) => void;
  onClick: (flight: Flight) => void;
}

const STATUS_STYLES: Record<string, { badge: string; text: string; bar: string; glow: boolean }> = {
  DEPARTED:  { badge: 'bg-[#0d2a3a]', text: 'text-[#38bdf8]', bar: 'bg-[#38bdf8]', glow: true },
  ARRIVED:   { badge: 'bg-[#0f2a1a]', text: 'text-[#4ade80]', bar: 'bg-[#4ade80]', glow: false },
  BOARDING:  { badge: 'bg-[#1e1040]', text: 'text-[#a78bfa]', bar: 'bg-[#a78bfa]', glow: false },
  SCHEDULED: { badge: 'bg-[#1a2a00]', text: 'text-[#4ade80]', bar: 'bg-[#4ade80]', glow: false },
  DELAYED:   { badge: 'bg-[#2a1e00]', text: 'text-[#fbbf24]', bar: 'bg-[#fbbf24]', glow: false },
  CANCELLED: { badge: 'bg-[#2a1010]', text: 'text-[#f87171]', bar: 'bg-[#4b5563]', glow: false },
};

export default function FlightCard({ flight, isActive, isPinned, onHover, onClick }: Props) {
  const { isDark } = useTheme();
  const style = STATUS_STYLES[flight.status] || STATUS_STYLES.SCHEDULED;
  const dstCity = AIRPORTS[flight.destination]?.city || flight.destination;
  const depTime = new Date(flight.departureTime).toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit', timeZone: 'UTC'
  });

  return (
    <div
      onClick={() => onClick(flight)}
      onMouseEnter={() => onHover(flight)}
      onMouseLeave={() => onHover(null)}
      className={`
        relative flex-shrink-0 min-w-[148px] rounded-lg border
        p-2.5 cursor-pointer transition-all select-none
        ${isActive
          ? isDark
            ? `bg-[#0d2040] ${isPinned ? 'border-[#38bdf8]' : 'border-[#2a4060]'}`
            : `bg-blue-50 ${isPinned ? 'border-blue-400' : 'border-blue-300'}`
          : isDark
            ? 'bg-[#071628] border-[#1a3050] hover:bg-[#0d2040] hover:border-[#2a4060]'
            : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
        }
      `}
    >
      {/* Top color bar when active */}
      {isActive && (
        <div className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-lg ${style.bar}`} />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-1.5">
        <span className={`text-xs font-semibold tracking-wide
          ${isDark ? 'text-white' : 'text-gray-800'}
        `}>
          {flight.flightNumber}
        </span>
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${style.badge} ${style.text}`}>
          {flight.status}
        </span>
      </div>

      {/* Route */}
      <div className={`text-[11px] mb-0.5 truncate
        ${isDark ? 'text-[#4a7aab]' : 'text-gray-500'}
      `}>
        {flight.origin} → {flight.destination} · {dstCity}
      </div>

      {/* Aircraft placeholder */}
      <div className={`text-[10px] mb-2 truncate
        ${isDark ? 'text-[#2a5080]' : 'text-gray-400'}
      `}>
        Gate {flight.gate || '—'}
      </div>

      {/* Progress bar */}
      <div className={`h-1 rounded-full mb-1.5 ${
        flight.status === 'CANCELLED' ? 'opacity-30' : ''
      } ${isDark ? 'bg-[#0a1e38]' : 'bg-gray-200'}`}>
        <div
          className={`h-full rounded-full transition-all ${style.bar} ${
            style.glow ? 'shadow-[0_0_6px_#38bdf8]' : ''
          }`}
          style={{ width: flight.status === 'ARRIVED' ? '100%' :
                          flight.status === 'DEPARTED' ? '60%' :
                          flight.status === 'BOARDING' ? '15%' :
                          flight.status === 'DELAYED' ? '5%' : '0%' }}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className={`text-[10px]
          ${isDark ? 'text-[#2a5080]' : 'text-gray-400'}
        `}>
          {depTime} UTC
        </span>
        {flight.status === 'DELAYED' && (
          <span className="text-[10px] text-[#fbbf24]">⚠ Delayed</span>
        )}
      </div>
    </div>
  );
}
