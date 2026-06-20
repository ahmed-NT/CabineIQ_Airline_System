import { useEffect, useMemo, useState } from "react";
import { usePassengerSearch } from "../../hooks/usePassengers";
import type { Passenger } from "../../types/index";

interface PassengerSearchProps {
  onPassengerSelect: (passenger: Passenger) => void;
}

const PassengerSearch = ({ onPassengerSelect }: PassengerSearchProps) => {
  const [input, setInput] = useState("");
  const [debouncedInput, setDebouncedInput] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedInput(input.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [input]);

  const { data, isFetching } = usePassengerSearch(debouncedInput);
  const passengers = useMemo(() => data ?? [], [data]);

  return (
    <section className="panel search-panel">
      <h3 className="section-label">PASSENGER SEARCH</h3>
      <div className="search-wrapper">
        <svg viewBox="0 0 24 24" className="search-icon" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-4-4" />
        </svg>
        <input
          className="search-input"
          placeholder="Search by name..."
          value={input}
          onChange={(event) => setInput(event.target.value)}
        />
        {isFetching ? <span className="spinner" /> : null}
      </div>
      <div className="search-results">
        {debouncedInput.length >= 2 && passengers.length === 0 && !isFetching ? (
          <div className="empty-state">NO RESULTS</div>
        ) : null}
        {passengers.map((passenger) => (
          <button
            key={passenger.id}
            className="search-result"
            type="button"
            onClick={() => onPassengerSelect(passenger)}
          >
            <strong>{passenger.fullName}</strong>
            <span>
              <em>{passenger.seatId}</em> - FLIGHT {passenger.flightId}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default PassengerSearch;
