import React from 'react';
import type { FinanceInsightTip } from './financeOperationViewModel';

interface FinanceInsightPanelProps {
  tips: FinanceInsightTip[];
  onAction: (key: string) => void;
}

const FinanceInsightPanel: React.FC<FinanceInsightPanelProps> = ({ tips, onAction }) => (
  <section className="met-finance-insights">
    <h2 className="met-finance-insights__title">财务经营建议</h2>
    <div className="met-finance-insights__row">
      {tips.map(tip => (
        <article key={tip.id} className="met-finance-insight-card met-today-surface">
          <div className="met-finance-insight-card__main">
            <span className="met-finance-insight-card__tag">{tip.tag}</span>
            <p className="met-finance-insight-card__line">{tip.line}</p>
          </div>
          <button type="button" className="met-member-btn-sm" onClick={() => onAction(tip.actionKey)}>
            {tip.actionLabel}
          </button>
        </article>
      ))}
    </div>
  </section>
);

export default FinanceInsightPanel;
