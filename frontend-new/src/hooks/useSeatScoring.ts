import { useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { seatsAPI } from '@/lib/api';
import type { SeatMap, SeatScoreRequest, SeatScoreResponse } from '@/types';

export function useSeatScoring(
  aircraftId: number | null,
  aircraftCode: string,
  flightId: number | null,
  enabled: boolean,
) {
  const queryClient = useQueryClient();
  const clientRef = useRef<Client | null>(null);

  const queryKey = ['seat-map-scored', aircraftId, flightId];

  const query = useQuery<SeatMap>({
    queryKey,
    queryFn: () =>
      seatsAPI
        .getSeatMapWithScores(aircraftId!, aircraftCode, flightId!)
        .then((r) => r.data),
    enabled: enabled && aircraftId !== null && flightId !== null,
    refetchInterval: 15_000,
  });

  const scoreMutation = useMutation<{ data: SeatScoreResponse }, Error, SeatScoreRequest>({
    mutationFn: (req) => seatsAPI.submitScore(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  useEffect(() => {
    if (!enabled || !aircraftId || !flightId) return;

    const isDev = window.location.port === '3000';
    const wsUrl = isDev
      ? `${window.location.protocol}//${window.location.hostname}:8082/ws`
      : `${window.location.origin}/ws`;

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(
          `/topic/scores/${aircraftId}/${flightId}`,
          (message) => {
            const scoreUpdate: SeatScoreResponse = JSON.parse(message.body);
            queryClient.setQueryData<SeatMap>(queryKey, (old) => {
              if (!old) return old;
              return {
                ...old,
                rows: old.rows.map((row) => ({
                  ...row,
                  seats: row.seats.map((seat) => {
                    if (seat.seatId === scoreUpdate.seatId) {
                      return {
                        ...seat,
                        score: scoreUpdate.score,
                        lostItem: scoreUpdate.lostItem,
                        scoreColor: scoreUpdate.scoreColor,
                      };
                    }
                    return seat;
                  }),
                })),
              };
            });
          },
        );
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
    };
  }, [enabled, aircraftId, flightId, queryClient]);

  return {
    scoredSeatMap: query.data ?? null,
    isLoading: query.isLoading,
    submitScore: scoreMutation.mutate,
    isSubmitting: scoreMutation.isPending,
  };
}
