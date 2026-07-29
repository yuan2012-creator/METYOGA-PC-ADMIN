import React from 'react';
import type { StaffMetricItem } from './staffOperationViewModel';

const StaffMetricCard: React.FC<{ item: StaffMetricItem }> = ({ item }) => (
  <article
    className={`met-staff-metric-card met-today-surface${item.tone === 'amber' ? ' is-amber' : ''}${item.tone === 'rose' ? ' is-rose' : ''}`}
  >
    <p className="met-staff-metric-card__label">{item.label}</p>
    <span className="met-staff-metric-card__value">{item.value}</span>
    <p className="met-staff-metric-card__hint">{item.hint}</p>
  </article>
);

export default StaffMetricCard;
