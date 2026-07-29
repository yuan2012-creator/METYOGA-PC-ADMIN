import React from 'react';
import type { PartnerMetric } from './partnerOperationViewModel';

const PartnerMetricCard: React.FC<{ item: PartnerMetric }> = ({ item }) => (
  <article
    className={`met-partner-metric-card met-today-surface${item.tone === 'amber' ? ' is-amber' : ''}${item.tone === 'rose' ? ' is-rose' : ''}`}
  >
    <p className="met-partner-metric-card__label">{item.label}</p>
    <span className="met-partner-metric-card__value">{item.value}</span>
    <p className="met-partner-metric-card__hint">{item.hint}</p>
  </article>
);

export default PartnerMetricCard;
