import type { Passenger, SeatClass } from "../../types/index";

interface PassengerInfoProps {
  passenger: Passenger | null;
  seatClass: SeatClass | null;
  onLocate: (seatId: string) => void;
}

const PassengerInfo = ({ passenger, seatClass, onLocate }: PassengerInfoProps) => {
  const className =
    seatClass === "FIRST"
      ? "pill-first"
      : seatClass === "BUSINESS"
        ? "pill-business"
        : "pill-economy";

  return (
    <section className="panel passenger-panel">
      <h3 className="section-label">PASSENGER</h3>
      {!passenger ? (
        <div className="empty-state">NO PASSENGER SELECTED</div>
      ) : (
        <div className="passenger-details">
          <h2 className="passenger-name">{passenger.fullName}</h2>
          <div className="passenger-row">
            <span className={`seat-class-pill ${className}`}>{seatClass ?? "UNKNOWN"}</span>
            <strong className="passenger-seat">{passenger.seatId}</strong>
          </div>
          <dl className="detail-grid">
            <dt>Passport</dt>
            <dd>{passenger.passportNumber}</dd>
            <dt>Nationality</dt>
            <dd>{passenger.nationality}</dd>
            <dt>Email</dt>
            <dd>{passenger.email}</dd>
            <dt>Flight</dt>
            <dd>{passenger.flightId}</dd>
          </dl>
          <button type="button" className="outline-btn" onClick={() => onLocate(passenger.seatId)}>
            LOCATE ON MAP
          </button>
        </div>
      )}
    </section>
  );
};

export default PassengerInfo;
