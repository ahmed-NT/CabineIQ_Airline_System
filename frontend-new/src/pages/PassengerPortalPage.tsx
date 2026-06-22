import { useState } from 'react';
import { portalAPI } from '@/lib/api';
import type { Passenger, Flight } from '@/types';
import { TbPlane, TbId, TbArmchair, TbMapPin, TbClock, TbQrcode, TbMessageDots } from 'react-icons/tb';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  SCHEDULED: { bg: '#334155', text: '#94a3b8' },
  BOARDING: { bg: '#14532d', text: '#4ade80' },
  DEPARTED: { bg: '#1e3a5f', text: '#60a5fa' },
  ARRIVED: { bg: '#3b0764', text: '#c084fc' },
  DELAYED: { bg: '#78350f', text: '#fbbf24' },
  CANCELLED: { bg: '#450a0a', text: '#f87171' },
};

function getSeatClass(seatId: string) {
  const row = parseInt(seatId, 10);
  if (row <= 2) return { label: 'First Class', color: '#C9A84C' };
  if (row <= 6) return { label: 'Business', color: '#a78bfa' };
  return { label: 'Economy', color: '#38bdf8' };
}

export default function PassengerPortalPage() {
  const [passport, setPassport] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passenger, setPassenger] = useState<Passenger | null>(null);
  const [flight, setFlight] = useState<Flight | null>(null);

  const handleLookup = async () => {
    if (!passport.trim()) return;
    setLoading(true);
    setError('');
    setPassenger(null);
    setFlight(null);
    try {
      const res = await portalAPI.lookup(passport.trim());
      const p: Passenger = res.data;
      setPassenger(p);
      if (p.flightId) {
        try {
          const fr = await portalAPI.getFlightById(p.flightId);
          setFlight(fr.data);
        } catch {
          // flight lookup optional
        }
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('No booking found for this passport number.');
      } else {
        setError('Connection error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const seatClass = passenger?.seatId ? getSeatClass(passenger.seatId) : null;
  const statusStyle = flight ? (STATUS_COLORS[flight.status] ?? STATUS_COLORS.SCHEDULED) : null;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: '#07162c' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <TbPlane className="w-8 h-8 text-[#C41E3A]" />
        <div>
          <div className="text-xl font-bold text-white">CabineIQ</div>
          <div className="text-xs text-[#4a7aab]">Passenger Portal — Royal Air Maroc</div>
        </div>
      </div>

      {!passenger ? (
        /* Lookup form */
        <div
          className="w-full max-w-sm rounded-2xl border p-6 space-y-5"
          style={{ background: '#0a1e38', borderColor: '#1a3050' }}
        >
          <div>
            <h1 className="text-lg font-bold text-white">Find Your Booking</h1>
            <p className="text-xs text-[#4a7aab] mt-1">
              Enter your passport number to access your flight details and boarding pass.
            </p>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider mb-1 text-[#4a7aab]">
              Passport Number
            </label>
            <input
              type="text"
              value={passport}
              onChange={(e) => setPassport(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
              placeholder="e.g. AB1234567"
              className="w-full px-4 py-3 rounded-xl border text-sm text-white outline-none placeholder-[#2a5080] focus:border-[#C41E3A]"
              style={{ background: '#071628', borderColor: '#1a3050' }}
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            onClick={handleLookup}
            disabled={!passport.trim() || loading}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-40"
            style={{ background: '#C41E3A' }}
          >
            {loading ? 'Looking up…' : 'Find My Booking'}
          </button>
        </div>
      ) : (
        /* Boarding pass card */
        <div className="w-full max-w-sm space-y-4">
          {/* Passenger header */}
          <div
            className="rounded-2xl border p-5 space-y-4"
            style={{ background: '#0a1e38', borderColor: '#1a3050' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-[#4a7aab] uppercase tracking-wider">Passenger</p>
                <p className="text-lg font-bold text-white mt-0.5">
                  {passenger.firstName} {passenger.lastName}
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                style={{ background: '#C41E3A' }}
              >
                {passenger.firstName[0]}{passenger.lastName[0]}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: TbId, label: 'Passport', value: passenger.passportNumber },
                { icon: TbArmchair, label: 'Seat', value: passenger.seatId || 'Not assigned' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label}
                  className="rounded-xl p-3"
                  style={{ background: '#071628' }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className="w-3 h-3 text-[#4a7aab]" />
                    <span className="text-[10px] text-[#4a7aab] uppercase tracking-wider">{label}</span>
                  </div>
                  <p className="text-sm font-bold text-white">{value}</p>
                  {label === 'Seat' && seatClass && (
                    <p className="text-[10px] mt-0.5" style={{ color: seatClass.color }}>{seatClass.label}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Flight info */}
          {flight && (
            <div
              className="rounded-2xl border p-5 space-y-4"
              style={{ background: '#0a1e38', borderColor: '#1a3050' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TbPlane className="w-4 h-4 text-[#C41E3A]" />
                  <span className="font-bold text-white">{flight.flightNumber}</span>
                </div>
                {statusStyle && (
                  <span
                    className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                    style={{ background: statusStyle.bg, color: statusStyle.text }}
                  >
                    {flight.status}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{flight.origin}</p>
                  <p className="text-[10px] text-[#4a7aab]">Origin</p>
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 h-px" style={{ background: '#1a3050' }} />
                  <TbPlane className="w-4 h-4 text-[#C41E3A]" />
                  <div className="flex-1 h-px" style={{ background: '#1a3050' }} />
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{flight.destination}</p>
                  <p className="text-[10px] text-[#4a7aab]">Destination</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl p-3" style={{ background: '#071628' }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <TbClock className="w-3 h-3 text-[#4a7aab]" />
                    <span className="text-[10px] text-[#4a7aab] uppercase tracking-wider">Departure</span>
                  </div>
                  <p className="text-sm font-bold text-white">
                    {flight.departureTime
                      ? new Date(flight.departureTime).toLocaleString('fr-MA', { dateStyle: 'short', timeStyle: 'short' })
                      : '—'}
                  </p>
                </div>
                {flight.gate && (
                  <div className="rounded-xl p-3" style={{ background: '#071628' }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <TbMapPin className="w-3 h-3 text-[#4a7aab]" />
                      <span className="text-[10px] text-[#4a7aab] uppercase tracking-wider">Gate</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{flight.gate}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Boarding pass barcode area */}
          <div
            className="rounded-2xl border p-5 flex flex-col items-center gap-3"
            style={{ background: '#0a1e38', borderColor: '#1a3050' }}
          >
            <TbQrcode className="w-16 h-16 text-[#1a3050]" />
            <p className="text-xs text-[#4a7aab] text-center">
              Boarding pass — show at gate
            </p>
            <p className="font-mono text-sm font-bold text-white tracking-widest">
              {passenger.passportNumber}-{passenger.seatId || 'TBA'}
            </p>
          </div>

          {/* Feedback link */}
          {flight?.status === 'ARRIVED' && (
            <a
              href="/feedback"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-semibold text-white"
              style={{ background: '#006233' }}
            >
              <TbMessageDots className="w-4 h-4" />
              Share Your Flight Experience
            </a>
          )}

          <button
            onClick={() => { setPassenger(null); setFlight(null); setPassport(''); }}
            className="w-full py-2 text-xs text-[#4a7aab] hover:text-white transition-colors"
          >
            ← Look up another booking
          </button>
        </div>
      )}
    </div>
  );
}
