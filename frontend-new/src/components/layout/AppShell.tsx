import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import {
  TbWorld,
  TbPlane,
  TbArmchair,
  TbUsers,
  TbChartBar,
  TbMessageDots,
  TbRobot,
  TbBell,
} from 'react-icons/tb';
import ChatPanel from '@/components/chat/ChatPanel';
import NotificationDropdown from '@/components/notifications/NotificationDropdown';
import UnreadBadge from '@/components/notifications/UnreadBadge';
import { useNotifications } from '@/components/notifications/useNotifications';

const navItems = [
  { icon: TbWorld, path: '/', label: 'Dashboard' },
  { icon: TbPlane, path: '/flights', label: 'Flights' },
  { icon: TbArmchair, path: '/seat-map', label: 'Seat Map' },
  { icon: TbUsers, path: '/passengers', label: 'Passengers' },
];

const bottomItems = [
  { icon: TbChartBar, path: '/analytics', label: 'Analytics' },
  { icon: TbMessageDots, path: '/feedback', label: 'Feedback' },
];

export default function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggle } = useTheme();
  const { username, logout } = useAuth();
  const [chatOpen, setChatOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const { notifications, unreadCount, markAllRead, markRead, shakeBell } =
    useNotifications();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div
      className={`flex flex-col h-screen transition-colors ${isDark
          ? 'bg-[#07162c]'
          : 'bg-gray-50'
        }`}
    >
      {/* Top Bar */}
      <header
        className={`h-11 flex items-center justify-between px-4 flex-shrink-0 border-b transition-colors ${isDark
            ? 'bg-[#0a1e38] border-[#1a3050]'
            : 'bg-white border-gray-200 shadow-sm'
          }`}
      >
        {/* Left: Logo + Stats */}
        <div className="flex items-center gap-6">
          <img src="/ram-logo.png" alt="RAM" className="h-7 object-contain" />
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]" />
              <span className={isDark ? 'text-[#4a7aab]' : 'text-gray-500'}>
                2 Departed
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#a78bfa]" />
              <span className={isDark ? 'text-[#4a7aab]' : 'text-gray-500'}>
                1 Boarding
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#fbbf24]" />
              <span className={isDark ? 'text-[#4a7aab]' : 'text-gray-500'}>
                1 Delayed
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f87171]" />
              <span className={isDark ? 'text-[#4a7aab]' : 'text-gray-500'}>
                1 Cancelled
              </span>
            </span>
          </div>
        </div>

        {/* Right: LIVE + Bell + User + Toggle */}
        <div className="flex items-center gap-4">
          {/* LIVE badge */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#0d2a1a] border border-[#0f4a1a]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse-dot" />
            <span className="text-[#4ade80] text-xs font-medium tracking-wider">
              LIVE
            </span>
          </div>

          {/* Bell */}
          <div className="relative">
            <button
              onClick={() => setBellOpen((v) => !v)}
              className={`relative ${shakeBell ? 'animate-bell-shake' : ''}`}
            >
              <TbBell className={`w-4 h-4 ${isDark ? 'text-[#4a7aab]' : 'text-gray-500'}`} />
              <UnreadBadge count={unreadCount} />
            </button>
            {bellOpen && (
              <NotificationDropdown
                notifications={notifications}
                onClose={() => setBellOpen(false)}
                onMarkAllRead={markAllRead}
                onMarkRead={markRead}
              />
            )}
          </div>

          {/* Username */}
          <span
            className={`text-xs font-medium ${isDark ? 'text-[#4a7aab]' : 'text-gray-600'}`}
          >
            {username || 'ADMIN'}
          </span>

          {/* Dark/Light toggle */}
          <button
            onClick={toggle}
            className={`text-xs px-2 py-0.5 rounded border transition-colors ${isDark
                ? 'border-[#1a3050] text-[#4a7aab] hover:text-white'
                : 'border-gray-200 text-gray-500 hover:text-gray-900'
              }`}
          >
            {isDark ? '☀ Light' : '🌙 Dark'}
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            className="text-xs text-[#f87171] hover:text-red-400 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Body: Rail + Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Icon Rail */}
        <nav
          className={`w-11 flex flex-col flex-shrink-0 border-r transition-colors ${isDark
              ? 'bg-[#071628] border-[#1a3050]'
              : 'bg-gray-50 border-gray-200'
            }`}
        >
          {/* Top nav items */}
          <div className="flex flex-col pt-2">
            {navItems.map(({ icon: Icon, path, label }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                title={label}
                className={`relative w-11 h-11 flex items-center justify-center transition-colors group ${isActive(path)
                    ? isDark
                      ? 'bg-[#0d2040] text-[#38bdf8]'
                      : 'bg-blue-50 text-blue-500'
                    : isDark
                      ? 'text-[#2a5080] hover:bg-[#122a4a] hover:text-[#8aa8c8]'
                      : 'text-gray-400 hover:bg-gray-200/70 hover:text-gray-600'
                  }`}
              >
                {isActive(path) && (
                  <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r
                    ${isDark ? 'bg-[#38bdf8]' : 'bg-blue-500'}
                  `} />
                )}
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          {/* Separator */}
          <div
            className={`mx-3 my-2 border-t ${isDark ? 'border-[#1a3050]' : 'border-gray-200'
              }`}
          />

          {/* Bottom nav items */}
          <div className="flex flex-col">
            {bottomItems.map(({ icon: Icon, path, label }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                title={label}
                className={`relative w-11 h-11 flex items-center justify-center transition-colors group ${isActive(path)
                    ? isDark
                      ? 'bg-[#0d2040] text-[#38bdf8]'
                      : 'bg-blue-50 text-blue-500'
                    : isDark
                      ? 'text-[#2a5080] hover:bg-[#122a4a] hover:text-[#8aa8c8]'
                      : 'text-gray-400 hover:bg-gray-200/70 hover:text-gray-600'
                  }`}
              >
                {isActive(path) && (
                  <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r
                    ${isDark ? 'bg-[#38bdf8]' : 'bg-blue-500'}
                  `} />
                )}
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          {/* Separator */}
          <div
            className={`mx-3 my-2 border-t ${isDark ? 'border-[#1a3050]' : 'border-gray-200'
              }`}
          />

          {/* Robot/AI button — always at bottom */}
          <div className="mt-auto mb-2">
            <button
              onClick={() => setChatOpen(true)}
              title="AI Copilot"
              className={`w-11 h-11 flex items-center justify-center transition-colors ${
                isDark
                  ? 'text-[#C41E3A] hover:bg-[#122a4a]'
                  : 'text-[#C41E3A] hover:bg-gray-200/70'
              }`}
            >
              <TbRobot className="w-4 h-4" />
            </button>
          </div>
        </nav>

        {/* Page Content */}
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>

      {/* AI Chat Panel */}
      {chatOpen && <ChatPanel onClose={() => setChatOpen(false)} />}
    </div>
  );
}
