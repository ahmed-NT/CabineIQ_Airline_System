import { useMemo, useRef } from 'react';
import { useTheme } from '@/hooks/useTheme';
import type { SeatStatus } from '@/types';
import { TbX, TbArmchair, TbDoorExit, TbBath, TbCoffee, TbAlertTriangle, TbStarFilled } from 'react-icons/tb';

export interface SeatScoreInfo {
  score: number;
  lostItem: boolean;
}

interface Props {
  occupiedSeats?: string[];
  seatStatuses?: Record<string, SeatStatus>;
  scoreData?: Record<string, SeatScoreInfo>;
  selectedSeat: string | null;
  totalSeats?: number;
  rows?: number;
  seatsPerRow?: number;
  seatMap?: any;
  layoutType?: string;
  onSeatClick?: (seatId: string) => void;
}

function getClass(row: number, rowClassMap?: Map<number, string>) {
  if (rowClassMap?.has(row)) return rowClassMap.get(row)!;
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

// Derive seat letters directly from a known layoutType (used before seatMap loads)
function getLettersForLayout(layoutType?: string): string[] | null {
  switch (layoutType?.toUpperCase()) {
    case 'B737_800': case 'B737_MAX8': case 'B737':
      return ['A','B','C','D','E','F'];
    case 'B787_8': case 'B787_9':
      return ['A','B','C','D','E','F','G','H','J'];
    case 'ATR72':
      return ['A','B','C','D'];
    default:
      return null;
  }
}

export default function Aircraft3D({
  occupiedSeats = [],
  seatStatuses,
  scoreData,
  selectedSeat,
  rows = 30,
  seatsPerRow,
  seatMap,
  layoutType,
  onSeatClick,
}: Props) {
  const { isDark } = useTheme();
  const scrollRef = useRef<HTMLDivElement>(null);

  const bg = isDark ? '#020617' : '#f1f5f9';
  const panelBg = isDark ? '#0f172a' : '#ffffff';
  const borderColor = isDark ? '#1e293b' : '#e2e8f0';
  const textSecondary = isDark ? '#64748b' : '#64748b';
  
  const occupiedFill = isDark ? '#334155' : '#cbd5e1';
  const occupiedText = isDark ? '#94a3b8' : '#64748b';

  // ── Detect layout from seat letters in first row ───────────────────────────
  // Narrow (6):  A B C | D E F          → 1 aisle after col 2
  // Wide   (9):  A B C | D E F G | H J  → 2 aisles after col 2 and col 6
  // Regional(4): A B | C D              → 1 aisle after col 1
  // Build row→class map from actual seat data
  const rowClassMap = useMemo<Map<number, string>>(() => {
    const map = new Map<number, string>();
    if (seatMap?.rows) {
      for (const row of seatMap.rows) {
        if (row.rowNumber && row.seatClass) {
          map.set(row.rowNumber, row.seatClass);
        }
      }
    }
    return map;
  }, [seatMap]);

  const allLettersInMap = useMemo(() => {
    // Priority 1: seatsPerRow from aircraft entity — always in DB, always correct
    if (seatsPerRow === 9) return ['A','B','C','D','E','F','G','H','J'];
    if (seatsPerRow === 4) return ['A','B','C','D'];
    if (seatsPerRow === 6) return ['A','B','C','D','E','F'];

    // Priority 2: layoutType string
    const fromLayout = getLettersForLayout(layoutType);
    if (fromLayout) return fromLayout;

    // Priority 3: seatLetter values from seat map rows
    if (seatMap?.rows && seatMap.rows.length > 0) {
      const widestRow = seatMap.rows.reduce((max: any, row: any) =>
        row.seats.length > max.seats.length ? row : max, seatMap.rows[0]);
      const letters = widestRow.seats.map((s: any) => s.seatLetter).filter(Boolean);
      if (letters.length > 0) return letters;
    }

    return ['A','B','C','D','E','F'];
  }, [seatMap, layoutType, seatsPerRow]);

  const letters = allLettersInMap.length > 0 ? allLettersInMap : ['A','B','C','D','E','F'];
  const colCount = letters.length;

  // Aisle positions: index AFTER which an aisle appears
  // Letters: A=0 B=1 C=2 D=3 E=4 F=5 G=6 H=7 J=8
  const aisleAfter: number[] = colCount === 9
    ? [2, 5]   // 3+3+3 (wide body): aisles after C(2) and F(5)
    : colCount === 4
    ? [1]      // 2+2 (regional): aisle after B(1)
    : [2];     // 3+3 (narrow): aisle after C(2)

  // X coordinates (Columns)
  const SEAT_W = colCount >= 9 ? 26 : 32;
  const SEAT_GAP_X = 6;
  const AISLE_W = 34;
  const SIDE_PADDING = 30;

  const getX = (colIdx: number) => {
    let x = SIDE_PADDING;
    let aisleCount = 0;
    for (let i = 0; i < colIdx; i++) {
      x += SEAT_W + SEAT_GAP_X;
      if (aisleAfter.includes(i)) { x += AISLE_W - SEAT_GAP_X; aisleCount++; }
    }
    return x;
  };

  const aisleXList = aisleAfter.map((afterIdx) => {
    let x = SIDE_PADDING;
    for (let i = 0; i <= afterIdx; i++) {
      x += SEAT_W + SEAT_GAP_X;
      if (i < afterIdx && aisleAfter.includes(i)) x += AISLE_W - SEAT_GAP_X;
    }
    return x - SEAT_GAP_X;
  });

  const fuselageW = SIDE_PADDING * 2 + colCount * SEAT_W + (colCount - 1) * SEAT_GAP_X + AISLE_W * aisleAfter.length;

  // Detect class-change rows for dividers
  const classDividerRows = useMemo(() => {
    const dividers = new Set<number>();
    let prev = '';
    for (let r = 1; r <= rows; r++) {
      const cls = getClass(r, rowClassMap);
      if (prev && cls !== prev) dividers.add(r);
      prev = cls;
    }
    return dividers;
  }, [rowClassMap, rows]);

  // Y coordinates (Rows)
  const getRowY = (row: number) => {
    let y = 60; // Initial top padding
    y += 80; // Front galley/lavatory space

    for (let i = 1; i < row; i++) {
      const cls = getClass(i, rowClassMap);
      if (cls === 'FIRST') y += 44;
      else if (cls === 'BUSINESS') y += 40;
      else y += 36;

      // Dividers at class boundaries + emergency exit mid-economy
      if (classDividerRows.has(i + 1)) y += 80;
      if (i === 15 && getClass(i, rowClassMap) === 'ECONOMY') y += 60;
    }
    return y;
  };

  const getSeatHeight = (row: number) => {
    const cls = getClass(row, rowClassMap);
    if (cls === 'FIRST') return 36;
    if (cls === 'BUSINESS') return 32;
    return 28;
  };

  const allSeats = useMemo(() => {
    const seats = [];
    for (let r = 1; r <= rows; r++)
      for (let c = 0; c < colCount; c++) {
        const seatId = `${r}${letters[c]}`;
        let status: SeatStatus = 'AVAILABLE';
        if (seatStatuses?.[seatId]) status = seatStatuses[seatId];
        else if (occupiedSeats.includes(seatId)) status = 'OCCUPIED';
        seats.push({
          seatId,
          row: r,
          col: c,
          status,
          cls: getClass(r, rowClassMap),
        });
      }
    return seats;
  }, [occupiedSeats, seatStatuses, rows, colCount, letters, rowClassMap]);

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
        <>
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
            {scoreData && (
              <>
                <span className="flex items-center gap-1.5">
                  <span className="flex gap-px">
                    {[1,2,3].map(i => <TbStarFilled key={i} style={{ width: 8, height: 8, color: '#EF9F27' }} />)}
                  </span>
                  <span className="text-[11px] font-medium" style={{ color: textSecondary }}>
                    Score
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm border-2 flex items-center justify-center" style={{ borderColor: '#EF9F27', background: 'transparent' }}>
                    <TbAlertTriangle style={{ width: 8, height: 8, color: '#EF9F27' }} />
                  </span>
                  <span className="text-[11px] font-medium" style={{ color: textSecondary }}>
                    Lost Item
                  </span>
                </span>
              </>
            )}
          </div>
        </>
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

          {/* Letter labels — all columns dynamically */}
          {letters.map((l: string, i: number) => (
            <div
              key={`label-${l}`}
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

          {/* Facilities */}
          {/* Front */}
          {renderFacility(SIDE_PADDING, 60, SEAT_W * 2 + SEAT_GAP_X, 60, 'lavatory', 'WC')}
          {renderFacility(fuselageW - SIDE_PADDING - SEAT_W * 2 - SEAT_GAP_X, 60, SEAT_W * 2 + SEAT_GAP_X, 60, 'galley', 'Galley')}
          {renderExit(130, true)}
          {renderExit(130, false)}

          {/* Mid facilities — placed at actual class divider boundaries */}
          {(() => {
            const dividers = Array.from(classDividerRows).sort((a, b) => a - b);
            const d1 = dividers[0]; // first class change (e.g. row 5 for B737, row 7 for B787_9)
            const d2 = dividers[1]; // second class change if any (e.g. row 13 for B787_9)
            return <>
              {d1 && renderFacility(SIDE_PADDING, getRowY(d1) - 60, SEAT_W * 2 + SEAT_GAP_X, 40, 'closet', 'Coat')}
              {d2 && renderFacility(SIDE_PADDING, getRowY(d2) - 65, SEAT_W * 2 + SEAT_GAP_X, 45, 'lavatory', 'WC')}
              {d2 && renderFacility(fuselageW - SIDE_PADDING - SEAT_W * 2 - SEAT_GAP_X, getRowY(d2) - 65, SEAT_W * 2 + SEAT_GAP_X, 45, 'lavatory', 'WC')}
              {d2 && renderExit(getRowY(d2) - 20, true)}
              {d2 && renderExit(getRowY(d2) - 20, false)}
            </>;
          })()}

          {/* Mid 3 (Emergency Exit) */}
          {renderExit(getRowY(16) - 30, true)}
          {renderExit(getRowY(16) - 30, false)}

          {/* Rear */}
          {renderFacility(SIDE_PADDING, getRowY(rows) + 50, SEAT_W * 3 + SEAT_GAP_X * 2, 50, 'lavatory', 'WC')}
          {renderFacility(fuselageW - SIDE_PADDING - SEAT_W * 3 - SEAT_GAP_X * 2, getRowY(rows) + 50, SEAT_W * 3 + SEAT_GAP_X * 2, 50, 'galley', 'Galley')}

          {/* Class Dividers — dynamic based on actual seat classes */}
          {Array.from(classDividerRows).map((r) => (
            <div key={`divider-${r}`} className="absolute border-t-2 border-dashed w-full"
              style={{ left: 0, top: getRowY(r) - 40, borderColor: isDark ? '#334155' : '#cbd5e1' }} />
          ))}

          {/* Row Numbers in Aisle(s) */}
          {aisleXList.map((ax, ai) =>
            Array.from({ length: rows }, (_, i) => (
              <div
                key={`row-num-${ai}-${i}`}
                className="absolute flex items-center justify-center font-bold text-[11px]"
                style={{
                  top: getRowY(i + 1),
                  left: ax,
                  width: AISLE_W,
                  height: getSeatHeight(i + 1),
                  color: isDark ? '#475569' : '#94a3b8',
                }}
              >
                {ai === 0 ? i + 1 : ''}
              </div>
            ))
          )}

          {/* Seats */}
          {allSeats.map(({ seatId, row, col, status, cls }) => {
            const y = getRowY(row);
            const x = getX(col);
            const h = getSeatHeight(row);
            const w = SEAT_W;

            // If seatStatuses is loaded but this seat isn't in it → doesn't exist in DB
            const hasSeatData = Object.keys(seatStatuses ?? {}).length > 0;
            const existsInDB = !hasSeatData || (seatStatuses ?? {})[seatId] !== undefined;
            if (!existsInDB) return null;

            const isSelected = selectedSeat === seatId;
            const isOccupied = status === 'OCCUPIED';
            const isUnavailable = status === 'UNAVAILABLE';
            const accentColor = getClassColor(cls, isDark);
            const seatScore = scoreData?.[seatId];
            const hasLostItem = seatScore?.lostItem === true;

            // Seat color by status
            const bgColor = isSelected
              ? '#38bdf820'
              : isOccupied
              ? (isDark ? '#7f1d1d' : '#fee2e2')
              : isUnavailable
              ? (isDark ? '#1e293b' : '#f1f5f9')
              : getClassBg(cls, isDark);

            const strokeColor = isSelected
              ? '#38bdf8'
              : hasLostItem
              ? '#EF9F27'
              : isOccupied
              ? '#ef4444'
              : isUnavailable
              ? (isDark ? '#334155' : '#cbd5e1')
              : accentColor;

            return (
              <div key={seatId} className="absolute" style={{ left: x, top: y }}>
                <button
                  onClick={() => onSeatClick?.(seatId)}
                  disabled={!onSeatClick}
                  className="flex items-center justify-center rounded-[6px] transition-all hover:brightness-110 disabled:cursor-default"
                  style={{
                    width: w,
                    height: h,
                    backgroundColor: bgColor,
                    border: `2px solid ${strokeColor}`,
                    boxShadow: isSelected ? `0 0 0 2px ${strokeColor}40` : 'none',
                    zIndex: isSelected ? 10 : 1,
                    transform: isSelected ? 'scale(1.05)' : 'none',
                  }}
                >
                  {!isOccupied && !isUnavailable && !hasLostItem && (
                    <>
                      <div className="absolute top-1 left-1 bottom-1 w-1 rounded-sm opacity-20" style={{ backgroundColor: accentColor }} />
                      <div className="absolute top-1 right-1 bottom-1 w-1 rounded-sm opacity-20" style={{ backgroundColor: accentColor }} />
                    </>
                  )}
                  {hasLostItem && <TbAlertTriangle className="w-4 h-4" style={{ color: '#EF9F27' }} />}
                  {!hasLostItem && isOccupied && <TbX className="w-5 h-5" style={{ color: '#ef4444' }} />}
                  {!hasLostItem && isUnavailable && <div className="w-3 h-0.5 rotate-45 rounded" style={{ backgroundColor: isDark ? '#475569' : '#94a3b8' }} />}
                </button>
                {seatScore && seatScore.score > 0 && (
                  <div className="flex justify-center" style={{ marginTop: 1, width: w, overflow: 'hidden' }}>
                    {Array.from({ length: seatScore.score }, (_, i) => (
                      <TbStarFilled key={i} style={{ width: 6, height: 6, minWidth: 6, color: '#EF9F27' }} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
