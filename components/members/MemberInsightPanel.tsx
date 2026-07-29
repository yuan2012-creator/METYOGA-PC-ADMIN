import React from 'react';
import type { MemberInsightItem } from './memberOperationViewModel';

interface MemberInsightPanelProps {
  tips: MemberInsightItem[];
  onAction: (key: string, action: string) => void;
}

const MemberInsightPanel: React.FC<MemberInsightPanelProps> = ({ tips, onAction }) => (
  <section className="met-member-insights">
    <h2 className="met-member-insights__title">会员经营建议</h2>
    <div className="met-member-insights__row">
      {tips.map(tip => (
        <article key={tip.id} className="met-member-insight-card met-today-surface">
          <div className="met-member-insight-card__main">
            <span className="met-member-insight-card__tag">{tip.category}</span>
            <p className="met-member-insight-card__line">{tip.summary}</p>
            <span className="met-member-insight-card__count" aria-hidden>
              {tip.countLabel}
            </span>
          </div>
          <button
            type="button"
            className="met-member-btn-sm"
            onClick={() => onAction(tip.actionKey, tip.action)}
          >
            {tip.action}
          </button>
        </article>
      ))}
    </div>
  </section>
);

export default MemberInsightPanel;
