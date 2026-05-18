import React, { useMemo } from 'react';
import {
  ACTION_GROUP_TITLES,
  type DashboardActionGroup,
  type DashboardActionItem,
} from './dashboardOperationViewModel';
import { DashboardEvidenceChain } from './dashboardModalShared';

const ACTION_GROUPS: DashboardActionGroup[] = [
  'highPriority',
  'memberRenewal',
  'courseSchedule',
  'financeEvidence',
  'review',
];

const QueueBlock: React.FC<{
  group: DashboardActionGroup;
  items: DashboardActionItem[];
  onViewDetail: (item: DashboardActionItem) => void;
  onViewChain: (item: DashboardActionItem) => void;
  onMarkDone: (id: string) => void;
}> = ({ group, items, onViewDetail, onViewChain, onMarkDone }) => {
  if (!items.length) return null;
  const visible = items.slice(0, 3);
  const rest = items.length - visible.length;
  return (
    <section className="met-dashboard-action-block">
      <h3 className="met-dashboard-action-block__title">{ACTION_GROUP_TITLES[group]}</h3>
      {visible.map(item => (
        <article key={item.id} className="met-dashboard-action-item">
          <div className="met-dashboard-action-item__row1">
            <p className="met-dashboard-action-item__name">{item.title}</p>
            <span className="met-dashboard-action-item__tag">{item.statusLabel}</span>
          </div>
          <p className="met-dashboard-action-item__impact">{item.impactLine}</p>
          <p className="met-dashboard-action-item__owner">责任：{item.ownerRole}</p>
          <div className="met-dashboard-action-item__chain">
            <DashboardEvidenceChain steps={item.evidenceChain} compact />
          </div>
          <div className="met-dashboard-action-item__footer">
            <button type="button" className="met-dashboard-action-btn" onClick={() => onViewDetail(item)}>
              查看详情
            </button>
            <button type="button" className="met-dashboard-action-btn" onClick={() => onViewChain(item)}>
              查看链路
            </button>
            <button type="button" className="met-dashboard-action-btn" onClick={() => onMarkDone(item.id)}>
              标记处理
            </button>
          </div>
        </article>
      ))}
      {rest > 0 ? <p className="met-dashboard-action-block__more">还有 {rest} 条待处理</p> : null}
    </section>
  );
};

const DashboardActionPanel: React.FC<{
  items: DashboardActionItem[];
  onViewDetail: (item: DashboardActionItem) => void;
  onViewChain: (item: DashboardActionItem) => void;
  onMarkDone: (id: string) => void;
}> = ({ items, onViewDetail, onViewChain, onMarkDone }) => {
  const grouped = useMemo(() => {
    const map = new Map<DashboardActionGroup, DashboardActionItem[]>();
    ACTION_GROUPS.forEach(g => map.set(g, []));
    items.forEach(item => {
      const list = map.get(item.group);
      if (list) list.push(item);
    });
    return map;
  }, [items]);

  return (
    <aside className="met-dashboard-action-panel met-today-surface">
      <header className="met-dashboard-action-panel__head">
        <h2>今日经营行动区</h2>
        <p>按经营影响优先处理，不按模块堆任务</p>
      </header>
      <div className="met-dashboard-action-panel__scroll custom-scroll">
        {items.length === 0 ? (
          <p className="met-dashboard-action-panel__empty">当前分段暂无行动项</p>
        ) : (
          ACTION_GROUPS.map(group => (
            <QueueBlock
              key={group}
              group={group}
              items={grouped.get(group) ?? []}
              onViewDetail={onViewDetail}
              onViewChain={onViewChain}
              onMarkDone={onMarkDone}
            />
          ))
        )}
      </div>
    </aside>
  );
};

export default DashboardActionPanel;
