import React, { useMemo } from 'react';
import {
  FOCUS_GROUP_TITLES,
  type DataFocusGroup,
  type DataFocusItem,
} from './dataCenterOperationViewModel';
import { DataAnalysisChain } from './dataCenterModalShared';

const FOCUS_GROUPS: DataFocusGroup[] = [
  'storeAnomaly',
  'memberRisk',
  'courseTeacher',
  'financeActivity',
];

const QueueBlock: React.FC<{
  group: DataFocusGroup;
  items: DataFocusItem[];
  onViewDetail: (item: DataFocusItem) => void;
  onViewTrend: (item: DataFocusItem) => void;
  onMarkRead: (id: string) => void;
}> = ({ group, items, onViewDetail, onViewTrend, onMarkRead }) => {
  if (!items.length) return null;
  const visible = items.slice(0, 3);
  const rest = items.length - visible.length;
  return (
    <section className="met-data-focus-block">
      <h3 className="met-data-focus-block__title">{FOCUS_GROUP_TITLES[group]}</h3>
      {visible.map(item => (
        <article key={item.id} className="met-data-focus-item">
          <div className="met-data-focus-item__row1">
            <p className="met-data-focus-item__name">{item.title}</p>
            <span className="met-data-focus-item__tag">{item.statusLabel}</span>
          </div>
          <p className="met-data-focus-item__risk">{item.reasonLine}</p>
          <div className="met-data-focus-item__chain">
            <DataAnalysisChain steps={item.analysisChain} compact />
          </div>
          <div className="met-data-focus-item__footer">
            <button type="button" className="met-data-focus-btn" onClick={() => onViewDetail(item)}>
              查看分析
            </button>
            <button type="button" className="met-data-focus-btn" onClick={() => onViewTrend(item)}>
              查看趋势
            </button>
            <button type="button" className="met-data-focus-btn" onClick={() => onMarkRead(item.id)}>
              标记已读
            </button>
          </div>
        </article>
      ))}
      {rest > 0 ? <p className="met-data-focus-block__more">还有 {rest} 条关注项</p> : null}
    </section>
  );
};

const DataCenterFocusPanel: React.FC<{
  items: DataFocusItem[];
  onViewDetail: (item: DataFocusItem) => void;
  onViewTrend: (item: DataFocusItem) => void;
  onMarkRead: (id: string) => void;
}> = ({ items, onViewDetail, onViewTrend, onMarkRead }) => {
  const grouped = useMemo(() => {
    const map = new Map<DataFocusGroup, DataFocusItem[]>();
    FOCUS_GROUPS.forEach(g => map.set(g, []));
    items.forEach(item => {
      const list = map.get(item.group);
      if (list) list.push(item);
    });
    return map;
  }, [items]);

  return (
    <aside className="met-data-focus-panel met-today-surface">
      <header className="met-data-focus-panel__head">
        <h2>分析关注项</h2>
        <p>按趋势异常、门店差异与经营风险提示</p>
      </header>
      <div className="met-data-focus-panel__scroll custom-scroll">
        {items.length === 0 ? (
          <p className="met-data-focus-panel__empty">当前分段暂无关注项</p>
        ) : (
          FOCUS_GROUPS.map(group => (
            <QueueBlock
              key={group}
              group={group}
              items={grouped.get(group) ?? []}
              onViewDetail={onViewDetail}
              onViewTrend={onViewTrend}
              onMarkRead={onMarkRead}
            />
          ))
        )}
      </div>
    </aside>
  );
};

export default DataCenterFocusPanel;
