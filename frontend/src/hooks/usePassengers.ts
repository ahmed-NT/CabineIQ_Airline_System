import { useQuery } from "@tanstack/react-query";
import { getPassengersByFlight, isAuthenticated, searchPassengers } from "../lib/api";

export const usePassengerSearch = (name: string) =>
  useQuery({
    queryKey: ["passenger-search", name],
    queryFn: () => searchPassengers(name),
    enabled: isAuthenticated() && name.length >= 2,
    staleTime: 0,
  });

export const usePassengersByFlight = (flightId: number | null) =>
  useQuery({
    queryKey: ["passengers-flight", flightId],
    queryFn: () => getPassengersByFlight(flightId as number),
    enabled: isAuthenticated() && flightId !== null,
  });
