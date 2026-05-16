import React from 'react';
import type { TodayMetricItem } from './todayOperationViewModel';

interface TodayMetricCardProps {
  item: TodayMetricItem;
}

const valueToneClass = (tone?: TodayMetricItem['tone']): string => {
  if (tone === 'rose') return 'text-[#8B4A42]';
  if (tone === 'amber') return 'text-[#8A6A3A]';
  return 'text-[#222622]';
};

const hintToneClass = (tone?: TodayMetricItem['tone']): string => {
  if (tone === 'rose') return 'text-[#9A6B63]';
  if (tone === 'amber') return 'text-[#8A7355]';
  return 'text-[#70776F]';
};

const TodayMetricCard: React.FC<TodayMetricCardProps> = ({ item }) => (
  <div className="met-today-metric-card flex h-[104px] flex-col justify-between rounded-[14px] p-5">
    <p className="text-xs font-medium text-[#70776F]">{item.label}</p>
    <div>
      <div className="flex items-baseline gap-1">
        <span
          className={`text-[28px] leading-none tabular-nums tracking-tight ${valueToneClass(item.tone)}`}
          style={{ fontWeight: 650 }}
        >
          {item.value}
        </span>
        {item.subLabel ? <span className="text-xs text-[#8A908A]">{item.subLabel}</span> : null}
      </div>
      {item.hint ? (
        <p className={`mt-2 text-xs leading-snug ${hintToneClass(item.tone)}`}>{item.hint}</p>
      ) : (
        <p className="mt-2 text-xs text-transparent select-none" aria-hidden>
          —
        </p>
      )}
    </div>
  </div>
);

export default TodayMetricCard;
