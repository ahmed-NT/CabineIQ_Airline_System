import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Flight } from '@/types';
import FlightCard from './FlightCard';
import ExpandableSearch from './ExpandableSearch';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  flights: Flight[];
  isLoading: boolean;
  activeFlightId: number | null;
}

export default function FlightDrawer({ flights, isLoading, activeFlightId }: Props) {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const filtered = flights.filter(f =>
    search === '' ||
    f.flightNumber.toLowerCase().includes(search.toLowerCase()) ||
    f.origin.toLowerCase().includes(search.toLowerCase()) ||
    f.destination.toLowerCase().includes(search.toLowerCase()) ||
    f.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`
      h-[210px] flex-shrink-0 flex flex-col
      border-t transition-colors
      ${isDark 
        ? 'bg-[#0a1e38] border-[#1a3050]' 
        : 'bg-white border-gray-200'
      }
    `}>
      {/* Drawer header — search only */}
      <div className={`h-9 flex items-center px-3 flex-shrink-0 border-b
        ${isDark ? 'border-[#1a3050]' : 'border-gray-100'}
      `}>
        <ExpandableSearch
          value={search}
          onChange={setSearch}
          placeholder="Filter flights..."
        />
      </div>

      {/* Cards row */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden px-3 pb-3">
        {isLoading ? (
          <div className="flex items-center h-full gap-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[148px] h-full rounded-lg
                  bg-[#071628] border border-[#1a3050] animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-[#2a5080] text-xs">No flights found</p>
          </div>
        ) : (
          <div className="flex gap-2 h-full items-start pt-1">
            {filtered.map(flight => (
              <FlightCard
                key={flight.id}
                flight={flight}
                isActive={activeFlightId === flight.id}
                onClick={(f) => navigate(`/flights/${f.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
