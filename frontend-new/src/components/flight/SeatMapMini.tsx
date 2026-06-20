import type { SeatMap, Passenger } from '@/types';

interface Props {
  seatMap: SeatMap | null;
  selectedPassenger: Passenger | null;
  onSeatClick: (seatId: string) => void;
}

const CLASS_LABELS: Record<string, string> = {
  FIRST: '— FIRST CLASS —',
  BUSINESS: '— BUSINESS CLASS —',
  ECONOMY: '— ECONOMY CLASS —',
};

export default function SeatMapMini({
  seatMap, selectedPassenger, onSeatClick
}: Props) {

  if (!seatMap || seatMap.rows.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-xs text-gray-400 dark:text-[#2a5080]">
          No seat data available
        </p>
      </div>
    );
  }

  const getSeatColor = (seatId: string, status: string) => {
    if (selectedPassenger?.seatId === seatId)
      return 'bg-[#C9A84C] ring-1 ring-[#C9A84C]/50';
    if (status === 'OCCUPIED') return 'bg-[#C41E3A]';
    if (status === 'UNAVAILABLE') return 'bg-gray-400 dark:bg-gray-600';
    return 'bg-[#4CAF82]';
  };

  let lastClass = '';

  return (
    <div className="overflow-auto max-h-full px-2">
      {/* Selected passenger label */}
      {selectedPassenger && (
        <div className="text-center mb-2 py-1 px-3 rounded-lg
          bg-[#C9A84C]/10 border border-[#C9A84C]/30">
          <span className="text-[10px] font-medium text-[#C9A84C]">
            {selectedPassenger.firstName} {selectedPassenger.lastName}
            {' '}— Seat {selectedPassenger.seatId}
          </span>
        </div>
      )}

      {/* Seat rows */}
      <div className="flex flex-col items-center gap-0.5">
        {seatMap.rows.map((row) => {
          const showLabel = row.seatClass !== lastClass;
          lastClass = row.seatClass;
          return (
            <div key={row.rowNumber}>
              {showLabel && (
                <div className="text-[8px] text-center
                  text-gray-400 dark:text-[#2a5080]
                  uppercase tracking-widest my-1">
                  {CLASS_LABELS[row.seatClass]}
                </div>
              )}
              <div className="flex items-center gap-0.5">
                <span className="text-[8px] text-gray-300
                  dark:text-[#1a3050] w-3 text-right mr-0.5">
                  {row.rowNumber}
                </span>
                {row.seats.map((seat, idx) => {
                  if (seat.type === 'AISLE') {
                    return <div key={idx} className="w-2" />;
                  }
                  return (
                    <button
                      key={idx}
                      onClick={() => seat.seatId && onSeatClick(seat.seatId)}
                      title={seat.seatId || ''}
                      className={`w-3.5 h-3.5 rounded-[2px]
                        transition-all hover:scale-110
                        ${getSeatColor(seat.seatId || '', seat.status || '')}
                      `}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 mt-3">
        {[
          { color: 'bg-[#4CAF82]', label: 'Available' },
          { color: 'bg-[#C41E3A]', label: 'Occupied' },
          { color: 'bg-[#C9A84C]', label: 'Selected' },
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1">
            <span className={`w-2.5 h-2.5 rounded-[2px] ${color}`} />
            <span className="text-[9px] text-gray-400 dark:text-[#2a5080]">
              {label}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
