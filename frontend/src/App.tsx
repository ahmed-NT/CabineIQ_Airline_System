import { useEffect, useMemo, useState } from "react";
import ErrorBanner from "./components/ErrorBanner";
import FlightDetails from "./components/FlightDetails/FlightDetails";
import FlightsList from "./components/FlightsList/FlightsList";
import Header from "./components/Header/Header";
import DashboardLayout from "./components/Layout/DashboardLayout";
import LoginOverlay from "./components/LoginOverlay";
import PassengerInfo from "./components/PassengerInfo/PassengerInfo";
import PassengerSearch from "./components/PassengerSearch/PassengerSearch";
import SeatMap from "./components/SeatMap/SeatMap";
import { usePassengersByFlight } from "./hooks/usePassengers";
import { useSeatMap } from "./hooks/useSeatMap";
import type { Flight, Passenger, SeatClass } from "./types/index";

type AuthenticatedDashboardProps = {
  onSessionEnd: () => void;
};

function AuthenticatedDashboard({ onSessionEnd }: AuthenticatedDashboardProps) {
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [highlightedSeatId, setHighlightedSeatId] = useState<string | null>(null);
  const [selectedPassenger, setSelectedPassenger] = useState<Passenger | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: flightPassengers } = usePassengersByFlight(selectedFlight?.id ?? null);
  const { data: seatMap } = useSeatMap(selectedFlight?.aircraftId ?? null, selectedFlight?.flightNumber ?? "");

  const seatClass = useMemo<SeatClass | null>(() => {
    if (!selectedPassenger || !seatMap) return null;
    for (const row of seatMap.rows) {
      if (row.seats.some((seat) => seat.seatId === selectedPassenger.seatId)) {
        return row.seatClass;
      }
    }
    return null;
  }, [selectedPassenger, seatMap]);

  const onPassengerSelect = (passenger: Passenger) => {
    setSelectedPassenger(passenger);
    setHighlightedSeatId(passenger.seatId);
    const element = document.getElementById(passenger.seatId);
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const onOccupiedSeatClick = (seatId: string) => {
    const match = (flightPassengers ?? []).find((item) => item.seatId === seatId) ?? null;
    setSelectedPassenger(match);
    setHighlightedSeatId(seatId);
  };

  const onLogout = () => {
    setSelectedPassenger(null);
    setSelectedFlight(null);
    setHighlightedSeatId(null);
    localStorage.removeItem("ram_token");
    localStorage.removeItem("ram_username");
    onSessionEnd();
  };

  return (
    <div className="app-shell">
      <Header onLogout={onLogout} />
      <DashboardLayout
        left={
          <FlightsList
            selectedFlight={selectedFlight}
            onSelectFlight={(flight) => {
              setSelectedFlight(flight);
              setSelectedPassenger(null);
              setHighlightedSeatId(null);
            }}
          />
        }
        center={
          <SeatMap
            selectedFlight={selectedFlight}
            highlightedSeatId={highlightedSeatId}
            onSeatClick={onOccupiedSeatClick}
          />
        }
        right={
          <>
            <PassengerSearch onPassengerSelect={onPassengerSelect} />
            <PassengerInfo
              passenger={selectedPassenger}
              seatClass={seatClass}
              onLocate={(seatId) => setHighlightedSeatId(seatId)}
            />
            <FlightDetails flight={selectedFlight} />
          </>
        }
      />
      <ErrorBanner error={error} onClose={() => setError(null)} />
    </div>
  );
}

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("ram_token"));

  useEffect(() => {
    const handler = () => setIsAuthenticated(false);
    window.addEventListener("ram_auth_expired", handler);
    return () => window.removeEventListener("ram_auth_expired", handler);
  }, []);

  if (!isAuthenticated) {
    return <LoginOverlay onSuccess={() => setIsAuthenticated(true)} />;
  }

  return <AuthenticatedDashboard onSessionEnd={() => setIsAuthenticated(false)} />;
};

export default App;
