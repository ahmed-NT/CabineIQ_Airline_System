import { useRef, useEffect, useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Flight } from '@/types';
import { getFlightArc, AIRPORTS } from '@/data/airports';
import { flightsAPI } from '@/lib/api';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  flights: Flight[];
  hoveredFlight: Flight | null;
}

// Arc colour by real flight status — matches the live status legend.
const ARC_COLORS: Record<string, string> = {
  SCHEDULED: '#6b7280',
  BOARDING:  '#a78bfa',
  DEPARTED:  '#38bdf8',
  ARRIVED:   '#22c55e',
  DELAYED:   '#fbbf24',
  CANCELLED: '#f87171',
  ROUTE:     '#C41E3A',
};

const AVIATIONSTACK_STATUS_MAP: Record<string, string> = {
  scheduled: 'SCHEDULED',
  active: 'DEPARTED',
  landed: 'ARRIVED',
  cancelled: 'CANCELLED',
  incident: 'DELAYED',
  diverted: 'DELAYED',
};

export default function GlobeMap({ flights, hoveredFlight }: Props) {
  const { isDark } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<any>(null);
  const [Globe, setGlobe] = useState<any>(null);
  const [dimensions, setDimensions] = useState({
    width: 800,
    height: 600,
  });

  const globeBg = isDark ? '#07162c' : '#ffffff';
  const labelPrimary = isDark ? '#1a4060' : '#94a3b8';
  const labelSecondary = isDark ? '#1a3050' : '#cbd5e1';
  const loadingText = isDark ? '#1a3050' : '#94a3b8';
  const atmosphereColor = isDark ? '#1a4060' : '#cbd5e1';
  const globeImageUrl = isDark
    ? '//unpkg.com/three-globe/example/img/earth-night.jpg'
    : '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg';
  const canvasBg = isDark ? '#07162c00' : '#ffffff00';
  const hoverArcColor = isDark ? '#ffffff' : '#1e293b';
  const labelColor = isDark
    ? 'rgba(74, 122, 171, 0.9)'
    : 'rgba(71, 85, 105, 0.9)';

  // Dynamically import react-globe.gl
  useEffect(() => {
    import('react-globe.gl').then(mod => {
      setGlobe(() => mod.default);
    });
  }, []);

  // ResizeObserver to track container size
  useEffect(() => {
    if (!containerRef.current) return;

    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    // Set initial size
    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Auto-rotate globe
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!globeRef.current) return;
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 0.3;
      globeRef.current.controls().enableZoom = true;
      globeRef.current.pointOfView({ altitude: 2.5 });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [Globe, isDark]);

  const arcs = useMemo(() => {
    return flights
      .filter(f => f.status !== 'CANCELLED' && f.status !== 'ARRIVED')
      .map(f => {
        const arc = getFlightArc(f.origin, f.destination);
        if (!arc) return null;
        return {
          ...arc,
          flightId: f.id,
          flightNumber: f.flightNumber,
          status: f.status,
          color: ARC_COLORS[f.status] || '#6b7280',
          isHovered: hoveredFlight?.id === f.id,
        };
      })
      .filter(Boolean);
  }, [flights, hoveredFlight]);

  // AviationStack routes for Royal Air Maroc, refreshed every 5 min.
  const { data: aviationRoutes = [] } = useQuery({
    queryKey: ['aviation-routes'],
    queryFn: () => flightsAPI.getRoutes().then((r) => r.data),
    refetchInterval: 300000,
    retry: false,
  });

  // AviationStack routes rendered as arcs (RAM network from real API data).
  const routeArcs = useMemo(() => {
    const dbIatas = new Set(flights.map(f => `${f.origin}-${f.destination}`));
    return (aviationRoutes as any[])
      .filter((r) => {
        if (!r.departureIata || !r.arrivalIata) return false;
        if (dbIatas.has(`${r.departureIata}-${r.arrivalIata}`)) return false;
        const src = AIRPORTS[r.departureIata];
        const dst = AIRPORTS[r.arrivalIata];
        return src && dst;
      })
      .map((r) => {
        const src = AIRPORTS[r.departureIata];
        const dst = AIRPORTS[r.arrivalIata];
        const mappedStatus = AVIATIONSTACK_STATUS_MAP[r.flightStatus] || 'SCHEDULED';
        return {
          startLat: src.lat, startLng: src.lng,
          endLat: dst.lat, endLng: dst.lng,
          status: mappedStatus,
          color: ARC_COLORS[mappedStatus] || ARC_COLORS.ROUTE,
          flightNumber: r.flightIata,
          isHovered: false,
        };
      });
  }, [aviationRoutes, flights]);

  const allArcs = useMemo(() => [...arcs, ...routeArcs], [arcs, routeArcs]);

  const points = useMemo(() => {
    const seen = new Set<string>();
    const pts: any[] = [];
    flights.forEach(f => {
      if (!seen.has(f.origin)) {
        const ap = AIRPORTS[f.origin];
        if (ap) {
          pts.push({
            lat: ap.lat, lng: ap.lng,
            label: f.origin, isOrigin: true,
          });
          seen.add(f.origin);
        }
      }
      if (!seen.has(f.destination)) {
        const ap = AIRPORTS[f.destination];
        if (ap) {
          pts.push({
            lat: ap.lat, lng: ap.lng,
            label: f.destination, isOrigin: false,
          });
          seen.add(f.destination);
        }
      }
    });
    (aviationRoutes as any[]).forEach((r) => {
      if (r.departureIata && !seen.has(r.departureIata)) {
        const ap = AIRPORTS[r.departureIata];
        if (ap) {
          pts.push({ lat: ap.lat, lng: ap.lng, label: r.departureIata, isOrigin: true });
          seen.add(r.departureIata);
        }
      }
      if (r.arrivalIata && !seen.has(r.arrivalIata)) {
        const ap = AIRPORTS[r.arrivalIata];
        if (ap) {
          pts.push({ lat: ap.lat, lng: ap.lng, label: r.arrivalIata, isOrigin: false });
          seen.add(r.arrivalIata);
        }
      }
    });
    return pts;
  }, [flights, aviationRoutes]);

  if (!Globe) {
    return (
      <div
        ref={containerRef}
        className="flex-1 w-full h-full"
        style={{ background: globeBg }}
      >
        <div
          className="flex items-center justify-center h-full text-sm"
          style={{ color: loadingText }}
        >
          Loading globe...
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 w-full h-full relative"
      style={{ background: globeBg, overflow: 'hidden' }}
    >
      {/* Labels */}
      <div
        className="absolute top-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none text-[9px] tracking-[1.5px] uppercase"
        style={{ color: labelPrimary }}
      >
        GLOBAL FLIGHT TRACKER
      </div>
      <div
        className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none text-[9px]"
        style={{ color: labelSecondary }}
      >
        drag to rotate · scroll to zoom
      </div>

      <Globe
        key={isDark ? 'dark' : 'light'}
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor={canvasBg}
        globeImageUrl={globeImageUrl}
        atmosphereColor={atmosphereColor}
        atmosphereAltitude={0.15}
        // Arcs (DB flights + live flights) — one solid colour per status
        arcsData={allArcs}
        arcStartLat={(d: any) => d.startLat}
        arcStartLng={(d: any) => d.startLng}
        arcEndLat={(d: any) => d.endLat}
        arcEndLng={(d: any) => d.endLng}
        arcColor={(d: any) => d.isHovered ? hoverArcColor : d.color}
        arcAltitude={(d: any) => d.startLng <= d.endLng ? 0.22 : 0.34}
        arcStroke={(d: any) => d.isHovered ? 1.5 : 0.5}
        arcDashLength={1}
        arcDashGap={0}
        arcDashAnimateTime={0}
        // Points
        pointsData={points}
        pointLat={(d: any) => d.lat}
        pointLng={(d: any) => d.lng}
        pointColor={(d: any) =>
          d.isOrigin ? '#C41E3A' : '#38bdf8'}
        pointAltitude={0.01}
        pointRadius={0.5}
        pointLabel={(d: any) => d.label}
        // Labels
        labelsData={points}
        labelLat={(d: any) => d.lat}
        labelLng={(d: any) => d.lng}
        labelText={(d: any) => d.label}
        labelSize={1.2}
        labelColor={() => labelColor}
        labelDotRadius={0.3}
        labelAltitude={0.015}
      />
    </div>
  );
}
