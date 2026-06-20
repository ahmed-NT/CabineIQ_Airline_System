export interface Flight {
  id: number;
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  status:
    | 'SCHEDULED'
    | 'BOARDING'
    | 'DEPARTED'
    | 'ARRIVED'
    | 'DELAYED'
    | 'CANCELLED';
  aircraftId: number;
  gate: string;
  createdAt: string;
}

export interface Aircraft {
  id: number;
  aircraftCode: string;
  model: string;
  registration: string;
  totalRows: number;
  seatsPerRow: number;
  totalSeats: number;
  status: 'ACTIVE' | 'MAINTENANCE' | 'RETIRED';
}

export interface Seat {
  seatId: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'UNAVAILABLE';
  type: string | null;
}

export interface SeatRow {
  rowNumber: number;
  seatClass: 'FIRST' | 'BUSINESS' | 'ECONOMY';
  seats: Seat[];
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
  createdAt: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'ADMIN' | 'USER';
}

export interface AuthResponse {
  token: string;
  username: string;
  role: string;
  message: string;
}

export interface Feedback {
  id: number;
  flightId: number;
  seatId: string;
  seatClass: string;
  route: string;
  tripPurpose: string;
  purchaseIntentScore: number;
  offerShown: string;
  offerClicked: boolean;
  submittedAt: string;
}

export interface AnalyticsData {
  totalSurveys: number;
  averageIntentScore: number;
  offerClickRate: number;
  segmentCounts: {
    HIGH_VALUE: number;
    POTENTIAL: number;
    PRICE_SENSITIVE: number;
  };
  intentByTripPurpose: { category: string; averageScore: number; count: number }[];
  intentByBookingChannel: { category: string; averageScore: number; count: number }[];
  offerClickRateByScoreBand: { band: string; clickRate: number }[];
  priceSensitivityByRoute: { route: string; sensitivityPct: number }[];
  lastUpdated: string;
}

export interface MlPrediction {
  route: string;
  seatClass: string;
  recommendedMultiplier: number;
  confidence: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  basedOnResponses: number;
}

export interface MlPredictionsResponse {
  lastTrained: string;
  modelPhase: 'RULE_BASED' | 'XGBOOST_PHASE2' | 'XGBOOST_PHASE3';
  predictions: MlPrediction[];
}

export interface Notification {
  id: string;
  type: 'FLIGHT_STATUS' | 'SEAT_UNAVAILABLE' | 'PASSENGER_ASSIGNED' | 'HIGH_OCCUPANCY';
  title: string;
  body: string;
  read: boolean;
  flightId?: number;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  loading?: boolean;
}

export interface AiQueryResponse {
  answer: string;
  actionType?: string;
  relatedFlightId?: number;
}

export type FlightStatus = Flight['status'];
export type SeatStatus = Seat['status'];
export type SeatClass = SeatRow['seatClass'];

