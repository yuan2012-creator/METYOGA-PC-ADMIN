import React from 'react';
import './summaryMetricGrid.css';

export type SummaryMetricStatus = 'normal' | 'warning' | 'danger' | 'success';

export interface SummaryMetricItem {
  id: string;
  label: string;
  value: string | number;
  hint?: string;
  status?: SummaryMetricStatus;
  active?: boolean;
  onClick?: () => void;
  testId?: string;
}

export interface SummaryMetricGridProps {
  items: SummaryMetricItem[];
  className?: string;
  columns?: number;
  compact?: boolean;
  'data-testid'?: string;
}

function getStatusClass(status: SummaryMetricStatus = 'normal'): string {
  const map: Record<SummaryMetricStatus, string> = {
    normal: 'met-v2-summary-card--normal',
    warning: 'met-v2-summary-card--warning',
    danger: 'met-v2-summary-card--danger',
    success: 'met-v2-summary-card--success',
  };
  return map[status];
}

export const SummaryMetricGrid: React.FC<SummaryMetricGridProps> = ({
  items,
  className,
  columns,
  compact = false,
  'data-testid': testId,
}) => (
  <section
    className={[
      'met-v2-summary-grid',
      compact ? 'met-v2-summary-grid--compact' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
    style={columns ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } : undefined}
    aria-label="状态摘要"
    data-testid={testId}
  >
    {items.map(item => {
      const cardClassName = [
        'met-v2-summary-card',
        getStatusClass(item.status),
        item.active ? 'met-v2-summary-card--active' : '',
      ]
        .filter(Boolean)
        .join(' ');

      const content = (
        <>
          <span className="met-v2-summary-card__value">{item.value}</span>
          <span className="met-v2-summary-card__label">{item.label}</span>
          {item.hint ? <span className="met-v2-summary-card__hint">{item.hint}</span> : null}
        </>
      );

      if (item.onClick) {
        return (
          <button key={item.id} type="button" className={cardClassName} data-testid={item.testId} onClick={item.onClick}>
            {content}
          </button>
        );
      }

      return (
        <div key={item.id} className={cardClassName} data-testid={item.testId}>
          {content}
        </div>
      );
    })}
  </section>
);
