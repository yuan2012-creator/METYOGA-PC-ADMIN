import React from 'react';
import type { AuditMetric } from './auditOperationViewModel';

const AuditMetricCard: React.FC<{ item: AuditMetric }> = ({ item }) => (
  <article
    className={`met-audit-metric-card met-today-surface${item.tone === 'amber' ? ' is-amber' : ''}${item.tone === 'rose' ? ' is-rose' : ''}`}
  >
    <p className="met-audit-metric-card__label">{item.label}</p>
    <span className="met-audit-metric-card__value">{item.value}</span>
    <p className="met-audit-metric-card__hint">{item.hint}</p>
  </article>
);

export default AuditMetricCard;
