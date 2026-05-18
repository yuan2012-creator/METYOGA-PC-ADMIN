import React from 'react';
import type { MarketingInsight } from './marketingOperationViewModel';

const MarketingInsightPanel: React.FC<{
  tips: MarketingInsight[];
  onAction: (key: string) => void;
}> = ({ tips, onAction }) => (
  <section className="met-marketing-insights">
    <h2 className="met-marketing-insights__title">活动经营建议</h2>
    <div className="met-marketing-insights__row">
      {tips.map(tip => (
        <article key={tip.id} className="met-marketing-insight-card met-today-surface">
          <div className="met-marketing-insight-card__main">
            <span className="met-marketing-insight-card__tag">{tip.tag}</span>
            <p className="met-marketing-insight-card__line">{tip.line}</p>
          </div>
          <button type="button" className="met-member-btn-sm" onClick={() => onAction(tip.actionKey)}>
            {tip.actionLabel}
          </button>
        </article>
      ))}
    </div>
  </section>
);

export default MarketingInsightPanel;
