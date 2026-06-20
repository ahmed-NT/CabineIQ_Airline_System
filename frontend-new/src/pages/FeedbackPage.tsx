import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

// ── Types ──────────────────────────────────────────
interface SurveyData {
  // Auto-filled
  flightId: string;
  seatId: string;

  // Screen 1
  tripPurpose: string;
  companionCount: string;
  bookingWindow: string;
  bookingChannel: string;
  flightsPerYear: string;
  competitorUsed: string;

  // Screen 2
  pricePaidRange: string;
  pricePerception: string;
  experienceVsExpectation: string;
  comfortRating: number;
  serviceRating: number;
  wtpNoLayover: boolean;
  wtpLegroom: boolean;
  wtpBags: boolean;
  wtpWifi: boolean;

  // Screen 3
  returnIntent: string;
  nextDestination: string;
  nextTravelWindow: string;
  bookingDecisionFactor: string;
  loyaltySensitive: string;

  // Incentive
  incentiveEmail: string;
}

// ── Score Calculator ───────────────────────────────
function calculateScore(data: Partial<SurveyData>): number {
  let score = 0;

  if (data.returnIntent === 'BOOKED') score += 35;
  else if (data.returnIntent === 'PLANNED') score += 20;

  if (data.loyaltySensitive === 'NO') score += 25;
  else if (data.loyaltySensitive === 'DEPENDS') score += 12;

  if (data.flightsPerYear === '10_PLUS') score += 20;
  else if (data.flightsPerYear === '6_10') score += 15;
  else if (data.flightsPerYear === '3_5') score += 10;
  else if (data.flightsPerYear === '1_2') score += 5;

  if (data.experienceVsExpectation === 'BETTER') score += 20;
  else if (data.experienceVsExpectation === 'AS_EXPECTED') score += 10;

  return Math.min(score, 100);
}

// ── Star Rating Component ──────────────────────────
function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onChange(star)}
          className="text-2xl transition-transform
            hover:scale-110"
        >
          <span style={{
            color: star <= value ? '#C9A84C' : '#334155'
          }}>★</span>
        </button>
      ))}
    </div>
  );
}

// ── Option Button ──────────────────────────────────
function OptionBtn({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full py-2.5 px-4 rounded-xl border
        text-sm text-left transition-all"
      style={{
        background: selected ? '#C41E3A15' : '#0d1e38',
        borderColor: selected ? '#C41E3A' : '#1a3050',
        color: selected ? '#ffffff' : '#8aa8c8',
        fontWeight: selected ? 600 : 400,
      }}
    >
      {children}
    </button>
  );
}

// ── Toggle Checkbox ────────────────────────────────
function ToggleOption({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full py-2
        px-3 rounded-lg border transition-all text-sm"
      style={{
        background: selected ? '#C41E3A15' : 'transparent',
        borderColor: selected ? '#C41E3A' : '#1a3050',
        color: selected ? '#ffffff' : '#8aa8c8',
      }}
    >
      <span
        className="w-4 h-4 rounded border-2 flex
          items-center justify-center flex-shrink-0"
        style={{
          borderColor: selected ? '#C41E3A' : '#1a3050',
          background: selected ? '#C41E3A' : 'transparent',
        }}
      >
        {selected && (
          <span className="text-white text-[10px]">✓</span>
        )}
      </span>
      {children}
    </button>
  );
}

// ── Progress Bar ───────────────────────────────────
function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-1.5 mb-6">
      {[1, 2, 3, 4].map((s) => (
        <div
          key={s}
          className="h-1 flex-1 rounded-full
            transition-all duration-300"
          style={{
            background: s <= step
              ? '#C41E3A'
              : '#1a3050',
          }}
        />
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────
export default function FeedbackPage() {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [score, setScore] = useState(0);

  const [data, setData] = useState<Partial<SurveyData>>({
    flightId: searchParams.get('flightId') || '',
    seatId: searchParams.get('seat') || '',
    comfortRating: 0,
    serviceRating: 0,
    wtpNoLayover: false,
    wtpLegroom: false,
    wtpBags: false,
    wtpWifi: false,
    incentiveEmail: '',
  });

  const set = (key: keyof SurveyData, value: SurveyData[keyof SurveyData]) =>
    setData(prev => ({ ...prev, [key]: value }));

  const toggle = (key: 'wtpNoLayover' | 'wtpLegroom' | 'wtpBags' | 'wtpWifi') =>
    setData(prev => ({ ...prev, [key]: !prev[key] }));

  const canNext = (): boolean => {
    if (step === 1)
      return !!(data.tripPurpose &&
        data.companionCount &&
        data.bookingWindow &&
        data.flightsPerYear);
    if (step === 2)
      return !!(data.pricePaidRange &&
        data.pricePerception &&
        data.experienceVsExpectation &&
        data.comfortRating &&
        data.comfortRating > 0);
    if (step === 3)
      return !!(data.returnIntent &&
        data.loyaltySensitive);
    return true;
  };

  const handleSubmit = () => {
    const finalScore = calculateScore(data);
    setScore(finalScore);
    setStep(4);
    // In production: POST to /api/feedback
    console.log('Survey submitted:', {
      ...data, purchaseIntentScore: finalScore
    });
  };

  const getOffer = () => {
    if (score >= 70) return {
      title: 'Special offer for you!',
      desc: `Book your return flight now and save 15%`,
      btn: 'Book Return Flight',
      color: '#C41E3A',
    };
    if (score >= 40) return {
      title: 'Stay connected with RAM',
      desc: 'Subscribe to price alerts for your next destination — free',
      btn: 'Subscribe to Alerts',
      color: '#38bdf8',
    };
    return null;
  };

  const offer = step === 4 ? getOffer() : null;

  return (
    <div
      className="min-h-screen flex items-center
        justify-center p-4"
      style={{ background: '#07162c' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl
          border overflow-hidden"
        style={{
          background: '#0a1e38',
          borderColor: '#1a3050',
        }}
      >
        {/* Header */}
        <div
          className="px-5 pt-5 pb-3 border-b"
          style={{ borderColor: '#1a3050' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <img
              src="/ram-logo.jpg"
              alt="RAM"
              className="h-8 object-contain"
            />
            <div>
              <p className="text-white text-sm font-semibold">
                Royal Air Maroc
              </p>
              <p className="text-[10px]"
                style={{ color: '#4a7aab' }}>
                Passenger Experience Survey
              </p>
            </div>
          </div>

          {/* Flight info if available */}
          {data.flightId && (
            <div
              className="flex items-center gap-2 px-3
                py-1.5 rounded-lg mb-3 text-xs"
              style={{ background: '#071628' }}
            >
              <span style={{ color: '#4a7aab' }}>
                ✈ Flight
              </span>
              <span className="font-semibold text-white">
                #{data.flightId}
              </span>
              {data.seatId && (
                <>
                  <span style={{ color: '#1a3050' }}>·</span>
                  <span style={{ color: '#4a7aab' }}>
                    Seat
                  </span>
                  <span className="font-semibold text-white">
                    {data.seatId}
                  </span>
                </>
              )}
            </div>
          )}

          {step < 4 && <ProgressBar step={step} />}
        </div>

        {/* Body */}
        <div className="px-5 py-4">

          {/* ── SCREEN 1: Your Journey ── */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-white font-semibold text-base">
                Your Journey
              </h2>

              <div>
                <p className="text-xs mb-2"
                  style={{ color: '#4a7aab' }}>
                  What brought you on board?
                </p>
                <div className="space-y-1.5">
                  {[
                    { value: 'BUSINESS', label: '💼 Business' },
                    { value: 'LEISURE', label: '🌴 Leisure / Vacation' },
                    { value: 'FAMILY', label: '👨‍👩‍👧 Family / Event' },
                  ].map(opt => (
                    <OptionBtn
                      key={opt.value}
                      selected={data.tripPurpose === opt.value}
                      onClick={() => set('tripPurpose', opt.value)}
                    >
                      {opt.label}
                    </OptionBtn>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs mb-2"
                  style={{ color: '#4a7aab' }}>
                  You are travelling...
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { value: 'ALONE', label: '🧍 Alone' },
                    { value: 'PAIR', label: '👫 With 1' },
                    { value: 'GROUP', label: '👨‍👩‍👧 Group' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() =>
                        set('companionCount', opt.value)}
                      className="py-2 rounded-xl border
                        text-xs transition-all"
                      style={{
                        background:
                          data.companionCount === opt.value
                            ? '#C41E3A15' : '#071628',
                        borderColor:
                          data.companionCount === opt.value
                            ? '#C41E3A' : '#1a3050',
                        color:
                          data.companionCount === opt.value
                            ? '#fff' : '#8aa8c8',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs mb-2"
                  style={{ color: '#4a7aab' }}>
                  When did you book?
                </p>
                <div className="space-y-1.5">
                  {[
                    { value: 'LAST_MINUTE', label: '⚡ Last minute' },
                    { value: 'FEW_WEEKS', label: '📅 A few weeks ago' },
                    { value: 'MONTHS_AHEAD', label: '🗓️ Months ahead' },
                  ].map(opt => (
                    <OptionBtn
                      key={opt.value}
                      selected={data.bookingWindow === opt.value}
                      onClick={() =>
                        set('bookingWindow', opt.value)}
                    >
                      {opt.label}
                    </OptionBtn>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs mb-2"
                  style={{ color: '#4a7aab' }}>
                  How many times do you fly per year?
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { value: '1_2', label: '1–2 times' },
                    { value: '3_5', label: '3–5 times' },
                    { value: '6_10', label: '6–10 times' },
                    { value: '10_PLUS', label: '10+ times' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() =>
                        set('flightsPerYear', opt.value)}
                      className="py-2 rounded-xl border
                        text-xs transition-all"
                      style={{
                        background:
                          data.flightsPerYear === opt.value
                            ? '#C41E3A15' : '#071628',
                        borderColor:
                          data.flightsPerYear === opt.value
                            ? '#C41E3A' : '#1a3050',
                        color:
                          data.flightsPerYear === opt.value
                            ? '#fff' : '#8aa8c8',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── SCREEN 2: Your Experience ── */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-white font-semibold text-base">
                Your Experience
              </h2>

              <div>
                <p className="text-xs mb-2"
                  style={{ color: '#4a7aab' }}>
                  How much did you pay approximately?
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { value: 'UNDER_100', label: 'Under 100€' },
                    { value: '100_200', label: '100–200€' },
                    { value: '200_400', label: '200–400€' },
                    { value: 'ABOVE_400', label: '400€+' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() =>
                        set('pricePaidRange', opt.value)}
                      className="py-2 rounded-xl border
                        text-xs transition-all"
                      style={{
                        background:
                          data.pricePaidRange === opt.value
                            ? '#C41E3A15' : '#071628',
                        borderColor:
                          data.pricePaidRange === opt.value
                            ? '#C41E3A' : '#1a3050',
                        color:
                          data.pricePaidRange === opt.value
                            ? '#fff' : '#8aa8c8',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs mb-2"
                  style={{ color: '#4a7aab' }}>
                  Was it worth it?
                </p>
                <div className="space-y-1.5">
                  {[
                    { value: 'GREAT_DEAL',
                      label: '😍 Great deal' },
                    { value: 'FAIR',
                      label: '😊 Fair price' },
                    { value: 'TOO_EXPENSIVE',
                      label: '😬 Too expensive' },
                  ].map(opt => (
                    <OptionBtn
                      key={opt.value}
                      selected={
                        data.pricePerception === opt.value}
                      onClick={() =>
                        set('pricePerception', opt.value)}
                    >
                      {opt.label}
                    </OptionBtn>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs mb-2"
                  style={{ color: '#4a7aab' }}>
                  The flight was...
                </p>
                <div className="space-y-1.5">
                  {[
                    { value: 'BETTER',
                      label: '🌟 Better than expected' },
                    { value: 'AS_EXPECTED',
                      label: '👍 As expected' },
                    { value: 'WORSE',
                      label: '👎 Disappointing' },
                  ].map(opt => (
                    <OptionBtn
                      key={opt.value}
                      selected={
                        data.experienceVsExpectation ===
                        opt.value}
                      onClick={() =>
                        set('experienceVsExpectation',
                          opt.value)}
                    >
                      {opt.label}
                    </OptionBtn>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs mb-2"
                  style={{ color: '#4a7aab' }}>
                  Comfort rating
                </p>
                <StarRating
                  value={data.comfortRating || 0}
                  onChange={v => set('comfortRating', v)}
                />
              </div>

              <div>
                <p className="text-xs mb-2"
                  style={{ color: '#4a7aab' }}>
                  Service rating
                </p>
                <StarRating
                  value={data.serviceRating || 0}
                  onChange={v => set('serviceRating', v)}
                />
              </div>

              <div>
                <p className="text-xs mb-2"
                  style={{ color: '#4a7aab' }}>
                  I would pay more for:
                </p>
                <div className="space-y-1.5">
                  {[
                    { key: 'wtpNoLayover' as const,
                      label: '✈️ No layovers' },
                    { key: 'wtpLegroom' as const,
                      label: '🦵 Extra legroom' },
                    { key: 'wtpBags' as const,
                      label: '🧳 Bags included' },
                    { key: 'wtpWifi' as const,
                      label: '📶 WiFi on board' },
                  ].map(opt => (
                    <ToggleOption
                      key={opt.key}
                      selected={!!data[opt.key]}
                      onClick={() => toggle(opt.key)}
                    >
                      {opt.label}
                    </ToggleOption>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── SCREEN 3: Your Next Trip ── */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-white font-semibold text-base">
                Your Next Trip
              </h2>

              <div>
                <p className="text-xs mb-2"
                  style={{ color: '#4a7aab' }}>
                  Are you planning a return flight?
                </p>
                <div className="space-y-1.5">
                  {[
                    { value: 'BOOKED',
                      label: '✅ Already booked with RAM' },
                    { value: 'PLANNED',
                      label: '🤔 Not booked yet' },
                    { value: 'NO',
                      label: '❌ No return needed' },
                  ].map(opt => (
                    <OptionBtn
                      key={opt.value}
                      selected={data.returnIntent === opt.value}
                      onClick={() =>
                        set('returnIntent', opt.value)}
                    >
                      {opt.label}
                    </OptionBtn>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs mb-2"
                  style={{ color: '#4a7aab' }}>
                  Where are you heading next?
                </p>
                <input
                  type="text"
                  value={data.nextDestination || ''}
                  onChange={e =>
                    set('nextDestination', e.target.value)}
                  placeholder="City or country..."
                  className="w-full px-3 py-2.5 rounded-xl
                    border text-sm focus:outline-none
                    placeholder:text-[#2a5080]"
                  style={{
                    background: '#071628',
                    borderColor: '#1a3050',
                    color: 'white',
                  }}
                />
              </div>

              <div>
                <p className="text-xs mb-2"
                  style={{ color: '#4a7aab' }}>
                  When roughly?
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { value: 'THIS_MONTH', label: 'This month' },
                    { value: '1_3_MONTHS', label: '1–3 months' },
                    { value: '3_6_MONTHS', label: '3–6 months' },
                    { value: 'NOT_SURE', label: 'Not sure' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() =>
                        set('nextTravelWindow', opt.value)}
                      className="py-2 rounded-xl border
                        text-xs transition-all"
                      style={{
                        background:
                          data.nextTravelWindow === opt.value
                            ? '#C41E3A15' : '#071628',
                        borderColor:
                          data.nextTravelWindow === opt.value
                            ? '#C41E3A' : '#1a3050',
                        color:
                          data.nextTravelWindow === opt.value
                            ? '#fff' : '#8aa8c8',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs mb-2"
                  style={{ color: '#4a7aab' }}>
                  What decides your next booking?
                </p>
                <div className="space-y-1.5">
                  {[
                    { value: 'LOWEST_PRICE',
                      label: '💰 Lowest price' },
                    { value: 'BEST_SCHEDULE',
                      label: '⏰ Best schedule' },
                    { value: 'LOYALTY',
                      label: '⭐ RAM loyalty points' },
                    { value: 'DIRECT_FLIGHT',
                      label: '✈️ Direct flight' },
                  ].map(opt => (
                    <OptionBtn
                      key={opt.value}
                      selected={
                        data.bookingDecisionFactor ===
                        opt.value}
                      onClick={() =>
                        set('bookingDecisionFactor',
                          opt.value)}
                    >
                      {opt.label}
                    </OptionBtn>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs mb-2"
                  style={{ color: '#4a7aab' }}>
                  If a competitor was 50€ cheaper,
                  would you switch?
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { value: 'YES', label: '✈ Yes' },
                    { value: 'DEPENDS', label: '🤔 Depends' },
                    { value: 'NO', label: '❤️ No, RAM' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() =>
                        set('loyaltySensitive', opt.value)}
                      className="py-2 rounded-xl border
                        text-xs transition-all"
                      style={{
                        background:
                          data.loyaltySensitive === opt.value
                            ? '#C41E3A15' : '#071628',
                        borderColor:
                          data.loyaltySensitive === opt.value
                            ? '#C41E3A' : '#1a3050',
                        color:
                          data.loyaltySensitive === opt.value
                            ? '#fff' : '#8aa8c8',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── SCREEN 4: Thank You + Offer ── */}
          {step === 4 && (
            <div className="space-y-4 py-2">
              {/* Thank you */}
              <div className="text-center">
                <div className="text-4xl mb-3">🙏</div>
                <h2 className="text-white font-bold text-lg mb-1">
                  Thank you!
                </h2>
                <p className="text-sm"
                  style={{ color: '#4a7aab' }}>
                  Your feedback helps us improve
                  Royal Air Maroc for everyone.
                </p>
              </div>

              {/* Score display */}
              <div
                className="rounded-xl p-4 text-center border"
                style={{
                  background: '#071628',
                  borderColor: '#1a3050',
                }}
              >
                <p className="text-[10px] uppercase
                  tracking-widest mb-2"
                  style={{ color: '#2a5080' }}>
                  Your Experience Score
                </p>
                <div
                  className="text-4xl font-bold mb-1"
                  style={{
                    color: score >= 70
                      ? '#4ade80'
                      : score >= 40
                        ? '#fbbf24'
                        : '#f87171',
                  }}
                >
                  {score}
                </div>
                <div className="text-xs"
                  style={{ color: '#2a5080' }}>
                  / 100
                </div>
                <div
                  className="mt-2 h-1.5 rounded-full
                    overflow-hidden"
                  style={{ background: '#0a1e38' }}
                >
                  <div
                    className="h-full rounded-full
                      transition-all duration-1000"
                    style={{
                      width: `${score}%`,
                      background: score >= 70
                        ? '#4ade80'
                        : score >= 40
                          ? '#fbbf24'
                          : '#f87171',
                    }}
                  />
                </div>
              </div>

              {/* Dynamic offer */}
              {offer && (
                <div
                  className="rounded-xl p-4 border"
                  style={{
                    background: `${offer.color}10`,
                    borderColor: `${offer.color}40`,
                  }}
                >
                  <p className="font-semibold text-sm
                    text-white mb-1">
                    {offer.title}
                  </p>
                  <p className="text-xs mb-3"
                    style={{ color: '#8aa8c8' }}>
                    {offer.desc}
                  </p>
                  <button
                    className="w-full py-2.5 rounded-xl
                      text-sm font-semibold text-white
                      transition-colors"
                    style={{ background: offer.color }}
                  >
                    {offer.btn} →
                  </button>
                </div>
              )}

              {/* Incentive email */}
              <div>
                <p className="text-xs mb-2"
                  style={{ color: '#4a7aab' }}>
                  Enter your email for a
                  10% discount on your next booking:
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={data.incentiveEmail || ''}
                    onChange={e =>
                      set('incentiveEmail', e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 px-3 py-2 rounded-xl
                      border text-sm focus:outline-none
                      placeholder:text-[#2a5080]"
                    style={{
                      background: '#071628',
                      borderColor: '#1a3050',
                      color: 'white',
                    }}
                  />
                  <button
                    className="px-3 py-2 rounded-xl
                      text-xs font-medium text-white"
                    style={{ background: '#006233' }}
                  >
                    ✓
                  </button>
                </div>
              </div>

              {/* Footer */}
              <p className="text-center text-[10px]"
                style={{ color: '#1a3050' }}>
                Royal Air Maroc © 2026
              </p>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        {step < 4 && (
          <div
            className="px-5 py-4 border-t flex gap-3"
            style={{ borderColor: '#1a3050' }}
          >
            {step > 1 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="flex-1 py-2.5 rounded-xl border
                  text-sm font-medium transition-colors"
                style={{
                  borderColor: '#1a3050',
                  color: '#4a7aab',
                }}
              >
                ← Back
              </button>
            )}
            <button
              onClick={() => {
                if (step === 3) handleSubmit();
                else setStep(s => s + 1);
              }}
              disabled={!canNext()}
              className="flex-1 py-2.5 rounded-xl text-sm
                font-semibold text-white transition-all"
              style={{
                background: canNext()
                  ? '#C41E3A' : '#1a3050',
                color: canNext() ? 'white' : '#2a5080',
              }}
            >
              {step === 3 ? 'Submit ✓' : 'Next →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
