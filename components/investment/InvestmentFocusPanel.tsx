import React, { useMemo } from 'react';
import {
  FOCUS_GROUP_TITLES,
  type InvestmentFocusGroup,
  type InvestmentFocusItem,
} from './investmentOperationViewModel';
import { InvestmentCalcChain } from './investmentModalShared';

const FOCUS_GROUPS: InvestmentFocusGroup[] = [
  'overspend',
  'costPressure',
  'capacityShort',
  'paybackRisk',
];

const QueueBlock: React.FC<{
  group: InvestmentFocusGroup;
  items: InvestmentFocusItem[];
  onViewDetail: (item: InvestmentFocusItem) => void;
  onViewImpact: (item: InvestmentFocusItem) => void;
  onMarkRead: (id: string) => void;
}> = ({ group, items, onViewDetail, onViewImpact, onMarkRead }) => {
  if (!items.length) return null;
  const visible = items.slice(0, 3);
  const rest = items.length - visible.length;
  return (
    <section className="met-investment-focus-block">
      <h3 className="met-investment-focus-block__title">{FOCUS_GROUP_TITLES[group]}</h3>
      {visible.map(item => (
        <article key={item.id} className="met-investment-focus-item">
          <div className="met-investment-focus-item__row1">
            <p className="met-investment-focus-item__name">{item.title}</p>
            <span className="met-investment-focus-item__tag">{item.statusLabel}</span>
          </div>
          <p className="met-investment-focus-item__risk">{item.reasonLine}</p>
          <div className="met-investment-focus-item__chain">
            <InvestmentCalcChain steps={item.calcChain} compact />
          </div>
          <div className="met-investment-focus-item__footer">
            <button type="button" className="met-investment-focus-btn" onClick={() => onViewDetail(item)}>
              查看测算
            </button>
            <button type="button" className="met-investment-focus-btn" onClick={() => onViewImpact(item)}>
              查看影响
            </button>
            <button type="button" className="met-investment-focus-btn" onClick={() => onMarkRead(item.id)}>
              标记已读
            </button>
          </div>
        </article>
      ))}
      {rest > 0 ? <p className="met-investment-focus-block__more">还有 {rest} 条关注项</p> : null}
    </section>
  );
};

const InvestmentFocusPanel: React.FC<{
  items: InvestmentFocusItem[];
  onViewDetail: (item: InvestmentFocusItem) => void;
  onViewImpact: (item: InvestmentFocusItem) => void;
  onMarkRead: (id: string) => void;
}> = ({ items, onViewDetail, onViewImpact, onMarkRead }) => {
  const grouped = useMemo(() => {
    const map = new Map<InvestmentFocusGroup, InvestmentFocusItem[]>();
    FOCUS_GROUPS.forEach(g => map.set(g, []));
    items.forEach(item => {
      const list = map.get(item.group);
      if (list) list.push(item);
    });
    return map;
  }, [items]);

  return (
    <aside className="met-investment-focus-panel met-today-surface">
      <header className="met-investment-focus-panel__head">
        <h2>投资风险关注项</h2>
        <p>按投入、成本、产能与现金流风险提示</p>
      </header>
      <div className="met-investment-focus-panel__scroll custom-scroll">
        {items.length === 0 ? (
          <p className="met-investment-focus-panel__empty">当前分段暂无关注项</p>
        ) : (
          FOCUS_GROUPS.map(group => (
            <QueueBlock
              key={group}
              group={group}
              items={grouped.get(group) ?? []}
              onViewDetail={onViewDetail}
              onViewImpact={onViewImpact}
              onMarkRead={onMarkRead}
            />
          ))
        )}
      </div>
    </aside>
  );
};

export default InvestmentFocusPanel;
