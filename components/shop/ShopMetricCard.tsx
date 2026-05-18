import React from 'react';
import type { ShopMetric } from './shopOperationViewModel';

const ShopMetricCard: React.FC<{ item: ShopMetric }> = ({ item }) => (
  <article
    className={`met-shop-metric-card met-today-surface${item.tone === 'amber' ? ' is-amber' : ''}${item.tone === 'rose' ? ' is-rose' : ''}`}
  >
    <p className="met-shop-metric-card__label">{item.label}</p>
    <span className="met-shop-metric-card__value">{item.value}</span>
    <p className="met-shop-metric-card__hint">{item.hint}</p>
  </article>
);

export default ShopMetricCard;
