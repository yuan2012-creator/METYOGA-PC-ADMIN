import React from 'react';
import type { TodayMetricItem } from './todayOperationViewModel';

interface TodayMetricCardProps {
  item: TodayMetricItem;
}

const valueToneClass = (tone?: TodayMetricItem['tone']): string => {
  if (tone === 'rose') return 'text-[#8B4A42]';
  if (tone === 'amber') return 'text-[#7A5C2E]';
  return 'text-[#292524]';
};

const hintToneClass = (tone?: TodayMetricItem['tone']): string => {
  if (tone === 'rose') return 'text-[#9A6B63]';
  if (tone === 'amber') return 'text-[#8A7355]';
  return 'text-stone-500';
};

const TodayMetricCard: React.FC<TodayMetricCardProps> = ({ item }) => (
  <div className="met-metric-card met-today-surface flex h-[108px] flex-col justify-between p-5">
    <p className="text-xs font-medium text-stone-500">{item.label}</p>
    <div>
      <div className="flex items-baseline gap-1">
        <span className={`text-[26px] font-semibold leading-none tabular-nums tracking-tight ${valueToneClass(item.tone)}`}>
          {item.value}
        </span>
        {item.subLabel ? <span className="text-xs text-stone-400">{item.subLabel}</span> : null}
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
