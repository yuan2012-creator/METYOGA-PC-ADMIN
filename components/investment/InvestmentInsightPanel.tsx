import React from 'react';
import type { InvestmentInsight } from './investmentOperationViewModel';

const InvestmentInsightPanel: React.FC<{
  tips: InvestmentInsight[];
  onAction: (key: string) => void;
}> = ({ tips, onAction }) => (
  <section className="met-investment-insights">
    <h2 className="met-investment-insights__title">投资建议</h2>
    <div className="met-investment-insights__row">
      {tips.map(tip => (
        <article key={tip.id} className="met-investment-insight-card met-today-surface">
          <div className="met-investment-insight-card__main">
            <span className="met-investment-insight-card__tag">{tip.tag}</span>
            <p className="met-investment-insight-card__line">{tip.line}</p>
          </div>
          <button type="button" className="met-member-btn-sm" onClick={() => onAction(tip.actionKey)}>
            {tip.actionLabel}
          </button>
        </article>
      ))}
    </div>
  </section>
);

export default InvestmentInsightPanel;
