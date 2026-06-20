import { useQuery } from "@tanstack/react-query";
import { getSeatMap, isAuthenticated } from "../lib/api";

export const useSeatMap = (aircraftId: number | null, aircraftCode: string) =>
  useQuery({
    queryKey: ["seat-map", aircraftId, aircraftCode],
    queryFn: () => getSeatMap(aircraftId as number, aircraftCode),
    enabled: isAuthenticated() && aircraftId !== null,
    refetchInterval: 10_000,
  });
