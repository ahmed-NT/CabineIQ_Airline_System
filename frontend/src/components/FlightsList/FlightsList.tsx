import type { Flight } from "../../types/index";
import { useFlights } from "../../hooks/useFlights";

interface FlightsListProps {
  selectedFlight: Flight | null;
  onSelectFlight: (flight: Flight) => void;
}

const statusClass = (status: Flight["status"]) => `status-badge status-${status.toLowerCase()}`;

const FlightsList = ({ selectedFlight, onSelectFlight }: FlightsListProps) => {
  const { data, isLoading } = useFlights();
  const flights = data ?? [];

  return (
    <div className="panel flights-panel">
      <div className="panel-title-row">
        <h2 className="panel-title">FLIGHTS</h2>
        <span className="count-badge">{flights.length}</span>
      </div>
      {isLoading ? (
        <div>
          {Array.from({ length: 5 }).map((_, index) => (
            <div className="flight-card skeleton shimmer" key={`skeleton-${index}`} />
          ))}
        </div>
      ) : null}
      {!isLoading && flights.length === 0 ? (
        <div className="empty-state">NO FLIGHTS AVAILABLE</div>
      ) : null}
      {flights.map((flight) => {
        const selected = selectedFlight?.id === flight.id;
        return (
          <article
            key={flight.id}
            className={`flight-card ${selected ? "selected" : ""}`}
            onClick={() => onSelectFlight(flight)}
          >
            <div className="flight-row">
              <strong className={`flight-number ${flight.status === "CANCELLED" ? "strikethrough" : ""}`}>
                {flight.flightNumber}
              </strong>
              <span className="flight-time">{new Date(flight.departureTime).toISOString().slice(11, 16)}</span>
            </div>
            <div className="flight-route">
              <span>{flight.origin}</span>
              <span className="route-arrow">→</span>
              <span>{flight.destination}</span>
            </div>
            <span className={statusClass(flight.status)}>{flight.status}</span>
          </article>
        );
      })}
    </div>
  );
};

export default FlightsList;
