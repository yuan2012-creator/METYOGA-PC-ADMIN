import React from 'react';
import type { MallMetricItem } from './mallOperationViewModel';

const MallMetricCard: React.FC<{ item: MallMetricItem }> = ({ item }) => (
  <article
    className={`met-mall-metric-card met-today-surface${item.tone === 'amber' ? ' is-amber' : ''}${item.tone === 'rose' ? ' is-rose' : ''}`}
  >
    <p className="met-mall-metric-card__label">{item.label}</p>
    <div className="met-mall-metric-card__value-row">
      <span className="met-mall-metric-card__value">{item.value}</span>
    </div>
    <p className="met-mall-metric-card__hint">{item.hint}</p>
  </article>
);

export default MallMetricCard;
