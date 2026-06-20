import type { Flight } from "../../types/index";

interface FlightDetailsProps {
  flight: Flight | null;
}

const CITY_MAP: Record<string, string> = {
  CMN: "Casablanca",
  CDG: "Paris",
  MAD: "Madrid",
  JFK: "New York",
  LHR: "London",
  DXB: "Dubai",
};

const FlightDetails = ({ flight }: FlightDetailsProps) => (
  <section className="panel details-panel">
    <h3 className="section-label">FLIGHT DETAILS</h3>
    {!flight ? (
      <div className="empty-state">SELECT A FLIGHT</div>
    ) : (
      <div className="flight-details-content">
        <div className="route-display">
          <div>
            <strong>{flight.origin}</strong>
            <span>{CITY_MAP[flight.origin] ?? ""}</span>
          </div>
          <svg viewBox="0 0 120 16" aria-hidden="true">
            <path d="M2 8h108M98 2l20 6-20 6" />
          </svg>
          <div>
            <strong>{flight.destination}</strong>
            <span>{CITY_MAP[flight.destination] ?? ""}</span>
          </div>
        </div>
        <span className={`status-badge status-${flight.status.toLowerCase()}`}>{flight.status}</span>
        <dl className="detail-grid flight-grid">
          <dt>DEP TIME</dt>
          <dd>{new Date(flight.departureTime).toISOString().slice(11, 16)}</dd>
          <dt>ARR TIME</dt>
          <dd>{new Date(flight.arrivalTime).toISOString().slice(11, 16)}</dd>
          <dt>GATE</dt>
          <dd>{flight.gate}</dd>
          <dt>AIRCRAFT</dt>
          <dd>{flight.aircraftId}</dd>
        </dl>
        <hr />
        <small>AIRCRAFT ID: {flight.aircraftId}</small>
      </div>
    )}
  </section>
);

export default FlightDetails;
