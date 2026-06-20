import axios from "axios";
import type { Flight, Passenger, SeatMap, SeatStatus } from "../types/index";

const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ram_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const response = error.response;
    if (response?.status === 401) {
      localStorage.removeItem("ram_token");
      window.dispatchEvent(new Event("ram_auth_expired"));
      return Promise.reject(new Error("UNAUTHORIZED"));
    }
    return Promise.reject(error);
  },
);

export const isAuthenticated = () => !!localStorage.getItem("ram_token");

export const login = async (
  username: string,
  password: string,
): Promise<{ token: string; username: string; role: string }> => {
  const { data } = await api.post("/auth/login", { username, password });
  return data;
};

export const getFlights = async (): Promise<Flight[]> => {
  const { data } = await api.get("/flights");
  return data;
};

export const getFlightById = async (id: number): Promise<Flight> => {
  const { data } = await api.get(`/flights/${id}`);
  return data;
};

export const getSeatMap = async (
  aircraftId: number,
  aircraftCode: string,
): Promise<SeatMap> => {
  const { data } = await api.get(`/seats/aircraft/${aircraftId}`, {
    params: { aircraftCode },
  });
  return data;
};

export const updateSeatStatus = async (
  seatId: string,
  aircraftId: number,
  status: SeatStatus,
): Promise<void> => {
  await api.put(`/seats/${seatId}/status`, { status }, { params: { aircraftId } });
};

export const searchPassengers = async (name: string): Promise<Passenger[]> => {
  const { data } = await api.get("/passengers/search", { params: { name } });
  return data;
};

export const getPassengersByFlight = async (flightId: number): Promise<Passenger[]> => {
  const { data } = await api.get(`/passengers/flight/${flightId}`);
  return data;
};

export const assignSeat = async (
  passengerId: number,
  seatId: string,
  aircraftId: number,
): Promise<Passenger> => {
  const { data } = await api.put(`/passengers/${passengerId}/assign-seat`, {
    seatId,
    aircraftId,
  });
  return data;
};
