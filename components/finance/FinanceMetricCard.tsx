import React from 'react';
import type { FinanceMetricItem } from './financeOperationViewModel';

const FinanceMetricCard: React.FC<{ item: FinanceMetricItem }> = ({ item }) => (
  <article
    className={`met-finance-metric-card met-today-surface${item.tone === 'amber' ? ' is-amber' : ''}${item.tone === 'rose' ? ' is-rose' : ''}`}
  >
    <p className="met-finance-metric-card__label">{item.label}</p>
    <div className="met-finance-metric-card__value-row">
      <span className="met-finance-metric-card__value">{item.value}</span>
    </div>
    <p className="met-finance-metric-card__hint">{item.hint}</p>
  </article>
);

export default FinanceMetricCard;
