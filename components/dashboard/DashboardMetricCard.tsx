import React from 'react';
import type { DashboardMetric } from './dashboardOperationViewModel';

const DashboardMetricCard: React.FC<{
  item: DashboardMetric;
  compact?: boolean;
  stitch?: boolean;
}> = ({ item, compact, stitch }) => {
  const valueParts =
    item.label === '预约 / 到课' && item.value.includes('/')
      ? item.value.split('/').map(s => s.trim())
      : null;
  const showInfo = stitch && item.id === 'dm3';

  const labelText =
    stitch && item.label === '今日实收'
      ? '今日实收 (¥)'
      : stitch && item.label === '本月确认收入'
        ? '本月确认收入 (¥)'
        : stitch && item.label === '预收负债'
          ? '预收负债 (¥)'
          : stitch && item.label === '老师课时费待核'
            ? '老师课时费待核 (¥)'
            : item.label;

  return (
    <article
      className={`met-dashboard-metric-card met-dashboard-surface${compact ? ' met-dashboard-metric-card--compact' : ''}${stitch ? ' met-dashboard-metric-card--stitch' : ''}${item.label === '预约 / 到课' && stitch ? ' is-booking' : ''}${item.tone === 'amber' ? ' is-amber' : ''}${item.tone === 'rose' ? ' is-rose' : ''}`}
    >
      <div className="met-dashboard-metric-card__label-row">
        <p className="met-dashboard-metric-card__label">{labelText}</p>
        {showInfo ? (
          <i className="fa-solid fa-circle-info met-dashboard-metric-card__info" title="演示口径说明" />
        ) : null}
      </div>
      {valueParts ? (
        <span className="met-dashboard-metric-card__value met-dashboard-metric-card__value--split">
          <span className="is-emphasis">{valueParts[0]}</span>
          <span className="met-dashboard-metric-card__sep">/</span>
          <span className="met-dashboard-metric-card__secondary">{valueParts[1]}</span>
        </span>
      ) : (
        <span className="met-dashboard-metric-card__value">{item.value}</span>
      )}
      {item.hint ? <p className="met-dashboard-metric-card__hint">{item.hint}</p> : null}
    </article>
  );
};

export default DashboardMetricCard;
