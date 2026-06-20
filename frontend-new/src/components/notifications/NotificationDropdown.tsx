import { useEffect, useRef, useState } from 'react';
import {
  TbPlane,
  TbArmchair,
  TbUser,
  TbAlertTriangle,
  TbX,
} from 'react-icons/tb';
import { useTheme } from '@/hooks/useTheme';
import type { Notification } from '@/types';
import { useClickOutside } from './useClickOutside';

interface NotificationDropdownProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
}

function formatRelativeTime(dateStr: string, now: Date): string {
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);

  if (diffSec < 30) return 'just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? '' : 's'} ago`;
  return date.toLocaleDateString();
}

function NotificationIcon({ type }: { type: Notification['type'] }) {
  const config = {
    FLIGHT_STATUS: { icon: TbPlane, color: '#C41E3A' },
    SEAT_UNAVAILABLE: { icon: TbArmchair, color: '#9E9E9E' },
    PASSENGER_ASSIGNED: { icon: TbUser, color: '#38bdf8' },
    HIGH_OCCUPANCY: { icon: TbAlertTriangle, color: '#fbbf24' },
  }[type];

  const Icon = config.icon;
  return (
    <span
      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
      style={{ background: `${config.color}20` }}
    >
      <Icon className="w-3.5 h-3.5" style={{ color: config.color }} />
    </span>
  );
}

export default function NotificationDropdown({
  notifications,
  onClose,
  onMarkAllRead,
  onMarkRead,
}: NotificationDropdownProps) {
  const { isDark } = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(new Date());

  useClickOutside(ref, onClose);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      ref={ref}
      className={`absolute right-0 top-full mt-1 w-[280px] rounded-xl border shadow-lg z-40 overflow-hidden ${
        isDark
          ? 'bg-[#0a1e38] border-[#1a3050]'
          : 'bg-white border-gray-200'
      }`}
    >
      <div
        className={`flex items-center justify-between px-3 py-2.5 border-b ${
          isDark ? 'border-[#1a3050]' : 'border-gray-100'
        }`}
      >
        <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-[#1A1A2E]'}`}>
          Notifications
        </span>
        <button
          onClick={onClose}
          className={isDark ? 'text-[#4a7aab] hover:text-white' : 'text-gray-400 hover:text-gray-600'}
        >
          <TbX className="w-4 h-4" />
        </button>
      </div>

      <div className="max-h-72 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className={`px-3 py-6 text-center text-xs ${isDark ? 'text-[#4a7aab]' : 'text-gray-400'}`}>
            No notifications
          </p>
        ) : (
          notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => onMarkRead(n.id)}
              className={`w-full text-left px-3 py-2.5 flex gap-2.5 border-b transition-colors ${
                isDark
                  ? 'border-[#1a3050] hover:bg-[#122a4a]'
                  : 'border-gray-50 hover:bg-gray-50'
              } ${!n.read ? (isDark ? 'bg-[#0d2040]/50' : 'bg-blue-50/50') : ''}`}
            >
              <NotificationIcon type={n.type} />
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium truncate ${isDark ? 'text-white' : 'text-[#1A1A2E]'}`}>
                  {n.title}
                </p>
                <p className={`text-[11px] mt-0.5 line-clamp-2 ${isDark ? 'text-[#8aa8c8]' : 'text-gray-500'}`}>
                  {n.body}
                </p>
                <p className={`text-[10px] mt-1 ${isDark ? 'text-[#4a7aab]' : 'text-gray-400'}`}>
                  {formatRelativeTime(n.createdAt, now)}
                </p>
              </div>
              {!n.read && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#C41E3A] flex-shrink-0 mt-1" />
              )}
            </button>
          ))
        )}
      </div>

      {notifications.some((n) => !n.read) && (
        <div className={`px-3 py-2 border-t ${isDark ? 'border-[#1a3050]' : 'border-gray-100'}`}>
          <button
            onClick={onMarkAllRead}
            className={`w-full text-xs font-medium py-1.5 rounded-lg transition-colors ${
              isDark
                ? 'text-[#4a7aab] hover:text-white hover:bg-[#122a4a]'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            Mark all as read
          </button>
        </div>
      )}
    </div>
  );
}
