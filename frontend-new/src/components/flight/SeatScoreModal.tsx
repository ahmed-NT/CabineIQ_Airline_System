import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { TbStar, TbX, TbAlertTriangle } from 'react-icons/tb';

interface Props {
  seatId: string;
  existingScore?: number | null;
  existingLostItem?: boolean | null;
  existingDescription?: string;
  onClose: () => void;
  onSubmit: (score: number, lostItem: boolean, description: string) => void;
  isSubmitting: boolean;
}

export default function SeatScoreModal({
  seatId,
  existingScore,
  existingLostItem,
  existingDescription,
  onClose,
  onSubmit,
  isSubmitting,
}: Props) {
  const { isDark } = useTheme();
  const [score, setScore] = useState(existingScore ?? 0);
  const [lostItem, setLostItem] = useState(existingLostItem ?? false);
  const [description, setDescription] = useState(existingDescription ?? '');
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  const bg = isDark ? '#071628' : 'white';
  const border = isDark ? '#1a3050' : '#e5e7eb';
  const textPrimary = isDark ? 'white' : '#1a1a2e';
  const textMuted = isDark ? '#4a7aab' : '#6b7280';
  const inputBg = isDark ? '#0a1e38' : '#f9fafb';

  const handleSubmit = () => {
    onSubmit(score, lostItem, description);
  };

  const displayStars = hoveredStar !== null ? hoveredStar : score;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border p-6 space-y-5"
        style={{ background: bg, borderColor: border }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-bold px-3 py-1 rounded-lg"
              style={{
                background: isDark ? '#0a1e38' : '#f3f4f6',
                color: textPrimary,
              }}
            >
              Seat {seatId}
            </span>
            <span className="text-xs" style={{ color: textMuted }}>
              Score
            </span>
          </div>
          <button onClick={onClose}>
            <TbX className="w-5 h-5" style={{ color: textMuted }} />
          </button>
        </div>

        {/* Stars */}
        <div>
          <label
            className="block text-[10px] font-bold uppercase tracking-wider mb-2"
            style={{ color: textMuted }}
          >
            Cleanliness
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setScore(star)}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(null)}
                className="p-1 transition-transform hover:scale-110"
              >
                <TbStar
                  className="w-7 h-7"
                  style={{
                    color: star <= displayStars ? '#EF9F27' : isDark ? '#1a3050' : '#d1d5db',
                    fill: star <= displayStars ? '#EF9F27' : 'none',
                  }}
                />
              </button>
            ))}
            <span
              className="ml-2 self-center text-sm font-bold"
              style={{ color: score > 0 ? '#EF9F27' : textMuted }}
            >
              {score}/5
            </span>
          </div>
        </div>

        {/* Lost item checkbox */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={lostItem}
              onChange={(e) => setLostItem(e.target.checked)}
              className="w-4 h-4 rounded"
              style={{ accentColor: '#EF9F27' }}
            />
            <TbAlertTriangle
              className="w-4 h-4"
              style={{ color: lostItem ? '#EF9F27' : textMuted }}
            />
            <span className="text-sm font-medium" style={{ color: textPrimary }}>
              Lost item found
            </span>
          </label>
        </div>

        {/* Description */}
        {lostItem && (
          <div>
            <label
              className="block text-[10px] font-bold uppercase tracking-wider mb-1.5"
              style={{ color: textMuted }}
            >
              Item description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Black laptop bag left under seat"
              rows={3}
              maxLength={500}
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-[#EF9F27] transition-colors resize-none"
              style={{ background: inputBg, borderColor: border, color: textPrimary }}
            />
            <span className="text-[10px]" style={{ color: textMuted }}>
              {description.length}/500
            </span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors"
            style={{ borderColor: border, color: textMuted }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={score === 0 || isSubmitting}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-40"
            style={{ background: '#C41E3A' }}
          >
            {isSubmitting ? 'Saving…' : 'Save Score'}
          </button>
        </div>
      </div>
    </div>
  );
}
