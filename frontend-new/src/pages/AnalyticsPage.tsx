import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  IconClipboardList,
  IconChartBar,
  IconClick,
  IconUsers,
  IconRefresh,
  IconDownload,
} from '@tabler/icons-react';
import { feedbackAPI, mlAPI } from '@/lib/api';
import { TbCircleFilled } from 'react-icons/tb';
import type { AnalyticsData, MlPredictionsResponse } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import KpiCard from '@/components/analytics/KpiCard';
import IntentChart from '@/components/analytics/IntentChart';
import MlPredictionsTable from '@/components/analytics/MlPredictionsTable';

const EMPTY_ANALYTICS: AnalyticsData = {
  totalSurveys: 0,
  averageIntentScore: 0,
  offerClickRate: 0,
  segmentCounts: { HIGH_VALUE: 0, POTENTIAL: 0, PRICE_SENSITIVE: 0 },
  intentByTripPurpose: [],
  intentByBookingChannel: [],
  offerClickRateByScoreBand: [],
  priceSensitivityByRoute: [],
  lastUpdated: new Date().toISOString(),
};

const FALLBACK_ML: MlPredictionsResponse = {
  lastTrained: new Date().toISOString(),
  modelPhase: 'RULE_BASED',
  predictions: [
    {
      route: 'CMN-CDG',
      seatClass: 'ECONOMY',
      recommendedMultiplier: 1.08,
      confidence: 0.55,
      trend: 'STABLE',
      basedOnResponses: 0,
    },
    {
      route: 'CMN-JFK',
      seatClass: 'BUSINESS',
      recommendedMultiplier: 1.15,
      confidence: 0.55,
      trend: 'STABLE',
      basedOnResponses: 0,
    },
  ],
};

function scoreColor(score: number): string {
  if (score >= 70) return '#4ade80';
  if (score >= 40) return '#fbbf24';
  return '#f87171';
}

function Skeleton({ isDark }: { isDark: boolean }) {
  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 animate-pulse">
      <div className={`h-8 w-64 rounded ${isDark ? 'bg-[#1a3050]' : 'bg-gray-200'}`} />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-28 rounded-xl ${isDark ? 'bg-[#0a1e38]' : 'bg-gray-100'}`}
          />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-64 rounded-xl ${isDark ? 'bg-[#0a1e38]' : 'bg-gray-100'}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { isDark } = useTheme();
  const [cachedMl, setCachedMl] = useState<MlPredictionsResponse | null>(null);

  const {
    data: analytics,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['feedback-analytics'],
    queryFn: () =>
      feedbackAPI.getAnalytics().then((r) => r.data as AnalyticsData),
    refetchInterval: 60_000,
  });

  const {
    data: mlData,
    isError: mlError,
  } = useQuery({
    queryKey: ['ml-predictions'],
    queryFn: () =>
      mlAPI.getPredictions().then((r) => {
        const data = r.data as MlPredictionsResponse;
        setCachedMl(data);
        return data;
      }),
    refetchInterval: 60_000,
    retry: 1,
  });

  const { data: mlHealth } = useQuery({
    queryKey: ['ml-health'],
    queryFn: () => mlAPI.getHealth().then((r) => r.data as { status: string; model_phase: string; total_responses: number }),
    refetchInterval: 30_000,
    retry: 1,
  });

  const data = analytics ?? EMPTY_ANALYTICS;
  const ml = mlData ?? cachedMl ?? (mlError ? { ...FALLBACK_ML } : null);
  const mlOffline = mlError && !mlData;

  const tripPurposeChart = useMemo(
    () =>
      data.intentByTripPurpose.map((d) => ({
        label: d.category,
        value: d.averageScore,
      })),
    [data.intentByTripPurpose],
  );

  const bookingChannelChart = useMemo(
    () =>
      data.intentByBookingChannel.map((d) => ({
        label: d.category,
        value: d.averageScore,
      })),
    [data.intentByBookingChannel],
  );

  const scoreBandChart = useMemo(
    () =>
      data.offerClickRateByScoreBand.map((d) => ({
        label: d.band,
        value: d.clickRate,
      })),
    [data.offerClickRateByScoreBand],
  );

  const routeSensitivityChart = useMemo(
    () =>
      data.priceSensitivityByRoute.map((d) => ({
        label: d.route,
        value: d.sensitivityPct,
      })),
    [data.priceSensitivityByRoute],
  );

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ram-analytics-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return <Skeleton isDark={isDark} />;
  }

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1
            className={`text-lg font-bold ${
              isDark ? 'text-white' : 'text-[#1A1A2E]'
            }`}
          >
            Analytics & ML Insights
          </h1>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-[#4a7aab]' : 'text-gray-500'}`}>
            Passenger feedback intelligence · Updated{' '}
            {data.lastUpdated
              ? new Date(data.lastUpdated).toLocaleString()
              : '—'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* ML service health badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${
            isDark ? 'border-[#1a3050]' : 'border-gray-200'
          }`}>
            <TbCircleFilled className="w-2.5 h-2.5" style={{
              color: mlHealth?.status === 'ok' ? '#4ade80' : mlError ? '#f87171' : '#fbbf24'
            }} />
            <span style={{ color: isDark ? '#4a7aab' : '#6b7280' }}>
              ML ·{' '}
              {mlHealth
                ? (mlHealth.model_phase ?? mlHealth.status)
                : mlError ? 'offline' : '…'}
            </span>
            {mlHealth?.total_responses !== undefined && (
              <span style={{ color: isDark ? '#2a5080' : '#9ca3af' }}>
                · {mlHealth.total_responses} samples
              </span>
            )}
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isDark
                ? 'border-[#1a3050] text-[#4a7aab] hover:text-white hover:bg-[#122a4a]'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <IconRefresh className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-[#C41E3A] hover:bg-[#a01830] transition-colors"
          >
            <IconDownload className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>

      {isError && (
        <div className="px-4 py-3 rounded-lg bg-[#f87171]/10 border border-[#f87171]/30 text-[#f87171] text-sm">
          Failed to load analytics data. Showing empty state.
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          icon={<IconClipboardList className="w-5 h-5" />}
          label="Total Surveys"
          value={data.totalSurveys.toLocaleString()}
        />
        <KpiCard
          icon={<IconChartBar className="w-5 h-5" />}
          label="Average Intent Score"
          value={data.averageIntentScore.toFixed(1)}
          valueColor={scoreColor(data.averageIntentScore)}
        />
        <KpiCard
          icon={<IconClick className="w-5 h-5" />}
          label="Offer Click Rate"
          value={`${data.offerClickRate.toFixed(1)}%`}
        />
        <KpiCard
          icon={<IconUsers className="w-5 h-5" />}
          label="Segment Split"
          value={(
            data.segmentCounts.HIGH_VALUE +
            data.segmentCounts.POTENTIAL +
            data.segmentCounts.PRICE_SENSITIVE
          ).toLocaleString()}
          footer={
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#4ade80]/15 text-[#4ade80] border border-[#4ade80]/30">
                High {data.segmentCounts.HIGH_VALUE}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#fbbf24]/15 text-[#fbbf24] border border-[#fbbf24]/30">
                Potential {data.segmentCounts.POTENTIAL}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f87171]/15 text-[#f87171] border border-[#f87171]/30">
                Price-Sens. {data.segmentCounts.PRICE_SENSITIVE}
              </span>
            </div>
          }
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <IntentChart
          title="Intent by Trip Purpose"
          data={tripPurposeChart}
          barColor="#C41E3A"
        />
        <IntentChart
          title="Intent by Booking Channel"
          data={bookingChannelChart}
          barColor="#C9A84C"
        />
        <IntentChart
          title="Offer Click Rate by Score Band"
          data={scoreBandChart}
          barColor="#006233"
          yLabel="Click %"
          valueSuffix="%"
        />
        <IntentChart
          title="Price Sensitivity by Route"
          data={routeSensitivityChart}
          barColor="#1A1A2E"
          yLabel="Sensitivity %"
          valueSuffix="%"
        />
      </div>

      {/* ML Predictions */}
      {ml && (
        <MlPredictionsTable
          predictions={ml.predictions}
          lastTrained={ml.lastTrained}
          modelPhase={ml.modelPhase}
          offline={mlOffline}
        />
      )}
    </div>
  );
}
