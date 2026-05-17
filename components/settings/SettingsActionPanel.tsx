import React from 'react';
import type { SettingsActionGroup, SettingsActionItem } from './settingsOperationViewModel';
import { SettingsImpactChain } from './settingsModalShared';

const GROUP_TITLES: Record<SettingsActionGroup, string> = {
  conflict: '规则冲突',
  pendingPublish: '待审核发布',
  missing: '缺失配置',
  sensitive: '敏感规则复核',
};

const QueueBlock: React.FC<{
  group: SettingsActionGroup;
  items: SettingsActionItem[];
  onViewRule: (item: SettingsActionItem) => void;
  onViewImpact: (item: SettingsActionItem) => void;
  onMarkDone: (id: string) => void;
}> = ({ group, items, onViewRule, onViewImpact, onMarkDone }) => {
  if (items.length === 0) return null;
  const visible = items.slice(0, 3);
  const rest = items.length - visible.length;
  return (
    <section className="met-settings-action-block">
      <h3 className="met-settings-action-block__title">{GROUP_TITLES[group]}</h3>
      {visible.map(item => (
        <article key={item.id} className="met-settings-action-item">
          <div className="met-settings-action-item__row1">
            <p className="met-settings-action-item__name">{item.title}</p>
            <span className="met-settings-action-item__tag">{item.statusLabel}</span>
          </div>
          <p className="met-settings-action-item__risk">{item.riskLine}</p>
          <div className="met-settings-action-item__chain">
            <SettingsImpactChain steps={item.impactChain} compact />
          </div>
          <div className="met-settings-action-item__footer">
            <button type="button" className="met-settings-action-btn" onClick={() => onViewRule(item)}>
              查看规则
            </button>
            <button type="button" className="met-settings-action-btn" onClick={() => onViewImpact(item)}>
              查看影响
            </button>
            <button type="button" className="met-settings-action-btn" onClick={() => onMarkDone(item.id)}>
              标记处理
            </button>
          </div>
        </article>
      ))}
      {rest > 0 ? <p className="met-settings-action-block__more">还有 {rest} 条待处理</p> : null}
    </section>
  );
};

const SettingsActionPanel: React.FC<{
  conflictItems: SettingsActionItem[];
  pendingItems: SettingsActionItem[];
  missingItems: SettingsActionItem[];
  sensitiveItems: SettingsActionItem[];
  onViewRule: (item: SettingsActionItem) => void;
  onViewImpact: (item: SettingsActionItem) => void;
  onMarkDone: (id: string) => void;
}> = ({
  conflictItems,
  pendingItems,
  missingItems,
  sensitiveItems,
  onViewRule,
  onViewImpact,
  onMarkDone,
}) => (
  <aside className="met-settings-action-panel met-today-surface">
    <header className="met-settings-action-panel__head">
      <h2>今日规则待办</h2>
      <p>优先处理影响权益、预约、财务与权限的规则</p>
    </header>
    <div className="met-settings-action-panel__scroll custom-scroll">
      <QueueBlock group="conflict" items={conflictItems} onViewRule={onViewRule} onViewImpact={onViewImpact} onMarkDone={onMarkDone} />
      <QueueBlock group="pendingPublish" items={pendingItems} onViewRule={onViewRule} onViewImpact={onViewImpact} onMarkDone={onMarkDone} />
      <QueueBlock group="missing" items={missingItems} onViewRule={onViewRule} onViewImpact={onViewImpact} onMarkDone={onMarkDone} />
      <QueueBlock group="sensitive" items={sensitiveItems} onViewRule={onViewRule} onViewImpact={onViewImpact} onMarkDone={onMarkDone} />
    </div>
  </aside>
);

export default SettingsActionPanel;
