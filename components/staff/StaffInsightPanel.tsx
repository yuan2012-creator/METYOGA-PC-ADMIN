import React from 'react';
import type { StaffInsightTip } from './staffOperationViewModel';

const StaffInsightPanel: React.FC<{
  tips: StaffInsightTip[];
  onAction: (key: string) => void;
}> = ({ tips, onAction }) => (
  <section className="met-staff-insights">
    <h2 className="met-staff-insights__title">师资经营建议</h2>
    <div className="met-staff-insights__row">
      {tips.map(tip => (
        <article key={tip.id} className="met-staff-insight-card met-today-surface">
          <div className="met-staff-insight-card__main">
            <span className="met-staff-insight-card__tag">{tip.tag}</span>
            <p className="met-staff-insight-card__line">{tip.line}</p>
          </div>
          <button type="button" className="met-member-btn-sm" onClick={() => onAction(tip.actionKey)}>
            {tip.actionLabel}
          </button>
        </article>
      ))}
    </div>
  </section>
);

export default StaffInsightPanel;
