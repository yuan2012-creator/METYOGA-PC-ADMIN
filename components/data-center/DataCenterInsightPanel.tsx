import React from 'react';
import type { DataInsight } from './dataCenterOperationViewModel';

const DataCenterInsightPanel: React.FC<{
  tips: DataInsight[];
  onAction: (key: string) => void;
}> = ({ tips, onAction }) => (
  <section className="met-data-insights">
    <h2 className="met-data-insights__title">分析建议</h2>
    <div className="met-data-insights__row">
      {tips.map(tip => (
        <article key={tip.id} className="met-data-insight-card met-today-surface">
          <div className="met-data-insight-card__main">
            <span className="met-data-insight-card__tag">{tip.tag}</span>
            <p className="met-data-insight-card__line">{tip.line}</p>
          </div>
          <button type="button" className="met-member-btn-sm" onClick={() => onAction(tip.actionKey)}>
            {tip.actionLabel}
          </button>
        </article>
      ))}
    </div>
  </section>
);

export default DataCenterInsightPanel;
