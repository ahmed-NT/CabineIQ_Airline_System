import { useMemo, useRef } from 'react';
import { useTheme } from '@/hooks/useTheme';
import type { SeatStatus } from '@/types';
import { TbX, TbArmchair, TbDoorExit, TbBath, TbCoffee } from 'react-icons/tb';

interface Props {
  occupiedSeats?: string[];
  seatStatuses?: Record<string, SeatStatus>;
  selectedSeat: string | null;
  totalSeats?: number;
  rows?: number;
  onSeatClick?: (seatId: string) => void;
}

function getClass(row: number) {
  if (row <= 2) return 'FIRST';
  if (row <= 6) return 'BUSINESS';
  return 'ECONOMY';
}

function getClassColor(cls: string, isDark: boolean) {
  if (cls === 'FIRST') return isDark ? '#ea580c' : '#f97316'; // Orange
  if (cls === 'BUSINESS') return isDark ? '#2563eb' : '#3b82f6'; // Blue
  return isDark ? '#475569' : '#94a3b8'; // Neutral Gray
}

function getClassBg(cls: string, isDark: boolean) {
  if (cls === 'FIRST') return isDark ? '#431407' : '#fff7ed';
  if (cls === 'BUSINESS') return isDark ? '#1e3a8a' : '#eff6ff';
  return isDark ? '#1e293b' : '#f8fafc';
}

export default function Aircraft3D({
  occupiedSeats = [],
  seatStatuses,
  selectedSeat,
  rows = 30,
  onSeatClick,
}: Props) {
  const { isDark } = useTheme();
  const scrollRef = useRef<HTMLDivElement>(null);

  const bg = isDark ? '#020617' : '#f1f5f9';
  const panelBg = isDark ? '#0f172a' : '#ffffff';
  const borderColor = isDark ? '#1e293b' : '#e2e8f0';
  const textPrimary = isDark ? '#f8fafc' : '#0f172a';
  const textSecondary = isDark ? '#64748b' : '#64748b';
  
  const occupiedFill = isDark ? '#334155' : '#cbd5e1';
  const occupiedText = isDark ? '#94a3b8' : '#64748b';
  const unavailableFill = isDark ? '#1e293b' : '#f1f5f9';

  // Seat layout math (Vertical)
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
  
  // X coordinates (Columns)
  const SEAT_W = 32;
  const SEAT_GAP_X = 6;
  const AISLE_W = 34;
  const SIDE_PADDING = 30;

  const getX = (colIdx: number) => {
    let x = SIDE_PADDING;
    if (colIdx < 3) {
      x += colIdx * (SEAT_W + SEAT_GAP_X);
    } else {
      x += 3 * (SEAT_W + SEAT_GAP_X) + AISLE_W - SEAT_GAP_X + (colIdx - 3) * (SEAT_W + SEAT_GAP_X);
    }
    return x;
  };

  const aisleX = SIDE_PADDING + 3 * (SEAT_W + SEAT_GAP_X) - SEAT_GAP_X;
  const fuselageW = SIDE_PADDING * 2 + 6 * SEAT_W + 5 * SEAT_GAP_X + AISLE_W;

  // Y coordinates (Rows)
  const getRowY = (row: number) => {
    let y = 60; // Initial top padding
    y += 80; // Front galley/lavatory space

    for (let i = 1; i < row; i++) {
      if (i === 1 || i === 2) y += 44; // First Class
      else if (i <= 6) y += 40; // Business
      else y += 36; // Economy

      // Facilities and dividers
      if (i === 2) y += 80; // divider
      if (i === 6) y += 80; // divider
      if (i === 15) y += 60; // emergency exit
    }
    return y;
  };

  const getSeatHeight = (row: number) => {
    if (row <= 2) return 36;
    if (row <= 6) return 32;
    return 28;
  };

  const allSeats = useMemo(() => {
    const seats = [];
    for (let r = 1; r <= rows; r++)
      for (let c = 0; c < 6; c++) {
        const seatId = `${r}${letters[c]}`;
        let status: SeatStatus = 'AVAILABLE';
        if (seatStatuses?.[seatId]) status = seatStatuses[seatId];
        else if (occupiedSeats.includes(seatId)) status = 'OCCUPIED';
        seats.push({
          seatId,
          row: r,
          col: c,
          status,
          cls: getClass(r),
        });
      }
    return seats;
  }, [occupiedSeats, seatStatuses, rows]);

  const canvasH = getRowY(rows) + 120;

  // Render Facility (Lavatory, Galley)
  const renderFacility = (x: number, y: number, w: number, h: number, type: 'lavatory' | 'galley' | 'closet', label: string) => {
    const Icon = type === 'lavatory' ? TbBath : type === 'galley' ? TbCoffee : TbArmchair;
    return (
      <div
        key={`${type}-${x}-${y}`}
        className="absolute flex flex-col items-center justify-center border rounded-md"
        style={{
          left: x,
          top: y,
          width: w,
          height: h,
          backgroundColor: isDark ? '#1e293b' : '#f8fafc',
          borderColor: isDark ? '#334155' : '#e2e8f0',
          color: textSecondary,
        }}
      >
        <Icon className="w-5 h-5 mb-1 opacity-70" />
        <span className="text-[9px] font-semibold tracking-wider uppercase opacity-80">{label}</span>
      </div>
    );
  };

  const renderExit = (y: number, left: boolean) => (
    <div
      key={`exit-${y}-${left}`}
      className="absolute flex items-center justify-center"
      style={{
        left: left ? SIDE_PADDING - 28 : fuselageW - SIDE_PADDING + 8,
        top: y - 10,
        width: 20,
        height: 20,
        color: '#ef4444',
      }}
    >
      <TbDoorExit className="w-5 h-5" />
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col" style={{ background: bg }}>
      {/* Legend */}
      <div
        className="flex-shrink-0 flex items-center justify-center gap-6 py-3 border-b shadow-sm z-10"
        style={{ background: panelBg, borderColor }}
      >
        <div className="flex gap-4 border-r pr-6" style={{ borderColor }}>
          {[
            { cls: 'FIRST', label: 'First Class' },
            { cls: 'BUSINESS', label: 'Business' },
            { cls: 'ECONOMY', label: 'Economy' },
          ].map(({ cls, label }) => (
            <span key={cls} className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-sm border-2"
                style={{ borderColor: getClassColor(cls, isDark), background: getClassBg(cls, isDark) }}
              />
              <span className="text-[11px] font-medium" style={{ color: textSecondary }}>
                {label}
              </span>
            </span>
          ))}
        </div>
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-sm flex items-center justify-center"
              style={{ background: occupiedFill }}
            >
              <TbX className="w-2.5 h-2.5" style={{ color: occupiedText }} />
            </span>
            <span className="text-[11px] font-medium" style={{ color: textSecondary }}>
              Occupied
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-sm border-[2px]"
              style={{ borderColor: '#38bdf8', background: 'transparent' }}
            />
            <span className="text-[11px] font-medium" style={{ color: textSecondary }}>
              Selected
            </span>
          </span>
        </div>
      </div>

      {/* Map Container */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto relative p-8 flex justify-center"
        style={{ background: bg }}
      >
        <div
          className="relative rounded-[40px] border-[3px] shadow-sm flex-shrink-0"
          style={{
            width: fuselageW,
            height: canvasH,
            backgroundColor: panelBg,
            borderColor: isDark ? '#334155' : '#cbd5e1',
          }}
        >
          {/* Fuselage padding areas */}
          <div className="absolute top-0 left-0 w-full rounded-t-[40px]" style={{ height: 60, backgroundColor: 'rgba(0,0,0,0.02)' }} />
          <div className="absolute bottom-0 left-0 w-full rounded-b-[40px]" style={{ height: 60, backgroundColor: 'rgba(0,0,0,0.02)' }} />

          {/* Letter labels (Left) */}
          {letters.slice(0, 3).map((l, i) => (
            <div
              key={`label-l-${l}`}
              className="absolute text-[11px] font-bold"
              style={{
                top: 24,
                left: getX(i) + SEAT_W / 2 - 4,
                color: textSecondary,
              }}
            >
              {l}
            </div>
          ))}
          
          {/* Letter labels (Right) */}
          {letters.slice(3, 6).map((l, i) => (
            <div
              key={`label-r-${l}`}
              className="absolute text-[11px] font-bold"
              style={{
                top: 24,
                left: getX(i + 3) + SEAT_W / 2 - 4,
                color: textSecondary,
              }}
            >
              {l}
            </div>
          ))}

          {/* Facilities */}
          {/* Front */}
          {renderFacility(SIDE_PADDING, 60, SEAT_W * 2 + SEAT_GAP_X, 60, 'lavatory', 'WC')}
          {renderFacility(fuselageW - SIDE_PADDING - SEAT_W * 2 - SEAT_GAP_X, 60, SEAT_W * 2 + SEAT_GAP_X, 60, 'galley', 'Galley')}
          {renderExit(130, true)}
          {renderExit(130, false)}

          {/* Mid 1 (After First) */}
          {renderFacility(SIDE_PADDING, getRowY(3) - 60, SEAT_W * 2 + SEAT_GAP_X, 40, 'closet', 'Coat')}
          
          {/* Mid 2 (After Business) */}
          {renderFacility(SIDE_PADDING, getRowY(7) - 65, SEAT_W * 2 + SEAT_GAP_X, 45, 'lavatory', 'WC')}
          {renderFacility(fuselageW - SIDE_PADDING - SEAT_W * 2 - SEAT_GAP_X, getRowY(7) - 65, SEAT_W * 2 + SEAT_GAP_X, 45, 'lavatory', 'WC')}
          {renderExit(getRowY(7) - 20, true)}
          {renderExit(getRowY(7) - 20, false)}

          {/* Mid 3 (Emergency Exit) */}
          {renderExit(getRowY(16) - 30, true)}
          {renderExit(getRowY(16) - 30, false)}

          {/* Rear */}
          {renderFacility(SIDE_PADDING, getRowY(rows) + 50, SEAT_W * 3 + SEAT_GAP_X * 2, 50, 'lavatory', 'WC')}
          {renderFacility(fuselageW - SIDE_PADDING - SEAT_W * 3 - SEAT_GAP_X * 2, getRowY(rows) + 50, SEAT_W * 3 + SEAT_GAP_X * 2, 50, 'galley', 'Galley')}

          {/* Class Dividers */}
          <div className="absolute border-t-2 border-dashed w-full" style={{ left: 0, top: getRowY(3) - 40, borderColor: isDark ? '#334155' : '#cbd5e1' }} />
          <div className="absolute border-t-2 border-dashed w-full" style={{ left: 0, top: getRowY(7) - 40, borderColor: isDark ? '#334155' : '#cbd5e1' }} />

          {/* Row Numbers in Aisle */}
          {Array.from({ length: rows }, (_, i) => (
            <div
              key={`row-num-${i}`}
              className="absolute flex items-center justify-center font-bold text-[11px]"
              style={{
                top: getRowY(i + 1),
                left: aisleX,
                width: AISLE_W,
                height: getSeatHeight(i + 1),
                color: isDark ? '#475569' : '#94a3b8',
              }}
            >
              {i + 1}
            </div>
          ))}

          {/* Seats */}
          {allSeats.map(({ seatId, row, col, status, cls }) => {
            const y = getRowY(row);
            const x = getX(col);
            const h = getSeatHeight(row);
            const w = SEAT_W;
            const isSelected = selectedSeat === seatId;
            const isOccupied = status === 'OCCUPIED';
            const isUnavailable = status === 'UNAVAILABLE';

            const accentColor = getClassColor(cls, isDark);
            const bgColor = isOccupied ? occupiedFill : isUnavailable ? unavailableFill : getClassBg(cls, isDark);
            const strokeColor = isSelected ? '#38bdf8' : isOccupied || isUnavailable ? borderColor : accentColor;

            return (
              <button
                key={seatId}
                onClick={() => onSeatClick?.(seatId)}
                disabled={!onSeatClick}
                className="absolute flex items-center justify-center rounded-[6px] transition-all hover:brightness-110 disabled:cursor-default"
                style={{
                  left: x,
                  top: y,
                  width: w,
                  height: h,
                  backgroundColor: bgColor,
                  border: `2px solid ${strokeColor}`,
                  boxShadow: isSelected ? `0 0 0 2px ${strokeColor}40` : 'none',
                  zIndex: isSelected ? 10 : 1,
                  transform: isSelected ? 'scale(1.05)' : 'none',
                }}
              >
                {/* Armrest visual hints */}
                {!isOccupied && !isUnavailable && (
                  <>
                    <div className="absolute top-1 left-1 bottom-1 w-1 rounded-sm opacity-20" style={{ backgroundColor: accentColor }} />
                    <div className="absolute top-1 right-1 bottom-1 w-1 rounded-sm opacity-20" style={{ backgroundColor: accentColor }} />
                  </>
                )}

                {isOccupied && <TbX className="w-5 h-5" style={{ color: occupiedText }} />}
                {isUnavailable && <div className="w-full h-px rotate-45" style={{ backgroundColor: borderColor }} />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
