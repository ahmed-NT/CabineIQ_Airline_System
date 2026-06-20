export type FlightStatus =
  | "SCHEDULED"
  | "BOARDING"
  | "DEPARTED"
  | "ARRIVED"
  | "DELAYED"
  | "CANCELLED";
export type SeatStatus = "AVAILABLE" | "OCCUPIED" | "UNAVAILABLE";
export type SeatClass = "FIRST" | "BUSINESS" | "ECONOMY";

export interface Flight {
  id: number;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  status: FlightStatus;
  aircraftId: number;
  gate: string;
}

export interface SeatNode {
  seatId: string | null;
  status: SeatStatus | null;
  type: "AISLE" | null;
}

export interface SeatRow {
  rowNumber: number;
  seatClass: SeatClass;
  seats: SeatNode[];
}

export interface SeatMap {
  aircraftId: number;
  aircraftCode: string;
  rows: SeatRow[];
}

export interface Passenger {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  passportNumber: string;
  nationality: string;
  flightId: number;
  seatId: string;
  aircraftId: number;
}
