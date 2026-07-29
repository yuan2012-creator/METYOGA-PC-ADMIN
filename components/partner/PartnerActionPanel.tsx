import React, { useMemo } from 'react';
import {
  ACTION_GROUP_TITLES,
  type PartnerActionGroup,
  type PartnerActionItem,
} from './partnerOperationViewModel';
import { PartnerGovernanceChain } from './partnerModalShared';

const ACTION_GROUPS: PartnerActionGroup[] = [
  'authExpire',
  'dataAnomaly',
  'qualityFix',
  'brandRisk',
];

const QueueBlock: React.FC<{
  group: PartnerActionGroup;
  items: PartnerActionItem[];
  onViewStore: (item: PartnerActionItem) => void;
  onViewChain: (item: PartnerActionItem) => void;
  onMarkDone: (id: string) => void;
}> = ({ group, items, onViewStore, onViewChain, onMarkDone }) => {
  if (!items.length) return null;
  const visible = items.slice(0, 3);
  const rest = items.length - visible.length;
  return (
    <section className="met-partner-action-block">
      <h3 className="met-partner-action-block__title">{ACTION_GROUP_TITLES[group]}</h3>
      {visible.map(item => (
        <article key={item.id} className="met-partner-action-item">
          <div className="met-partner-action-item__row1">
            <p className="met-partner-action-item__name">{item.title}</p>
            <span className="met-partner-action-item__tag">{item.statusLabel}</span>
          </div>
          <p className="met-partner-action-item__risk">{item.riskLine}</p>
          <div className="met-partner-action-item__chain">
            <PartnerGovernanceChain steps={item.governanceChain} compact />
          </div>
          <div className="met-partner-action-item__footer">
            <button type="button" className="met-partner-action-btn" onClick={() => onViewStore(item)}>
              查看门店
            </button>
            <button type="button" className="met-partner-action-btn" onClick={() => onViewChain(item)}>
              查看链路
            </button>
            <button type="button" className="met-partner-action-btn" onClick={() => onMarkDone(item.id)}>
              标记处理
            </button>
          </div>
        </article>
      ))}
      {rest > 0 ? <p className="met-partner-action-block__more">还有 {rest} 条待处理</p> : null}
    </section>
  );
};

const PartnerActionPanel: React.FC<{
  items: PartnerActionItem[];
  onViewStore: (item: PartnerActionItem) => void;
  onViewChain: (item: PartnerActionItem) => void;
  onMarkDone: (id: string) => void;
}> = ({ items, onViewStore, onViewChain, onMarkDone }) => {
  const grouped = useMemo(() => {
    const map = new Map<PartnerActionGroup, PartnerActionItem[]>();
    ACTION_GROUPS.forEach(g => map.set(g, []));
    items.forEach(item => {
      const list = map.get(item.group);
      if (list) list.push(item);
    });
    return map;
  }, [items]);

  return (
    <aside className="met-partner-action-panel met-today-surface">
      <header className="met-partner-action-panel__head">
        <h2>今日合作治理待办</h2>
        <p>按授权、数据、质检与续约风险优先处理</p>
      </header>
      <div className="met-partner-action-panel__scroll custom-scroll">
        {items.length === 0 ? (
          <p className="met-partner-action-panel__empty">当前分段暂无待办</p>
        ) : (
          ACTION_GROUPS.map(group => (
            <QueueBlock
              key={group}
              group={group}
              items={grouped.get(group) ?? []}
              onViewStore={onViewStore}
              onViewChain={onViewChain}
              onMarkDone={onMarkDone}
            />
          ))
        )}
      </div>
    </aside>
  );
};

export default PartnerActionPanel;
