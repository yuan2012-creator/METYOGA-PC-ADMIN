import React from 'react';
import type { MarketingMetric } from './marketingOperationViewModel';

const MarketingMetricCard: React.FC<{ item: MarketingMetric }> = ({ item }) => (
  <article
    className={`met-marketing-metric-card met-today-surface${item.tone === 'amber' ? ' is-amber' : ''}${item.tone === 'rose' ? ' is-rose' : ''}`}
  >
    <p className="met-marketing-metric-card__label">{item.label}</p>
    <span className="met-marketing-metric-card__value">{item.value}</span>
    <p className="met-marketing-metric-card__hint">{item.hint}</p>
  </article>
);

export default MarketingMetricCard;
