import React from 'react';
import type { DashboardMetric } from './dashboardOperationViewModel';

const DashboardMetricCard: React.FC<{ item: DashboardMetric }> = ({ item }) => (
  <article
    className={`met-dashboard-metric-card met-today-surface${item.tone === 'amber' ? ' is-amber' : ''}${item.tone === 'rose' ? ' is-rose' : ''}`}
  >
    <p className="met-dashboard-metric-card__label">{item.label}</p>
    <span className="met-dashboard-metric-card__value">{item.value}</span>
    <p className="met-dashboard-metric-card__hint">{item.hint}</p>
  </article>
);

export default DashboardMetricCard;
