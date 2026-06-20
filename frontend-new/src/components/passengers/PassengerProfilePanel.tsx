import type { Passenger, Flight } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import { useNavigate } from 'react-router-dom';
import {
  TbX, TbMail, TbId, TbWorld, TbArmchair, TbPlane, TbArrowRight,
} from 'react-icons/tb';

interface Props {
  passenger: Passenger;
  flight: Flight | undefined;
  onClose: () => void;
}

const AVATAR_COLORS = [
  'bg-[#C41E3A]', 'bg-[#006233]', 'bg-[#C9A84C]',
  'bg-[#1A1A2E]', 'bg-[#38bdf8]', 'bg-[#a78bfa]',
];

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
}

function getSeatClass(seatId: string) {
  const row = parseInt(seatId, 10);
  if (row <= 2) return { label: 'First', color: '#C9A84C' };
  if (row <= 6) return { label: 'Business', color: '#a78bfa' };
  return { label: 'Economy', color: '#38bdf8' };
}

export default function PassengerProfilePanel({ passenger, flight, onClose }: Props) {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const avatarColor = AVATAR_COLORS[passenger.id % AVATAR_COLORS.length];
  const seatClass = passenger.seatId ? getSeatClass(passenger.seatId) : null;

  const bg = isDark ? '#0a1e38' : 'white';
  const border = isDark ? '#1a3050' : '#e5e7eb';
  const textPrimary = isDark ? 'white' : '#1a1a2e';
  const textSecondary = isDark ? '#4a7aab' : '#6b7280';
  const textMuted = isDark ? '#2a5080' : '#9ca3af';

  const fields = [
    { icon: TbMail, label: 'Email', value: passenger.email },
    { icon: TbId, label: 'Passport', value: passenger.passportNumber },
    { icon: TbWorld, label: 'Nationality', value: passenger.nationality },
    { icon: TbArmchair, label: 'Seat', value: passenger.seatId || '—' },
  ];

  return (
    <div
      className="absolute right-0 top-0 bottom-0 w-80 flex flex-col border-l z-10 animate-slide-in"
      style={{ background: bg, borderColor: border }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor: border }}
      >
        <span
          className="text-[10px] font-bold uppercase tracking-wider"
          style={{ color: textSecondary }}
        >
          Passenger Profile
        </span>
        <button
          onClick={onClose}
          className="p-1 rounded transition-colors"
          style={{ color: textMuted }}
        >
          <TbX className="w-4 h-4" />
        </button>
      </div>

      {/* Profile body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Avatar + name */}
        <div className="flex flex-col items-center text-center">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-lg font-bold mb-3 ${avatarColor}`}
          >
            {getInitials(passenger.firstName, passenger.lastName)}
          </div>
          <h2 className="text-lg font-bold" style={{ color: textPrimary }}>
            {passenger.firstName} {passenger.lastName}
          </h2>
          <p className="text-xs mt-0.5" style={{ color: textMuted }}>
            ID #{passenger.id}
          </p>
          {seatClass && (
            <span
              className="mt-2 text-[10px] font-semibold px-2 py-0.5 rounded"
              style={{
                color: seatClass.color,
                background: `${seatClass.color}20`,
              }}
            >
              {seatClass.label} · Seat {passenger.seatId}
            </span>
          )}
        </div>

        {/* Details */}
        <div className="space-y-2">
          {fields.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5"
              style={{ background: isDark ? '#071628' : '#f9fafb' }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" style={{ color: textMuted }} />
              <div className="min-w-0">
                <div className="text-[9px] uppercase tracking-wider" style={{ color: textMuted }}>
                  {label}
                </div>
                <div className="text-xs font-medium truncate" style={{ color: textPrimary }}>
                  {value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Flight card */}
        {flight && (
          <div
            className="rounded-lg border p-3 space-y-2"
            style={{
              background: isDark ? '#071628' : '#f9fafb',
              borderColor: border,
            }}
          >
            <div className="flex items-center gap-2">
              <TbPlane className="w-4 h-4" style={{ color: '#38bdf8' }} />
              <span className="text-xs font-bold" style={{ color: textPrimary }}>
                {flight.flightNumber}
              </span>
              <span className="text-[10px]" style={{ color: textSecondary }}>
                {flight.origin} → {flight.destination}
              </span>
            </div>
            <div className="text-[10px]" style={{ color: textMuted }}>
              Gate {flight.gate || '—'} · {flight.status}
            </div>
          </div>
        )}
      </div>

      {/* Footer action */}
      {flight && (
        <div className="p-4 border-t flex-shrink-0" style={{ borderColor: border }}>
          <button
            onClick={() => navigate(`/flights/${flight.id}`)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: '#C41E3A' }}
          >
            View Flight Detail
            <TbArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
