import React from 'react';
import type { DashboardInsight } from './dashboardOperationViewModel';

const DashboardInsightPanel: React.FC<{
  tips: DashboardInsight[];
  onAction: (key: string) => void;
}> = ({ tips, onAction }) => (
  <section className="met-dashboard-insights">
    <h2 className="met-dashboard-insights__title">今日经营建议</h2>
    <div className="met-dashboard-insights__row">
      {tips.map(tip => (
        <article key={tip.id} className="met-dashboard-insight-card met-dashboard-surface">
          <div className="met-dashboard-insight-card__main">
            <span className="met-dashboard-insight-card__tag">{tip.tag}</span>
            <p className="met-dashboard-insight-card__line">{tip.line}</p>
            <p className="met-dashboard-insight-card__impact">
              <span>影响</span>
              {tip.impact}
            </p>
            <p className="met-dashboard-insight-card__suggestion">
              <span>建议</span>
              {tip.suggestion}
            </p>
          </div>
          <button type="button" className="met-member-btn-sm" onClick={() => onAction(tip.actionKey)}>
            {tip.actionLabel}
          </button>
        </article>
      ))}
    </div>
  </section>
);

export default DashboardInsightPanel;
