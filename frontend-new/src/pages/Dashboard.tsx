import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { flightsAPI } from '@/lib/api';
import type { Flight } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import GlobeMap from '@/components/dashboard/GlobeMap';
import HoverPanel from '@/components/dashboard/HoverPanel';
import FlightCard from '@/components/dashboard/FlightCard';
import ExpandableSearch from '@/components/dashboard/ExpandableSearch';

export default function Dashboard() {
  const { isDark } = useTheme();
  const [hoveredFlight, setHoveredFlight] = useState<Flight | null>(null);
  const [pinnedFlight, setPinnedFlight] = useState<Flight | null>(null);
  const [search, setSearch] = useState('');

  // Panel shows pinned flight if set, otherwise the hovered flight
  const panelFlight = pinnedFlight ?? hoveredFlight;

  const { data: flights = [], isLoading } = useQuery({
    queryKey: ['flights'],
    queryFn: () => flightsAPI.getAll().then(r => r.data),
    refetchInterval: 30000,
  });

  const filtered = flights.filter((f: Flight) =>
    search === '' ||
    f.flightNumber.toLowerCase().includes(search.toLowerCase()) ||
    f.origin.toLowerCase().includes(search.toLowerCase()) ||
    f.destination.toLowerCase().includes(search.toLowerCase()) ||
    f.status.toLowerCase().includes(search.toLowerCase())
  );

  const sidebarBg = isDark ? '#071628' : '#f8fafc';
  const sidebarBorder = isDark ? '#1a3050' : '#e5e7eb';
  const textMuted = isDark ? '#2a5080' : '#9ca3af';

  return (
    <div
      className="flex h-full min-h-0 overflow-hidden"
      style={{ background: isDark ? '#07162c' : '#f8fafc' }}
    >
      {/* ── LEFT COLUMN — Flight List ── */}
      <div
        className="flex flex-col border-r flex-shrink-0"
        style={{
          width: 240,
          background: sidebarBg,
          borderColor: sidebarBorder,
        }}
      >
        {/* Search header */}
        <div
          className="h-11 flex items-center gap-2 px-3 flex-shrink-0 border-b"
          style={{ borderColor: sidebarBorder }}
        >
          <ExpandableSearch
            value={search}
            onChange={setSearch}
            placeholder="Search flights..."
          />
          <span className="ml-auto text-[10px] shrink-0" style={{ color: textMuted }}>
            {flights.length} flights
          </span>
        </div>

        {/* Flight cards list */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-1.5">
          {isLoading ? (
            [...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-lg animate-pulse"
                style={{ background: isDark ? '#0a1e38' : '#f3f4f6' }}
              />
            ))
          ) : filtered.length === 0 ? (
            <div className="flex items-center justify-center h-20">
              <p className="text-xs" style={{ color: textMuted }}>
                No flights found
              </p>
            </div>
          ) : (
            filtered.map((flight: Flight) => (
              <FlightCard
                key={flight.id}
                flight={flight}
                isActive={panelFlight?.id === flight.id}
                isPinned={pinnedFlight?.id === flight.id}
                onHover={setHoveredFlight}
                onClick={(f) => setPinnedFlight(prev => prev?.id === f.id ? null : f)}
              />
            ))
          )}
        </div>
      </div>

      {/* ── RIGHT AREA — Globe + Hover Panel ── */}
      <div className="flex-1 relative overflow-hidden flex flex-col h-full min-h-0">
        <GlobeMap
          flights={flights}
          hoveredFlight={panelFlight}
        />
        {panelFlight && (
          <HoverPanel
            flight={panelFlight}
            onClose={() => { setPinnedFlight(null); setHoveredFlight(null); }}
          />
        )}
      </div>
    </div>
  );
}
