import React from 'react';
import type { MallInsightTip } from './mallOperationViewModel';

interface MallInsightPanelProps {
  tips: MallInsightTip[];
  onAction: (key: string) => void;
}

const MallInsightPanel: React.FC<MallInsightPanelProps> = ({ tips, onAction }) => (
  <section className="met-mall-insights">
    <h2 className="met-mall-insights__title">产品与合同建议</h2>
    <div className="met-mall-insights__row">
      {tips.map(tip => (
        <article key={tip.id} className="met-mall-insight-card met-today-surface">
          <div className="met-mall-insight-card__main">
            <span className="met-mall-insight-card__tag">{tip.tag}</span>
            <p className="met-mall-insight-card__line">{tip.line}</p>
          </div>
          <button type="button" className="met-member-btn-sm" onClick={() => onAction(tip.actionKey)}>
            {tip.actionLabel}
          </button>
        </article>
      ))}
    </div>
  </section>
);

export default MallInsightPanel;
