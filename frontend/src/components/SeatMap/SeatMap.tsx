import { useMemo, useState } from "react";
import { useSeatMap } from "../../hooks/useSeatMap";
import type { Flight, SeatClass, SeatNode, SeatStatus } from "../../types/index";
import AircraftOutline from "./AircraftOutline";

interface SeatMapProps {
  selectedFlight: Flight | null;
  highlightedSeatId: string | null;
  onSeatClick: (seatId: string) => void;
}

const SeatMap = ({ selectedFlight, highlightedSeatId, onSeatClick }: SeatMapProps) => {
  const [clickedSeat, setClickedSeat] = useState<string | null>(null);
  const { data, isLoading } = useSeatMap(
    selectedFlight?.aircraftId ?? null,
    selectedFlight?.flightNumber ?? "",
  );

  const stats = useMemo(() => {
    const counts = { AVAILABLE: 0, OCCUPIED: 0, UNAVAILABLE: 0 };
    if (!data) return counts;
    data.rows.forEach((row) =>
      row.seats.forEach((seat) => {
        if (seat.status) counts[seat.status] += 1;
      }),
    );
    return counts;
  }, [data]);

  const onSeatPressed = (seat: SeatNode) => {
    if (!seat.seatId || !seat.status) return;
    setClickedSeat(seat.seatId);
    if (seat.status === "OCCUPIED") onSeatClick(seat.seatId);
  };

  const classLabel = (seatClass: SeatClass) => `${seatClass} CLASS`;
  const classColor = (seatClass: SeatClass) =>
    seatClass === "FIRST"
      ? "var(--ram-gold)"
      : seatClass === "BUSINESS"
        ? "var(--ram-green-bright)"
        : "var(--ram-text-muted)";

  if (!selectedFlight) {
    return (
      <div className="panel seat-panel empty-column">
        <AircraftOutline faded />
        <div className="empty-state">SELECT A FLIGHT TO VIEW SEAT MAP</div>
      </div>
    );
  }

  return (
    <div className="panel seat-panel">
      <div className="seat-topbar">
        <strong className="aircraft-code">{data?.aircraftCode || selectedFlight.flightNumber}</strong>
        <span className="stat-pill stat-available">AVAILABLE {stats.AVAILABLE}</span>
        <span className="stat-pill stat-occupied">OCCUPIED {stats.OCCUPIED}</span>
        <span className="stat-pill stat-unavailable">UNAVAILABLE {stats.UNAVAILABLE}</span>
      </div>
      <div className="seat-map-wrap">
        {isLoading ? <div className="seat-loading shimmer" /> : null}
        <AircraftOutline>
          <div className="seat-grid">
            {(data?.rows ?? []).map((row, index, list) => {
              const previousClass = index > 0 ? list[index - 1].seatClass : null;
              return (
                <div key={row.rowNumber}>
                  {previousClass !== row.seatClass ? (
                    <div className="class-divider" style={{ color: classColor(row.seatClass) }}>
                      {classLabel(row.seatClass)}
                    </div>
                  ) : null}
                  <div className="seat-row">
                    <span className="row-num">{row.rowNumber}</span>
                    {row.seats.map((seat, seatIdx) =>
                      seat.type === "AISLE" ? (
                        <span key={`aisle-${row.rowNumber}-${seatIdx}`} className="aisle-gap" />
                      ) : (
                        <button
                          key={seat.seatId ?? `${row.rowNumber}-${seatIdx}`}
                          id={seat.seatId ?? undefined}
                          type="button"
                          className={`seat-square seat-${(seat.status as SeatStatus).toLowerCase()} ${
                            highlightedSeatId && seat.seatId === highlightedSeatId ? "highlighted pulse-gold" : ""
                          }`}
                          onClick={() => onSeatPressed(seat)}
                        >
                          {seat.seatId}
                          {seat.status === "AVAILABLE" && clickedSeat === seat.seatId ? (
                            <span className="seat-tooltip">AVAILABLE</span>
                          ) : null}
                        </button>
                      ),
                    )}
                    <span className="row-num">{row.rowNumber}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </AircraftOutline>
      </div>
    </div>
  );
};

export default SeatMap;
