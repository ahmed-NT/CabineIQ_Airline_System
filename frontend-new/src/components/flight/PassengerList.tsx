import { useState, useMemo } from 'react';
import type { Passenger } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import ExpandableSearch from '@/components/dashboard/ExpandableSearch';

interface Props {
  passengers: Passenger[];
  selectedPassenger: Passenger | null;
  onSelect: (passenger: Passenger | null) => void;
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
}

const AVATAR_COLORS = [
  'bg-[#C41E3A]', 'bg-[#006233]', 'bg-[#C9A84C]',
  'bg-[#1A1A2E]', 'bg-[#38bdf8]', 'bg-[#a78bfa]',
];

export default function PassengerList({
  passengers, selectedPassenger, onSelect
}: Props) {
  const [search, setSearch] = useState('');
  const { isDark } = useTheme();

  const filtered = useMemo(() => {
    if (!search) return passengers;
    const q = search.toLowerCase();
    return passengers.filter(p =>
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q) ||
      p.seatId?.toLowerCase().includes(q) ||
      p.passportNumber?.toLowerCase().includes(q)
    );
  }, [passengers, search]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={`flex items-center justify-between
        px-3 py-2 border-b flex-shrink-0 ${
        isDark
          ? 'border-[#1a3050]'
          : 'border-gray-100'
      }`}>
        <span className={`text-[10px] font-semibold
          uppercase tracking-wider ${
          isDark ? 'text-[#4a7aab]' : 'text-gray-500'
        }`}>
          Passengers · {passengers.length}
        </span>
        <ExpandableSearch
          value={search}
          onChange={setSearch}
          placeholder="Name or seat..."
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center
            h-20">
            <p className={`text-xs ${
              isDark ? 'text-[#2a5080]' : 'text-gray-400'
            }`}>
              No passengers found
            </p>
          </div>
        ) : (
          filtered.map((passenger, idx) => {
            const isSelected = selectedPassenger?.id === passenger.id;
            const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
            return (
              <button
                key={passenger.id}
                onClick={() => onSelect(
                  isSelected ? null : passenger
                )}
                className={`w-full flex items-center gap-2.5
                  px-3 py-2 text-left transition-colors
                  border-b last:border-0 ${
                  isDark
                    ? 'border-[#0d1e30]'
                    : 'border-gray-50'
                } ${
                  isSelected
                    ? isDark
                      ? 'bg-[#C9A84C]/10 border-[#C9A84C]/20'
                      : 'bg-amber-50 border-amber-100'
                    : isDark
                      ? 'hover:bg-[#0d1e30]'
                      : 'hover:bg-gray-50'
                }`}
              >
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-full flex-shrink-0
                  flex items-center justify-center text-white
                  text-[9px] font-bold ${avatarColor}`}>
                  {getInitials(passenger.firstName, passenger.lastName)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className={`text-xs font-medium truncate ${
                    isDark ? 'text-white' : 'text-gray-800'
                  }`}>
                    {passenger.firstName} {passenger.lastName}
                  </div>
                  <div className={`text-[10px] truncate ${
                    isDark ? 'text-[#2a5080]' : 'text-gray-400'
                  }`}>
                    {passenger.passportNumber}
                  </div>
                </div>

                {/* Seat badge */}
                <span className={`text-[10px] font-bold
                  flex-shrink-0 px-1.5 py-0.5 rounded ${
                  isSelected
                    ? 'bg-[#C9A84C] text-white'
                    : isDark
                      ? 'bg-[#0a1e38] text-[#38bdf8]'
                      : 'bg-gray-100 text-gray-600'
                }`}>
                  {passenger.seatId}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
