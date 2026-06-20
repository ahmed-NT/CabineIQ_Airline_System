import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTheme } from '@/hooks/useTheme';

interface ChartDatum {
  label: string;
  value: number;
}

interface IntentChartProps {
  title: string;
  data: ChartDatum[];
  barColor: string;
  yLabel?: string;
  valueSuffix?: string;
}

function formatCategory(category: string): string {
  const map: Record<string, string> = {
    BUSINESS: 'Business',
    LEISURE: 'Leisure',
    FAMILY: 'Family',
    RAM_MA: 'RAM.ma',
    GOOGLE_FLIGHTS: 'Google',
    AGENCY: 'Agency',
    OTHER: 'Other',
  };
  return map[category] || category.replace(/_/g, ' ');
}

export default function IntentChart({
  title,
  data,
  barColor,
  yLabel = 'Score',
  valueSuffix = '',
}: IntentChartProps) {
  const { isDark } = useTheme();
  const chartData = data.map((d) => ({
    name: formatCategory(d.label),
    value: d.value,
  }));

  const axisColor = isDark ? '#4a7aab' : '#6b7280';
  const gridColor = isDark ? '#1a3050' : '#e5e7eb';
  const tooltipBg = isDark ? '#0a1e38' : '#ffffff';
  const tooltipBorder = isDark ? '#1a3050' : '#e5e7eb';

  return (
    <div
      className={`rounded-xl border p-4 h-full transition-colors ${
        isDark
          ? 'bg-[#0a1e38] border-[#1a3050]'
          : 'bg-white border-gray-200 shadow-sm'
      }`}
    >
      <h3
        className={`text-sm font-semibold mb-4 ${
          isDark ? 'text-white' : 'text-[#1A1A2E]'
        }`}
      >
        {title}
      </h3>
      {chartData.length === 0 ? (
        <div
          className={`h-48 flex items-center justify-center text-xs ${
            isDark ? 'text-[#4a7aab]' : 'text-gray-400'
          }`}
        >
          No data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: axisColor, fontSize: 11 }}
              axisLine={{ stroke: gridColor }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: axisColor, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              label={{
                value: yLabel,
                angle: -90,
                position: 'insideLeft',
                fill: axisColor,
                fontSize: 10,
              }}
            />
            <Tooltip
              contentStyle={{
                background: tooltipBg,
                border: `1px solid ${tooltipBorder}`,
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value) => [
                `${value ?? 0}${valueSuffix}`,
                yLabel === 'Score' ? 'Avg Score' : yLabel,
              ]}
            />
            <Bar dataKey="value" fill={barColor} radius={[4, 4, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
