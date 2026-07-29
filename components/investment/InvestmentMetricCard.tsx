import React from 'react';
import type { InvestmentMetric } from './investmentOperationViewModel';

const InvestmentMetricCard: React.FC<{ item: InvestmentMetric }> = ({ item }) => (
  <article
    className={`met-investment-metric-card met-today-surface${item.tone === 'amber' ? ' is-amber' : ''}${item.tone === 'rose' ? ' is-rose' : ''}`}
  >
    <p className="met-investment-metric-card__label">{item.label}</p>
    <span className="met-investment-metric-card__value">{item.value}</span>
    <p className="met-investment-metric-card__hint">{item.hint}</p>
  </article>
);

export default InvestmentMetricCard;
