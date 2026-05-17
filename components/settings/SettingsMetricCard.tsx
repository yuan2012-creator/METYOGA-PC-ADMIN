import React from 'react';
import type { SettingsMetricItem } from './settingsOperationViewModel';

const SettingsMetricCard: React.FC<{ item: SettingsMetricItem }> = ({ item }) => (
  <article
    className={`met-settings-metric-card met-today-surface${item.tone === 'amber' ? ' is-amber' : ''}${item.tone === 'rose' ? ' is-rose' : ''}`}
  >
    <p className="met-settings-metric-card__label">{item.label}</p>
    <span className="met-settings-metric-card__value">{item.value}</span>
    <p className="met-settings-metric-card__hint">{item.hint}</p>
  </article>
);

export default SettingsMetricCard;
