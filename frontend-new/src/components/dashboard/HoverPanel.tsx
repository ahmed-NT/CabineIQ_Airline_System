import type { Flight } from '@/types';
import { AIRPORTS } from '@/data/airports';
import { TbX } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  flight: Flight | null;
  onClose: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  DEPARTED:  'text-[#38bdf8] bg-[#0d2a3a]',
  ARRIVED:   'text-[#4ade80] bg-[#0f2a1a]',
  BOARDING:  'text-[#a78bfa] bg-[#1e1040]',
  SCHEDULED: 'text-[#4ade80] bg-[#1a2a00]',
  DELAYED:   'text-[#fbbf24] bg-[#2a1e00]',
  CANCELLED: 'text-[#f87171] bg-[#2a1010]',
};

export default function HoverPanel({ flight, onClose }: Props) {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  if (!flight) return null;

  const dstCity = AIRPORTS[flight.destination]?.city || flight.destination;
  const depTime = new Date(flight.departureTime).toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit', timeZone: 'UTC'
  });
  const arrTime = new Date(flight.arrivalTime).toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit', timeZone: 'UTC'
  });
  const statusStyle = STATUS_COLORS[flight.status] || STATUS_COLORS.SCHEDULED;

  return (
    <div className={`
      absolute right-0 top-0 bottom-0 w-[196px]
      ${isDark ? 'bg-[#0a1e38ee] border-[#1a3050]' : 'bg-white border-gray-200'}
      border-l flex flex-col animate-slide-in z-10 backdrop-blur-sm
    `}>
      {/* Close button */}
      <button
        onClick={onClose}
        className={`absolute top-2 right-2 transition-colors
          ${isDark ? 'text-[#2a5080] hover:text-white' : 'text-gray-400 hover:text-gray-700'}
        `}
      >
        <TbX className="w-3.5 h-3.5" />
      </button>

      <div className="p-4 pt-8 flex flex-col gap-3 flex-1">
        {/* Status badge */}
        <span className={`text-[10px] font-semibold px-2 py-0.5
          rounded self-start ${statusStyle}`}>
          {flight.status}
        </span>

        {/* Flight number */}
        <div>
          <div className={`text-2xl font-bold leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {flight.flightNumber}
          </div>
          <div className={`text-xs mt-0.5 ${isDark ? 'text-[#4a7aab]' : 'text-gray-500'}`}>
            {flight.origin} → {flight.destination} · {dstCity}
          </div>
          <div className={`text-[10px] mt-0.5 ${isDark ? 'text-[#2a5080]' : 'text-gray-400'}`}>
            Gate {flight.gate || '—'}
          </div>
        </div>

        {/* Divider */}
        <div className={`border-t ${isDark ? 'border-[#1a3050]' : 'border-gray-200'}`} />

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-x-2 gap-y-2">
          {[
            { label: 'Departure', value: `${depTime} UTC` },
            { label: 'Arrival', value: `${arrTime} UTC` },
            { label: 'Gate', value: flight.gate || '—' },
            { label: 'Progress', value: flight.status === 'ARRIVED' ? '100%' :
                                        flight.status === 'DEPARTED' ? '60%' :
                                        flight.status === 'BOARDING' ? '15%' : '0%' },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className={`text-[9px] uppercase tracking-wider ${isDark ? 'text-[#2a5080]' : 'text-gray-400'}`}>
                {label}
              </div>
              <div className={`text-xs font-medium mt-0.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className={`border-t ${isDark ? 'border-[#1a3050]' : 'border-gray-200'}`} />

        {/* Occupancy */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className={`text-[9px] uppercase tracking-wider ${isDark ? 'text-[#2a5080]' : 'text-gray-400'}`}>
              Occupancy
            </span>
            <span className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>73%</span>
          </div>
          <div className={`h-1 rounded-full overflow-hidden ${isDark ? 'bg-[#0a1e38]' : 'bg-gray-200'}`}>
            <div
              className="h-full bg-[#38bdf8] rounded-full"
              style={{ width: '73%' }}
            />
          </div>
          <div className={`text-[9px] mt-1 text-right ${isDark ? 'text-[#2a5080]' : 'text-gray-400'}`}>
            132 / 180 passengers
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTA Button */}
        <button
          onClick={() => navigate(`/flights/${flight.id}`)}
          className="
            w-full bg-[#C41E3A] hover:bg-[#a01830]
            text-white text-xs font-medium
            py-2 rounded-lg transition-colors
            flex items-center justify-center gap-1.5
          "
        >
          VIEW FULL DETAIL →
        </button>
      </div>
    </div>
  );
}
