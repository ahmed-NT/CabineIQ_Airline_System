import { useQuery } from "@tanstack/react-query";
import { getFlightById, getFlights, isAuthenticated } from "../lib/api";

export const useFlights = () =>
  useQuery({
    queryKey: ["flights"],
    queryFn: getFlights,
    staleTime: 30_000,
    enabled: isAuthenticated(),
  });

export const useFlightById = (id: number | null) =>
  useQuery({
    queryKey: ["flight", id],
    queryFn: () => getFlightById(id as number),
    enabled: isAuthenticated() && id !== null,
    staleTime: 30_000,
  });
