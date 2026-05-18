import React from 'react';
import type { PartnerInsight } from './partnerOperationViewModel';

const PartnerInsightPanel: React.FC<{
  tips: PartnerInsight[];
  onAction: (key: string) => void;
}> = ({ tips, onAction }) => (
  <section className="met-partner-insights">
    <h2 className="met-partner-insights__title">合作治理建议</h2>
    <div className="met-partner-insights__row">
      {tips.map(tip => (
        <article key={tip.id} className="met-partner-insight-card met-today-surface">
          <div className="met-partner-insight-card__main">
            <span className="met-partner-insight-card__tag">{tip.tag}</span>
            <p className="met-partner-insight-card__line">{tip.line}</p>
          </div>
          <button type="button" className="met-member-btn-sm" onClick={() => onAction(tip.actionKey)}>
            {tip.actionLabel}
          </button>
        </article>
      ))}
    </div>
  </section>
);

export default PartnerInsightPanel;
