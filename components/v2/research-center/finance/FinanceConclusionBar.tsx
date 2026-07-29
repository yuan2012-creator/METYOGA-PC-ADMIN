import React, { useState } from 'react';
import type { CohortConfig } from '../researchCenterV2.viewModel';

interface FinanceConclusionBarProps {
  conclusion: string;
  onAddEnrollment: () => void;
  onAddCost: () => void;
  onViewCalc: () => void;
}

const FinanceConclusionBar: React.FC<FinanceConclusionBarProps> = ({
  conclusion,
  onAddEnrollment,
  onAddCost,
  onViewCalc,
}) => {
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <section className="met-rc-v2-finance-conclusion">
      <div>
        <span className="met-rc-v2-finance-conclusion__label">当前结论</span>
        <p>{conclusion}</p>
      </div>
      <div className="met-rc-v2-finance-conclusion__actions">
        <button type="button" className="met-rc-v2-btn met-rc-v2-btn--primary met-rc-v2-btn--sm" onClick={onAddEnrollment}>
          添加报名
        </button>
        <button type="button" className="met-rc-v2-btn met-rc-v2-btn--ghost met-rc-v2-btn--sm" onClick={onAddCost}>
          补充成本
        </button>
        <div className="met-rc-v2-more">
          <button
            type="button"
            className="met-rc-v2-btn met-rc-v2-btn--ghost met-rc-v2-btn--sm"
            aria-expanded={moreOpen}
            onClick={() => setMoreOpen(v => !v)}
          >
            更多
          </button>
          {moreOpen ? (
            <div className="met-rc-v2-more__menu">
              <button
                type="button"
                onClick={() => {
                  onViewCalc();
                  setMoreOpen(false);
                }}
              >
                查看计算
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export interface FinanceKeyResult {
  id: string;
  label: string;
  value: string;
  hint: string;
  tone?: 'danger' | 'warning' | 'normal' | 'muted';
}

interface FinanceKeyResultsProps {
  items: FinanceKeyResult[];
}

export const FinanceKeyResults: React.FC<FinanceKeyResultsProps> = ({ items }) => (
  <div className="met-rc-v2-finance-key-results">
    {items.map(item => (
      <article
        key={item.id}
        className={['met-rc-v2-finance-key-results__item', item.tone === 'muted' ? 'is-muted' : '']
          .filter(Boolean)
          .join(' ')}
      >
        <span className="met-rc-v2-finance-key-results__label">{item.label}</span>
        <strong className={item.tone === 'danger' ? 'is-danger' : ''}>{item.value}</strong>
        <p>{item.hint}</p>
      </article>
    ))}
  </div>
);

interface CohortFinanceSwitchProps {
  cohorts: CohortConfig[];
  activeCohortId: string;
  onSelect: (id: string) => void;
}

export const CohortFinanceSwitch: React.FC<CohortFinanceSwitchProps> = ({
  cohorts,
  activeCohortId,
  onSelect,
}) => (
  <div className="met-rc-v2-finance-cohort-switch">
    {cohorts.map(c => (
      <button
        key={c.id}
        type="button"
        className={['met-rc-v2-cohort-switch__tab', c.id === activeCohortId ? 'is-active' : ''].join(' ')}
        onClick={() => onSelect(c.id)}
      >
        {c.displayTitle}
      </button>
    ))}
  </div>
);

export default FinanceConclusionBar;
