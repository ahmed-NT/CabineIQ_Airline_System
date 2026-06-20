import { useState } from 'react';
import { flightsAPI } from '@/lib/api';
import type { FlightStatus } from '@/types';
import { TbChevronDown, TbCheck } from 'react-icons/tb';

interface Props {
  flightId: number;
  currentStatus: FlightStatus;
  onStatusChange: (status: FlightStatus) => void;
}

const STATUSES: FlightStatus[] = [
  'SCHEDULED', 'BOARDING', 'DEPARTED',
  'ARRIVED', 'DELAYED', 'CANCELLED'
];

const STATUS_COLORS: Record<FlightStatus, string> = {
  SCHEDULED: 'text-[#4ade80]',
  BOARDING:  'text-[#a78bfa]',
  DEPARTED:  'text-[#38bdf8]',
  ARRIVED:   'text-[#4ade80]',
  DELAYED:   'text-[#fbbf24]',
  CANCELLED: 'text-[#f87171]',
};

export default function StatusChanger({ 
  flightId, currentStatus, onStatusChange 
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = async (status: FlightStatus) => {
    setLoading(true);
    setOpen(false);
    try {
      await flightsAPI.updateStatus(flightId, status);
      onStatusChange(status);
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5
          border border-gray-300 dark:border-[#1a3050]
          rounded-lg text-xs font-medium
          bg-white dark:bg-[#0a1e38]
          text-gray-700 dark:text-gray-200
          hover:border-gray-400 dark:hover:border-[#2a4060]
          transition-colors disabled:opacity-50"
      >
        <TbChevronDown className="w-3.5 h-3.5" />
        Change Status
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50
          w-40 rounded-lg border overflow-hidden shadow-lg
          bg-white dark:bg-[#0a1e38]
          border-gray-200 dark:border-[#1a3050]">
          {STATUSES.map(status => (
            <button
              key={status}
              onClick={() => handleChange(status)}
              className="w-full flex items-center justify-between
                px-3 py-2 text-xs transition-colors
                hover:bg-gray-50 dark:hover:bg-[#0d2040]"
            >
              <span className={STATUS_COLORS[status]}>
                {status}
              </span>
              {currentStatus === status && (
                <TbCheck className="w-3 h-3 text-[#38bdf8]" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
