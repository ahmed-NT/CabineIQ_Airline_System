import type { ReactNode } from 'react';
import { useTheme } from '@/hooks/useTheme';

interface KpiCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  valueColor?: string;
  footer?: ReactNode;
}

export default function KpiCard({ icon, label, value, valueColor, footer }: KpiCardProps) {
  const { isDark } = useTheme();

  return (
    <div
      className={`rounded-xl border p-4 flex flex-col gap-2 transition-colors ${
        isDark
          ? 'bg-[#0a1e38] border-[#1a3050]'
          : 'bg-white border-gray-200 shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-xs font-medium uppercase tracking-wide ${
            isDark ? 'text-[#4a7aab]' : 'text-gray-500'
          }`}
        >
          {label}
        </span>
        <span className={isDark ? 'text-[#C9A84C]' : 'text-[#C41E3A]'}>
          {icon}
        </span>
      </div>
      <div
        className="text-2xl font-bold"
        style={{ color: valueColor || (isDark ? '#ffffff' : '#1A1A2E') }}
      >
        {value}
      </div>
      {footer && <div className="mt-1">{footer}</div>}
    </div>
  );
}
