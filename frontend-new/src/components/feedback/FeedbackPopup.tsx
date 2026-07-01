import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/hooks/useTheme';

interface FeedbackOption {
  value: string;
  label: string;
}

interface FeedbackQuestion {
  id: string;
  text: string;
  type: 'radio' | 'grid-2' | 'grid-3' | 'stars' | 'text' | 'checkbox';
  options: FeedbackOption[];
}

interface FeedbackStep {
  title: string;
  questions: FeedbackQuestion[];
}

const DEFAULT_STEPS: FeedbackStep[] = [
  {
    title: 'Your Journey',
    questions: [
      {
        id: 'tripPurpose', text: 'What brought you on board?', type: 'radio',
        options: [
          { value: 'BUSINESS', label: 'Business' },
          { value: 'LEISURE', label: 'Leisure / Vacation' },
          { value: 'FAMILY', label: 'Family / Event' },
        ],
      },
      {
        id: 'companionCount', text: 'You are travelling...', type: 'grid-3',
        options: [
          { value: 'ALONE', label: 'Alone' },
          { value: 'PAIR', label: 'With 1' },
          { value: 'GROUP', label: 'Group' },
        ],
      },
      {
        id: 'bookingWindow', text: 'When did you book?', type: 'radio',
        options: [
          { value: 'LAST_MINUTE', label: 'Last minute' },
          { value: 'FEW_WEEKS', label: 'A few weeks ago' },
          { value: 'MONTHS_AHEAD', label: 'Months ahead' },
        ],
      },
      {
        id: 'flightsPerYear', text: 'How many times do you fly per year?', type: 'grid-2',
        options: [
          { value: '1_2', label: '1–2 times' },
          { value: '3_5', label: '3–5 times' },
          { value: '6_10', label: '6–10 times' },
          { value: '10_PLUS', label: '10+ times' },
        ],
      },
    ],
  },
  {
    title: 'Your Experience',
    questions: [
      {
        id: 'pricePaidRange', text: 'How much did you pay approximately?', type: 'grid-2',
        options: [
          { value: 'UNDER_100', label: 'Under 100€' },
          { value: '100_200', label: '100–200€' },
          { value: '200_400', label: '200–400€' },
          { value: 'ABOVE_400', label: '400€+' },
        ],
      },
      {
        id: 'pricePerception', text: 'Was it worth it?', type: 'radio',
        options: [
          { value: 'GREAT_DEAL', label: 'Great deal' },
          { value: 'FAIR', label: 'Fair price' },
          { value: 'TOO_EXPENSIVE', label: 'Too expensive' },
        ],
      },
      {
        id: 'experienceVsExpectation', text: 'The flight was...', type: 'radio',
        options: [
          { value: 'BETTER', label: 'Better than expected' },
          { value: 'AS_EXPECTED', label: 'As expected' },
          { value: 'WORSE', label: 'Disappointing' },
        ],
      },
      { id: 'comfortRating', text: 'Comfort rating', type: 'stars', options: [] },
      { id: 'serviceRating', text: 'Service rating', type: 'stars', options: [] },
      {
        id: 'wtp', text: 'I would pay more for:', type: 'checkbox',
        options: [
          { value: 'wtpNoLayover', label: 'No layovers' },
          { value: 'wtpLegroom', label: 'Extra legroom' },
          { value: 'wtpBags', label: 'Bags included' },
          { value: 'wtpWifi', label: 'WiFi on board' },
        ],
      },
    ],
  },
  {
    title: 'Your Next Trip',
    questions: [
      {
        id: 'returnIntent', text: 'Are you planning a return flight?', type: 'radio',
        options: [
          { value: 'BOOKED', label: 'Already booked with RAM' },
          { value: 'PLANNED', label: 'Not booked yet' },
          { value: 'NO', label: 'No return needed' },
        ],
      },
      { id: 'nextDestination', text: 'Where are you heading next?', type: 'text', options: [] },
      {
        id: 'nextTravelWindow', text: 'When roughly?', type: 'grid-2',
        options: [
          { value: 'THIS_MONTH', label: 'This month' },
          { value: '1_3_MONTHS', label: '1–3 months' },
          { value: '3_6_MONTHS', label: '3–6 months' },
          { value: 'NOT_SURE', label: 'Not sure' },
        ],
      },
      {
        id: 'bookingDecisionFactor', text: 'What decides your next booking?', type: 'radio',
        options: [
          { value: 'LOWEST_PRICE', label: 'Lowest price' },
          { value: 'BEST_SCHEDULE', label: 'Best schedule' },
          { value: 'LOYALTY', label: 'RAM loyalty points' },
          { value: 'DIRECT_FLIGHT', label: 'Direct flight' },
        ],
      },
      {
        id: 'loyaltySensitive', text: 'If a competitor was 50€ cheaper, would you switch?', type: 'grid-3',
        options: [
          { value: 'YES', label: 'Yes' },
          { value: 'DEPENDS', label: 'Depends' },
          { value: 'NO', label: 'No, RAM' },
        ],
      },
    ],
  },
];

const STORAGE_KEY = 'ram_feedback_config';

function loadSteps(): FeedbackStep[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return DEFAULT_STEPS;
}

function saveSteps(steps: FeedbackStep[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(steps));
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

let optionCounter = 1000;

export default function FeedbackPopup({ onClose }: { onClose: () => void }) {
  const { isDark } = useTheme();
  const [steps, setSteps] = useState<FeedbackStep[]>(loadSteps);
  const [editSteps, setEditSteps] = useState<FeedbackStep[]>(deepClone(steps));
  const [step, setStep] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [buttonState, setButtonState] = useState<'plus' | 'transitioning' | 'actions' | 'returning'>('plus');
  const [saving, setSaving] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const currentSteps = isEditing ? editSteps : steps;
  const currentStep = currentSteps[step - 1];

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handlePlusClick = () => {
    setButtonState('transitioning');
    setEditSteps(deepClone(steps));
    setTimeout(() => {
      setIsEditing(true);
      setButtonState('actions');
    }, 300);
  };

  const handleCancel = () => {
    setButtonState('returning');
    setIsEditing(false);
    setEditSteps(deepClone(steps));
    setTimeout(() => setButtonState('plus'), 300);
  };

  const handleSubmit = () => {
    setSaving(true);
    setTimeout(() => {
      setSteps(deepClone(editSteps));
      saveSteps(editSteps);
      setSaving(false);
      setButtonState('returning');
      setIsEditing(false);
      setTimeout(() => setButtonState('plus'), 300);
    }, 400);
  };

  const updateQuestionText = (qIdx: number, text: string) => {
    setEditSteps(prev => {
      const next = deepClone(prev);
      next[step - 1].questions[qIdx].text = text;
      return next;
    });
  };

  const updateOptionLabel = (qIdx: number, oIdx: number, label: string) => {
    setEditSteps(prev => {
      const next = deepClone(prev);
      next[step - 1].questions[qIdx].options[oIdx].label = label;
      return next;
    });
  };

  const addOption = (qIdx: number) => {
    setEditSteps(prev => {
      const next = deepClone(prev);
      optionCounter++;
      next[step - 1].questions[qIdx].options.push({
        value: `CUSTOM_${optionCounter}`,
        label: 'New option',
      });
      return next;
    });
  };

  const removeOption = (qIdx: number, oIdx: number) => {
    setEditSteps(prev => {
      const next = deepClone(prev);
      next[step - 1].questions[qIdx].options.splice(oIdx, 1);
      return next;
    });
  };

  const border = isDark ? '#1a3050' : '#e5e7eb';
  const textSecondary = isDark ? '#4a7aab' : '#6b7280';
  const inputBorder = isDark ? '#1a3050' : '#d1d5db';

  const renderOption = (q: FeedbackQuestion, qIdx: number, opt: FeedbackOption, oIdx: number) => {
    const isGrid = q.type === 'grid-2' || q.type === 'grid-3';

    if (isEditing) {
      return (
        <div key={opt.value} className="flex items-center gap-1.5">
          <input
            type="text"
            value={opt.label}
            onChange={e => updateOptionLabel(qIdx, oIdx, e.target.value)}
            className="flex-1 text-sm rounded-xl border px-3 py-2 focus:outline-none transition-colors"
            style={{
              background: isDark ? '#071628' : '#f9fafb',
              borderColor: inputBorder,
              color: isDark ? '#e2e8f0' : '#111827',
            }}
            onFocus={e => { e.target.style.borderColor = '#C41E3A'; }}
            onBlur={e => { e.target.style.borderColor = inputBorder; }}
          />
          {q.options.length > 1 && (
            <button
              onClick={() => removeOption(qIdx, oIdx)}
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs transition-colors"
              style={{
                background: isDark ? '#2a101080' : '#fee2e2',
                color: '#ef4444',
              }}
            >
              ✕
            </button>
          )}
        </div>
      );
    }

    if (isGrid) {
      return (
        <button
          key={opt.value}
          className="py-2 rounded-xl border text-xs transition-all"
          style={{
            background: isDark ? '#0a1a30' : '#f9fafb',
            borderColor: isDark ? '#1a3050' : '#1a3050',
            color: isDark ? '#94a3b8' : '#4b5563',
          }}
        >
          {opt.label}
        </button>
      );
    }

    if (q.type === 'checkbox') {
      return (
        <button
          key={opt.value}
          className="flex items-center gap-3 w-full py-2 px-3 rounded-lg border transition-all text-sm"
          style={{
            background: 'transparent',
            borderColor: isDark ? '#1a3050' : '#e5e7eb',
            color: isDark ? '#94a3b8' : '#4b5563',
          }}
        >
          <span
            className="w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0"
            style={{ borderColor: isDark ? '#334155' : '#d1d5db' }}
          />
          {opt.label}
        </button>
      );
    }

    return (
      <button
        key={opt.value}
        className="w-full py-2.5 px-4 rounded-xl border text-sm text-left transition-all"
        style={{
          background: isDark ? '#0a1a30' : '#f9fafb',
          borderColor: isDark ? '#1a3050' : '#e5e7eb',
          color: isDark ? '#94a3b8' : '#4b5563',
        }}
      >
        {opt.label}
      </button>
    );
  };

  const renderQuestion = (q: FeedbackQuestion, qIdx: number) => {
    const isGrid = q.type === 'grid-2' || q.type === 'grid-3';
    const gridCols = q.type === 'grid-3' ? 'grid-cols-3' : 'grid-cols-2';

    return (
      <div key={q.id}>
        {/* Question label */}
        {isEditing ? (
          <input
            type="text"
            value={q.text}
            onChange={e => updateQuestionText(qIdx, e.target.value)}
            className="w-full text-xs mb-2 rounded-lg px-2 py-1 border focus:outline-none transition-colors"
            style={{
              background: isDark ? '#071628' : '#ffffff',
              borderColor: inputBorder,
              color: textSecondary,
            }}
            onFocus={e => { e.target.style.borderColor = '#C41E3A'; }}
            onBlur={e => { e.target.style.borderColor = inputBorder; }}
          />
        ) : (
          <p className="text-xs mb-2" style={{ color: textSecondary }}>{q.text}</p>
        )}

        {/* Stars type */}
        {q.type === 'stars' && (
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(star => (
              <span key={star} className="text-2xl" style={{ color: '#d1d5db' }}>★</span>
            ))}
          </div>
        )}

        {/* Text input type */}
        {q.type === 'text' && (
          <input
            type="text"
            disabled
            placeholder="City or country..."
            className="w-full px-3 py-2.5 rounded-xl border text-sm"
            style={{
              background: isDark ? '#0a1a30' : '#f9fafb',
              borderColor: isDark ? '#1a3050' : '#e5e7eb',
              color: isDark ? '#64748b' : '#9ca3af',
            }}
          />
        )}

        {/* Options */}
        {q.options.length > 0 && q.type !== 'stars' && q.type !== 'text' && (
          <div className={
            isEditing
              ? 'space-y-1.5'
              : isGrid
                ? `grid ${gridCols} gap-1.5`
                : 'space-y-1.5'
          }>
            {q.options.map((opt, oIdx) => renderOption(q, qIdx, opt, oIdx))}
          </div>
        )}

        {/* Add option button (edit mode) */}
        {isEditing && (q.type === 'radio' || q.type === 'grid-2' || q.type === 'grid-3' || q.type === 'checkbox') && (
          <button
            onClick={() => addOption(qIdx)}
            className="mt-1.5 flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors"
            style={{
              color: '#C41E3A',
              background: isDark ? '#C41E3A10' : '#C41E3A08',
            }}
          >
            <span className="text-sm">+</span> Add option
          </button>
        )}
      </div>
    );
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        animation: 'fbOverlayIn 0.25s ease-out',
      }}
    >
      <div
        className="relative w-full max-w-sm max-h-[85vh] rounded-2xl border overflow-hidden flex flex-col"
        style={{
          background: isDark ? '#0d1f38' : '#ffffff',
          borderColor: border,
          animation: 'fbPopupIn 0.3s cubic-bezier(0.16,1,0.3,1)',
          boxShadow: isDark
            ? '0 25px 60px rgba(0,0,0,0.6)'
            : '0 25px 60px rgba(0,0,0,0.15)',
        }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b flex-shrink-0" style={{ borderColor: border }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img src="/ram-logo.png" alt="RAM" className="h-8 object-contain" />
              <div>
                <p className="text-sm font-semibold" style={{ color: isDark ? '#e2e8f0' : '#111827' }}>
                  Royal Air Maroc
                </p>
                <p className="text-[10px]" style={{ color: textSecondary }}>
                  {isEditing ? 'Editing Survey' : 'Passenger Experience Survey'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
              style={{
                background: isDark ? '#1a305060' : '#f3f4f6',
                color: textSecondary,
              }}
            >
              ✕
            </button>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map(s => (
              <div
                key={s}
                className="h-1 flex-1 rounded-full transition-all duration-300"
                style={{ background: s <= step ? '#C41E3A' : isDark ? '#1a3050' : '#e5e7eb' }}
              />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {currentStep && (
            <div className="space-y-4">
              <h2
                className="font-semibold text-base"
                style={{ color: isDark ? '#e2e8f0' : '#111827' }}
              >
                {currentStep.title}
              </h2>
              {currentStep.questions.map((q, qIdx) => renderQuestion(q, qIdx))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t flex-shrink-0" style={{ borderColor: border }}>
          {/* Navigation buttons */}
          <div className="flex gap-3 mb-3">
            {step > 1 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors"
                style={{
                  borderColor: isDark ? '#1a3050' : '#d1d5db',
                  color: isDark ? '#4a7aab' : '#6b7280',
                  background: 'transparent',
                }}
              >
                ← Back
              </button>
            )}
            {step < 3 && (
              <button
                onClick={() => setStep(s => s + 1)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
                style={{ background: '#C41E3A' }}
              >
                Next →
              </button>
            )}
          </div>

          {/* Edit buttons — centered below nav */}
          <div className="flex justify-center">
            <div className="relative flex items-center justify-center" style={{ height: 44 }}>
              {/* Plus button */}
              <button
                onClick={handlePlusClick}
                className="absolute flex items-center justify-center rounded-full transition-all"
                style={{
                  width: 44,
                  height: 44,
                  background: '#C41E3A',
                  color: '#ffffff',
                  fontSize: 22,
                  fontWeight: 300,
                  boxShadow: '0 4px 14px rgba(196,30,58,0.4)',
                  opacity: buttonState === 'plus' ? 1 : 0,
                  transform: buttonState === 'plus'
                    ? 'scale(1) rotate(0deg)'
                    : 'scale(0) rotate(135deg)',
                  transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                  pointerEvents: buttonState === 'plus' ? 'auto' : 'none',
                }}
              >
                +
              </button>

              {/* Submit + Cancel */}
              <div
                className="absolute flex items-center gap-3"
                style={{
                  opacity: buttonState === 'actions' ? 1 : 0,
                  transform: buttonState === 'actions' ? 'scale(1)' : 'scale(0.6)',
                  transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                  pointerEvents: buttonState === 'actions' ? 'auto' : 'none',
                }}
              >
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all hover:brightness-110"
                  style={{
                    background: saving ? '#6b7280' : '#16a34a',
                    boxShadow: '0 4px 14px rgba(22,163,74,0.3)',
                  }}
                >
                  {saving ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>✓</span>
                  )}
                  {saving ? 'Saving...' : 'Submit'}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all hover:brightness-110"
                  style={{
                    background: '#C41E3A',
                    boxShadow: '0 4px 14px rgba(196,30,58,0.4)',
                  }}
                >
                  <span>✕</span> Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fbOverlayIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes fbPopupIn {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
