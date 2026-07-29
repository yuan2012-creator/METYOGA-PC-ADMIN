import React from 'react';
import type { FinanceCompletenessField } from '../researchCenterFinanceModel';
import type { ResearchCenterDrawerState } from '../ResearchCenterDrawer';

interface FinanceDataCompletenessProps {
  percent: number;
  missingCount: number;
  fields: FinanceCompletenessField[];
  onOpenDrawer: (drawer: ResearchCenterDrawerState) => void;
  variant?: 'full' | 'sidebar';
}

const FinanceDataCompleteness: React.FC<FinanceDataCompletenessProps> = ({
  percent,
  missingCount,
  fields,
  onOpenDrawer,
  variant = 'full',
}) => {
  const missing = fields.filter(f => !f.completed).slice(0, 4);

  return (
    <section className={['met-rc-v2-card', 'met-rc-v2-finance-complete', variant === 'sidebar' ? 'is-sidebar' : ''].filter(Boolean).join(' ')}>
      <header className="met-rc-v2-zone__head met-rc-v2-finance-complete__head">
        <h2 className="met-rc-v2-zone__title">数据完整度</h2>
        <strong className="met-rc-v2-finance-complete__pct">{percent}%</strong>
      </header>
      <div className="met-rc-v2-finance-complete__bar" aria-hidden>
        <div className="met-rc-v2-finance-complete__fill" style={{ width: `${percent}%` }} />
      </div>
      {missingCount > 0 ? (
        <p className="met-rc-v2-finance-complete__meta">缺失 {missingCount} 项必填信息</p>
      ) : (
        <p className="met-rc-v2-finance-complete__meta is-done">必填财务字段已全部完成</p>
      )}
      <ul className="met-rc-v2-finance-complete__list">
        {missing.map(field => (
          <li key={field.id}>
            <span>{field.label}</span>
            <button
              type="button"
              className="met-rc-v2-btn met-rc-v2-btn--ghost met-rc-v2-btn--sm met-rc-v2-finance-complete__action"
              onClick={() => onOpenDrawer({ type: 'content', key: field.actionKey })}
            >
              {field.actionLabel}
            </button>
          </li>
        ))}
        {fields.every(f => f.completed) ? <li className="is-done">暂无待补充项</li> : null}
      </ul>
    </section>
  );
};

export default FinanceDataCompleteness;
