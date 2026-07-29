import React from 'react';
import type { DataMetric } from './dataCenterOperationViewModel';

const DataCenterMetricCard: React.FC<{ item: DataMetric }> = ({ item }) => (
  <article
    className={`met-data-metric-card met-today-surface${item.tone === 'amber' ? ' is-amber' : ''}${item.tone === 'rose' ? ' is-rose' : ''}`}
  >
    <p className="met-data-metric-card__label">{item.label}</p>
    <span className="met-data-metric-card__value">{item.value}</span>
    <p className="met-data-metric-card__hint">{item.hint}</p>
  </article>
);

export default DataCenterMetricCard;
