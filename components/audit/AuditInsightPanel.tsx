import React from 'react';
import type { AuditInsight } from './auditOperationViewModel';

const AuditInsightPanel: React.FC<{
  tips: AuditInsight[];
  onAction: (key: string) => void;
}> = ({ tips, onAction }) => (
  <section className="met-audit-insights">
    <h2 className="met-audit-insights__title">审计建议</h2>
    <div className="met-audit-insights__row">
      {tips.map(tip => (
        <article key={tip.id} className="met-audit-insight-card met-today-surface">
          <div className="met-audit-insight-card__main">
            <span className="met-audit-insight-card__tag">{tip.tag}</span>
            <p className="met-audit-insight-card__line">{tip.line}</p>
          </div>
          <button type="button" className="met-member-btn-sm" onClick={() => onAction(tip.actionKey)}>
            {tip.actionLabel}
          </button>
        </article>
      ))}
    </div>
  </section>
);

export default AuditInsightPanel;
