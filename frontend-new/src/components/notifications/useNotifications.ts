import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsAPI } from '@/lib/api';
import type { Notification } from '@/types';

function mapNotification(raw: {
  id: number;
  type: Notification['type'];
  title: string;
  body: string;
  read: boolean;
  flightId?: number;
  createdAt: string;
}): Notification {
  return {
    id: String(raw.id),
    type: raw.type,
    title: raw.title,
    body: raw.body,
    read: raw.read,
    flightId: raw.flightId,
    createdAt: raw.createdAt,
  };
}

export function useNotifications() {
  const queryClient = useQueryClient();
  const [shakeBell, setShakeBell] = useState(false);
  const prevUnreadRef = useRef(0);

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      try {
        const res = await notificationsAPI.getAll();
        return (res.data as Parameters<typeof mapNotification>[0][]).map(mapNotification);
      } catch {
        return [] as Notification[];
      }
    },
    refetchInterval: 15_000,
    retry: false,
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (unreadCount > prevUnreadRef.current && prevUnreadRef.current >= 0) {
      setShakeBell(true);
      const timer = setTimeout(() => setShakeBell(false), 500);
      prevUnreadRef.current = unreadCount;
      return () => clearTimeout(timer);
    }
    prevUnreadRef.current = unreadCount;
  }, [unreadCount]);

  const markAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      queryClient.setQueryData<Notification[]>(['notifications'], (old) =>
        (old ?? []).map((n) => ({ ...n, read: true })),
      );
    } catch {
      queryClient.setQueryData<Notification[]>(['notifications'], (old) =>
        (old ?? []).map((n) => ({ ...n, read: true })),
      );
    }
  };

  const markRead = async (id: string) => {
    try {
      await notificationsAPI.markRead(id);
    } catch {
      // optimistic update even if API fails
    }
    queryClient.setQueryData<Notification[]>(['notifications'], (old) =>
      (old ?? []).map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  return {
    notifications,
    unreadCount,
    markAllRead,
    markRead,
    shakeBell,
  };
}
