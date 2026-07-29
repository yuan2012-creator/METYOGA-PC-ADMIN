import React from 'react';
import type { MemberMetricItem } from './memberOperationViewModel';

const valueToneClass = (tone?: MemberMetricItem['tone']): string => {
  if (tone === 'rose') return 'is-rose';
  if (tone === 'amber') return 'is-amber';
  return '';
};

const MemberMetricCard: React.FC<{ item: MemberMetricItem }> = ({ item }) => (
  <article className={`met-member-metric-card met-today-surface ${valueToneClass(item.tone)}`}>
    <p className="met-member-metric-card__label">{item.label}</p>
    <div className="met-member-metric-card__value-row">
      <span className="met-member-metric-card__value">{item.value}</span>
      {item.subLabel ? <span className="met-member-metric-card__unit">{item.subLabel}</span> : null}
    </div>
    <p className="met-member-metric-card__hint">{item.hint || '\u00a0'}</p>
  </article>
);

export default MemberMetricCard;
