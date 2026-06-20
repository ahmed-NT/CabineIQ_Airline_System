import { IconArrowDown, IconArrowUp, IconMinus } from '@tabler/icons-react';
import type { MlPrediction } from '@/types';
import { useTheme } from '@/hooks/useTheme';

interface MlPredictionsTableProps {
  predictions: MlPrediction[];
  lastTrained: string;
  modelPhase: string;
  offline?: boolean;
}

function TrendIcon({ trend }: { trend: MlPrediction['trend'] }) {
  if (trend === 'UP') {
    return <IconArrowUp className="w-4 h-4 text-[#4ade80]" />;
  }
  if (trend === 'DOWN') {
    return <IconArrowDown className="w-4 h-4 text-[#f87171]" />;
  }
  return <IconMinus className="w-4 h-4 text-[#fbbf24]" />;
}

export default function MlPredictionsTable({
  predictions,
  lastTrained,
  modelPhase,
  offline = false,
}: MlPredictionsTableProps) {
  const { isDark } = useTheme();

  const formattedDate = lastTrained
    ? new Date(lastTrained).toLocaleString()
    : '—';

  return (
    <div
      className={`rounded-xl border transition-colors ${
        isDark
          ? 'bg-[#0a1e38] border-[#1a3050]'
          : 'bg-white border-gray-200 shadow-sm'
      }`}
    >
      <div className="px-4 pt-4 pb-2 border-b border-inherit">
        <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-[#1A1A2E]'}`}>
          Price Multiplier Recommendations
        </h3>
        <p className={`text-xs mt-1 ${isDark ? 'text-[#4a7aab]' : 'text-gray-500'}`}>
          Generated nightly by ML model · Last trained: {formattedDate}
          {' · '}
          <span className="font-medium">{modelPhase.replace(/_/g, ' ')}</span>
        </p>
        {offline && (
          <div className="mt-3 px-3 py-2 rounded-lg bg-[#fbbf24]/10 border border-[#fbbf24]/30 text-[#fbbf24] text-xs">
            ML service is offline — showing last cached predictions
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr
              className={`text-left text-xs uppercase tracking-wide ${
                isDark ? 'text-[#4a7aab]' : 'text-gray-500'
              }`}
            >
              <th className="px-4 py-3 font-medium">Route</th>
              <th className="px-4 py-3 font-medium">Class</th>
              <th className="px-4 py-3 font-medium">Multiplier</th>
              <th className="px-4 py-3 font-medium">Confidence</th>
              <th className="px-4 py-3 font-medium">Trend</th>
              <th className="px-4 py-3 font-medium">Responses</th>
            </tr>
          </thead>
          <tbody>
            {predictions.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className={`px-4 py-8 text-center text-xs ${
                    isDark ? 'text-[#4a7aab]' : 'text-gray-400'
                  }`}
                >
                  No predictions available
                </td>
              </tr>
            ) : (
              predictions.map((p) => (
                <tr
                  key={`${p.route}-${p.seatClass}`}
                  className={`border-t ${
                    isDark ? 'border-[#1a3050]' : 'border-gray-100'
                  }`}
                >
                  <td className={`px-4 py-3 font-medium ${isDark ? 'text-white' : 'text-[#1A1A2E]'}`}>
                    {p.route.replace('-', '→')}
                  </td>
                  <td className={isDark ? 'text-[#8aa8c8]' : 'text-gray-600'}>
                    {p.seatClass}
                  </td>
                  <td className="px-4 py-3 font-semibold text-[#C41E3A]">
                    ×{p.recommendedMultiplier.toFixed(2)}
                  </td>
                  <td className={isDark ? 'text-[#8aa8c8]' : 'text-gray-600'}>
                    {(p.confidence * 100).toFixed(0)}%
                  </td>
                  <td className="px-4 py-3">
                    <TrendIcon trend={p.trend} />
                  </td>
                  <td className={isDark ? 'text-[#8aa8c8]' : 'text-gray-600'}>
                    {p.basedOnResponses}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
