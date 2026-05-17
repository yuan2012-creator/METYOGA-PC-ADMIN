import React from 'react';
import type { SettingsInsightTip } from './settingsOperationViewModel';

const SettingsInsightPanel: React.FC<{
  tips: SettingsInsightTip[];
  onAction: (key: string) => void;
}> = ({ tips, onAction }) => (
  <section className="met-settings-insights">
    <h2 className="met-settings-insights__title">规则配置建议</h2>
    <div className="met-settings-insights__row">
      {tips.map(tip => (
        <article key={tip.id} className="met-settings-insight-card met-today-surface">
          <div className="met-settings-insight-card__main">
            <span className="met-settings-insight-card__tag">{tip.tag}</span>
            <p className="met-settings-insight-card__line">{tip.line}</p>
          </div>
          <button type="button" className="met-member-btn-sm" onClick={() => onAction(tip.actionKey)}>
            {tip.actionLabel}
          </button>
        </article>
      ))}
    </div>
  </section>
);

export default SettingsInsightPanel;
